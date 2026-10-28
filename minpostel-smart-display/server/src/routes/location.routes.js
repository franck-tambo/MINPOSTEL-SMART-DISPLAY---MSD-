import { Router } from 'express';
import {
  getLocationsHierarchy,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  createFloor,
  updateFloor,
  deleteFloor,
  createRoom,
  updateRoom,
  updateRoomCapacity,
  deleteRoom
} from '../controllers/location.controller.js';

const router = Router();

// Hierarchy Read
router.get('/', getLocationsHierarchy);

// Buildings CRUD
router.post('/buildings', createBuilding);
router.put('/buildings/:id', updateBuilding);
router.delete('/buildings/:id', deleteBuilding);

// Floors & Ground Levels CRUD
router.post('/floors', createFloor);
router.put('/floors/:id', updateFloor);
router.delete('/floors/:id', deleteFloor);

// Rooms, Conference Rooms & Halls CRUD
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.patch('/rooms/:id/capacity', updateRoomCapacity);
router.delete('/rooms/:id', deleteRoom);

export default router;
