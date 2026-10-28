import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user.model.js';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';
import { recordActivityLog } from '../utils/store.util.js';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'msd_ephemeral_fallback_secret_key_2026';
}

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendValidationError(res, 'Identifiant et mot de passe requis / Username and password required');
    }

    let user = null;
    try {
      user = await UserModel.findByUsername(username);
    } catch (err) {
      logger.warn(`Database unreachable during login check: ${err.message}`);
    }

    let isValid = false;

    if (user) {
      isValid = await bcrypt.compare(password, user.password_hash);
      // Fallback for initial demo seed password
      if (!isValid && password === 'admin123' && username === 'admin') {
        isValid = true;
      }
    } else if (username === 'admin' && password === 'admin123') {
      // Fallback demo admin user when DB is not yet populated
      user = {
        id: 1,
        username: 'admin',
        email: 'admin@minpostel.gov.cm',
        full_name: 'Administrateur Principal MINPOSTEL',
        role_id: 1,
        role_name: 'SUPER_ADMIN'
      };
      isValid = true;
    }

    if (!isValid || !user) {
      recordActivityLog({
        action: 'FAILED_LOGIN',
        entity_type: 'SECURITY',
        description: `Tentative de connexion échouée avec l'identifiant: "${username}"`,
        user: username || 'inconnu',
        req
      });
      return sendError(res, 'Identifiants invalides / Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role_name: user.role_name },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h', algorithm: 'HS256' }
    );

    // Set HttpOnly Secure Cookie
    res.cookie('msd_token', token, {
      httpOnly: true,
      secure: false, // Local HTTP test
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 Hours
    });

    try {
      await UserModel.updateLastLogin(user.id);
    } catch (e) {
      // Ignore if DB offline
    }

    logger.info(`User authenticated: ${user.username}`);

    recordActivityLog({
      action: 'LOGIN',
      entity_type: 'USER',
      description: `Connexion réussie au panneau d'administration (${user.full_name || user.username})`,
      user: user.username,
      req
    });

    return sendSuccess(res, 'Connexion réussie / Login successful', {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role_name: user.role_name
      },
      token
    });
  } catch (err) {
    logger.error('Login controller error:', err);
    return sendError(res, 'Erreur de connexion / Login error', 500);
  }
};

export const logout = (req, res) => {
  res.clearCookie('msd_token');
  return sendSuccess(res, 'Déconnexion réussie / Logout successful');
};

export const getCurrentUser = (req, res) => {
  return sendSuccess(res, 'Profil utilisateur récupéré / User profile retrieved', {
    user: req.user
  });
};
