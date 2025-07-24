import { Router, Request, Response, NextFunction } from 'express';
import { getUsers, getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController';

const router = Router();

// Users endpoint (existing)
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUsers(req, res);
  } catch (err) {
    next(err);
  }
});

// Events CRUD
router.get('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getEvents(req, res);
  } catch (err) {
    next(err);
  }
});
router.get('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getEventById(req, res);
  } catch (err) {
    next(err);
  }
});
router.post('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createEvent(req, res);
  } catch (err) {
    next(err);
  }
});
router.put('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateEvent(req, res);
  } catch (err) {
    next(err);
  }
});
router.delete('/events/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteEvent(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
