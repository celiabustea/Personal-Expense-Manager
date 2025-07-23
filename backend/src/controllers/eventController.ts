import { AppDataSource } from '@config/database';
import { Users, Event } from '../entities/eventSchema';
import { Response, Request } from 'express';

export const getUsers = async (_: Request, res: Response): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const users = await AppDataSource.getRepository(Users).find();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err });
  }
};

// CRUD for Event entity
export const getEvents = async (_: Request, res: Response): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const events = await AppDataSource.getRepository(Event).find();
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events', details: err });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const event = await AppDataSource.getRepository(Event).findOneBy({ id: Number(req.params.id) });
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.status(200).json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to fetch event', details: err });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const event = AppDataSource.getRepository(Event).create(req.body);
    const result = await AppDataSource.getRepository(Event).save(event);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event', details: err });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Event);
    let event = await repo.findOneBy({ id: Number(req.params.id) });
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    repo.merge(event, req.body);
    const result = await repo.save(event);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event', details: err });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Event);
    const event = await repo.findOneBy({ id: Number(req.params.id) });
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    await repo.remove(event);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event', details: err });
  }
};
