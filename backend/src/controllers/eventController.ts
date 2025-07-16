import { Users } from '../entities/eventSchema';
import dataSource from '@config/database';
import { Response, Request, NextFunction } from 'express';

const getUsers = async (_: Request, response: Response, next: NextFunction) => {
  try {
    const users = await dataSource
      .createQueryBuilder()
      .select('users')
      .from(Users, 'users')
      .getMany();
    response.status(200).json(users);
  } catch (err) {
    console.log(typeof err);
    console.log(err);
  }
};

export default { getUsers };
