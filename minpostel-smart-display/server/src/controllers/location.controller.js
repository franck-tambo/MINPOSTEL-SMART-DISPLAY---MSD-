import { sendSuccess, sendError, sendValidationError } from '../utils/response.util.js';
import { query } from '../config/db.config.js';
import logger from '../utils/logger.util.js';
import { store, saveStore, recordActivityLog } from '../utils/store.util.js';


let mockLocations = store.locations;

let nextBuildingId = 100;
let nextFloorId = 200;
let nextRoomId = 300;

const emitLocationUpdate = (req) => {
  saveStore();
  const io = req.app.get('io');
  if (io) {
    io.emit('LOCATIONS_UPDATED', mockLocations);
  }
};

/**
 * GET /api/locations
 * Return complete location hierarchy
 */
export const getLocationsHierarchy = async (req, res) => {
  try {
    try {
      const buildings = await query('SELECT * FROM buildings ORDER BY id ASC');
      const floors = await query('SELECT * FROM floors ORDER BY floor_number ASC');
      const rooms = await query('SELECT * FROM rooms ORDER BY id ASC');
      if (buildings.length > 0) {
        return sendSuccess(res, 'Localisations récupérées', { buildings, floors, rooms });
      }
    } catch (dbErr) {
      logger.warn('MySQL locations query fallback to memory store');
    }
    return sendSuccess(res, 'Localisations récupérées', mockLocations);
  } catch (err) {
    return sendError(res, err.message);
  }
};

/**
 * ============================================================
 * BUILDINGS CONTROLLERS
 * ============================================================
 */
export const createBuilding = async (req, res) => {
  try {
    const { code, name_fr, name_en } = req.body;
    if (!name_fr || !name_en) {
      return sendValidationError(res, 'Le nom en français et en anglais sont requis');
    }
    const finalCode = code || `BLDG_${Date.now()}`;

    try {
      const result = await query(
        'INSERT INTO buildings (code, name_fr, name_en) VALUES (?, ?, ?)',
        [finalCode, name_fr, name_en]
      );
      const newBldg = { id: result.insertId, code: finalCode, name_fr, name_en };
      mockLocations.buildings.push(newBldg);
      emitLocationUpdate(req);
      recordActivityLog({
        action: 'CREATE',
        entity_type: 'BUILDINGS',
        entity_id: newBldg.id,
        description: `Création du bâtiment: "${name_fr}" (${finalCode})`,
        req
      });
      return sendSuccess(res, 'Bâtiment créé avec succès', newBldg, 201);
    } catch (e) {
      const newBldg = { id: nextBuildingId++, code: finalCode, name_fr, name_en };
      mockLocations.buildings.push(newBldg);
      emitLocationUpdate(req);
      recordActivityLog({
        action: 'CREATE',
        entity_type: 'BUILDINGS',
        entity_id: newBldg.id,
        description: `Création du bâtiment: "${name_fr}" (${finalCode})`,
        req
      });
      return sendSuccess(res, 'Bâtiment créé avec succès (Secours)', newBldg, 201);
    }
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateBuilding = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { code, name_fr, name_en } = req.body;

    try {
      await query(
        'UPDATE buildings SET code = COALESCE(?, code), name_fr = ?, name_en = ? WHERE id = ?',
        [code, name_fr, name_en, id]
      );
    } catch (e) {
      // In-memory update
    }

    const bldg = mockLocations.buildings.find(b => b.id === id);
    if (bldg) {
      if (code) bldg.code = code;
      if (name_fr) bldg.name_fr = name_fr;
      if (name_en) bldg.name_en = name_en;
    }

    emitLocationUpdate(req);
    recordActivityLog({
      action: 'UPDATE',
      entity_type: 'BUILDINGS',
      entity_id: id,
      description: `Mise à jour du bâtiment #${id} (${bldg?.name_fr || name_fr || ''})`,
      req
    });
    return sendSuccess(res, 'Bâtiment mis à jour avec succès', bldg);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteBuilding = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const bldg = mockLocations.buildings.find(b => b.id === id);
    try {
      await query('DELETE FROM buildings WHERE id = ?', [id]);
    } catch (e) {
      // In-memory delete
    }

    mockLocations.buildings = mockLocations.buildings.filter(b => b.id !== id);
    mockLocations.floors = mockLocations.floors.filter(f => f.building_id !== id);
    emitLocationUpdate(req);
    recordActivityLog({
      action: 'DELETE',
      entity_type: 'BUILDINGS',
      entity_id: id,
      description: `Suppression du bâtiment: "${bldg?.name_fr || `#${id}`}"`,
      req
    });
    return sendSuccess(res, 'Bâtiment supprimé avec succès');

  } catch (err) {
    return sendError(res, err.message);
  }
};

/**
 * ============================================================
 * FLOORS / GROUND LEVELS CONTROLLERS
 * ============================================================
 */
