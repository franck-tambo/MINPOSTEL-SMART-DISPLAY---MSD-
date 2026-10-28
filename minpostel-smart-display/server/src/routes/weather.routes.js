import { Router } from 'express';
import { getYaoundeWeather, validateGoogleWeatherKey } from '../services/weather.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

const router = Router();

/**
 * GET /api/weather
 * Returns accurate real-time weather for Yaoundé (Cameroon)
 */
router.get('/', async (req, res) => {
  try {
    const forceRefresh = req.query.force === 'true';
    const weather = await getYaoundeWeather(forceRefresh);
    return sendSuccess(res, 'Météo en direct récupérée avec succès', weather);
  } catch (err) {
    return sendError(res, 'Impossible de récupérer la météo', 500, err.message);
  }
});

/**
 * POST /api/weather/validate-key
 * Tests a Google Weather API Key directly against Google's servers
 */
router.post('/validate-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const result = await validateGoogleWeatherKey(apiKey);
    return sendSuccess(res, 'Vérification de la clé Google Weather API terminée', result);
  } catch (err) {
    return sendError(res, 'Erreur lors de la validation de la clé Google', 500, err.message);
  }
});

export default router;