export const createFloor = async (req, res) => {
  try {
    const { building_id, floor_number, name_fr, name_en } = req.body;
    if (building_id === undefined || floor_number === undefined || !name_fr || !name_en) {
      return sendValidationError(res, 'Tous les champs de l\'étage/niveau sont requis');
    }

    const bId = parseInt(building_id, 10);
    const fNum = parseInt(floor_number, 10);

    try {
      const result = await query(
        'INSERT INTO floors (building_id, floor_number, name_fr, name_en) VALUES (?, ?, ?, ?)',
        [bId, fNum, name_fr, name_en]
      );
      const newFloor = { id: result.insertId, building_id: bId, floor_number: fNum, name_fr, name_en };
      mockLocations.floors.push(newFloor);
      emitLocationUpdate(req);
      return sendSuccess(res, 'Étage/Niveau créé avec succès', newFloor, 201);
    } catch (e) {
      const newFloor = { id: nextFloorId++, building_id: bId, floor_number: fNum, name_fr, name_en };
      mockLocations.floors.push(newFloor);
      emitLocationUpdate(req);
      return sendSuccess(res, 'Étage/Niveau créé avec succès (Secours)', newFloor, 201);
    }
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateFloor = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { floor_number, name_fr, name_en, building_id } = req.body;

    if (!name_fr || !name_en) {
      return sendValidationError(res, 'Le nom français et anglais de l\'étage sont obligatoires');
    }

    const fNum = floor_number !== undefined ? parseInt(floor_number, 10) : undefined;
    const bId = building_id !== undefined ? parseInt(building_id, 10) : undefined;

    try {
      await query(
        'UPDATE floors SET floor_number = COALESCE(?, floor_number), name_fr = ?, name_en = ?, building_id = COALESCE(?, building_id) WHERE id = ?',
        [fNum, name_fr, name_en, bId, id]
      );
    } catch (e) {
      // In-memory update
    }

    const floor = mockLocations.floors.find(f => f.id === id);
    if (floor) {
      if (fNum !== undefined) floor.floor_number = fNum;
      if (name_fr) floor.name_fr = name_fr;
      if (name_en) floor.name_en = name_en;
      if (bId !== undefined) floor.building_id = bId;
    }

    emitLocationUpdate(req);
    return sendSuccess(res, 'Étage/Niveau mis à jour avec succès', floor);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteFloor = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    try {
      await query('DELETE FROM floors WHERE id = ?', [id]);
    } catch (e) {
      // In-memory delete
    }

    mockLocations.floors = mockLocations.floors.filter(f => f.id !== id);
    mockLocations.rooms = mockLocations.rooms.filter(r => r.floor_id !== id);
    emitLocationUpdate(req);
    return sendSuccess(res, 'Étage/Niveau supprimé avec succès');
  } catch (err) {
    return sendError(res, err.message);
  }
};

/**
 * ============================================================
 * ROOMS / CONFERENCE ROOMS / HALLS CONTROLLERS
 * ============================================================
 */
export const createRoom = async (req, res) => {
  try {
    const { floor_id, room_number, name_fr, name_en, capacity, type } = req.body;
    if (!floor_id || !room_number || !name_fr || !name_en) {
      return sendValidationError(res, 'L\'étage, le numéro de salle et les noms bilingues sont obligatoires');
    }

    const fId = parseInt(floor_id, 10);
    const cap = parseInt(capacity || 0, 10);
    const roomType = type || 'MEETING';

    try {
      const result = await query(
        'INSERT INTO rooms (floor_id, room_number, name_fr, name_en, capacity) VALUES (?, ?, ?, ?, ?)',
        [fId, room_number, name_fr, name_en, cap]
      );
      const newRoom = { id: result.insertId, floor_id: fId, room_number, name_fr, name_en, capacity: cap, type: roomType };
      mockLocations.rooms.push(newRoom);
      emitLocationUpdate(req);
      return sendSuccess(res, 'Salle / Espace créé avec succès', newRoom, 201);
    } catch (e) {
      const newRoom = { id: nextRoomId++, floor_id: fId, room_number, name_fr, name_en, capacity: cap, type: roomType };
      mockLocations.rooms.push(newRoom);
      emitLocationUpdate(req);
      return sendSuccess(res, 'Salle / Espace créé avec succès (Secours)', newRoom, 201);
    }
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateRoom = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { floor_id, room_number, name_fr, name_en, capacity, type } = req.body;

    if (!room_number || !name_fr || !name_en) {
      return sendValidationError(res, 'Le numéro de salle et les noms bilingues sont obligatoires');
    }

    const cap = capacity !== undefined ? parseInt(capacity, 10) : undefined;
    const fId = floor_id ? parseInt(floor_id, 10) : undefined;
    const roomType = type || 'MEETING';

    try {
      await query(
        'UPDATE rooms SET room_number = ?, name_fr = ?, name_en = ?, capacity = COALESCE(?, capacity), floor_id = COALESCE(?, floor_id) WHERE id = ?',
        [room_number, name_fr, name_en, cap, fId, id]
      );
    } catch (e) {
      // In-memory update
    }

    const room = mockLocations.rooms.find(r => r.id === id);
    if (room) {
      room.room_number = room_number;
      room.name_fr = name_fr;
      room.name_en = name_en;
      if (cap !== undefined) room.capacity = cap;
      if (fId !== undefined) room.floor_id = fId;
      if (type) room.type = roomType;
    }

    emitLocationUpdate(req);
    return sendSuccess(res, 'Salle / Espace mis à jour avec succès', room);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateRoomCapacity = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { capacity } = req.body;

    if (capacity === undefined || isNaN(capacity)) {
      return sendValidationError(res, 'Capacité invalide');
    }

    const cap = parseInt(capacity, 10);

    try {
      await query('UPDATE rooms SET capacity = ? WHERE id = ?', [cap, id]);
    } catch (e) {
      // In-memory update
    }

    const room = mockLocations.rooms.find(r => r.id === id);
    if (room) {
      room.capacity = cap;
    }

    emitLocationUpdate(req);
    return sendSuccess(res, `Capacité mise à jour : ${cap} places`, room);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    try {
      await query('DELETE FROM rooms WHERE id = ?', [id]);
    } catch (e) {
      // In-memory delete
    }

    mockLocations.rooms = mockLocations.rooms.filter(r => r.id !== id);
    emitLocationUpdate(req);
    return sendSuccess(res, 'Salle / Espace supprimé avec succès');
  } catch (err) {
    return sendError(res, err.message);
  }
};
