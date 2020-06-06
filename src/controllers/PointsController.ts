import { Request, Response } from 'express';

import knex from '../database/connection';

class PointsController {
  async create (request: Request, response: Response)  {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      state,
      collectItems
    } = request.body;
  
    const trxKnex = await knex.transaction();
  
    const newPoint = {
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      state,
    };

    const createdIds = await trxKnex('collect_points').insert(newPoint);
  
    const collectPointItems = collectItems.map((item_id :number) => {
      return {
        collect_item_id: item_id,
        collect_point_id: createdIds[0],
      }
    });
  
    await trxKnex('collect_point_items').insert(collectPointItems);
  
    await trxKnex.commit();

    return response.json({ 
      id: createdIds[0],
      ...newPoint,
    });
  
  }

  async show(request: Request, response: Response)  {
    const {id} = request.params;

    const point = await knex('collect_points').where('id', id).first();

    if (!point) {
      return response.status(400).json({message: 'Collect point not found.'});
    }

    const items = await knex('collect_items')
    .join('collect_point_items', 'collect_items.id', '=', 'collect_point_items.collect_item_id')
    .where('collect_point_items.collect_point_id', id)
    .select('collect_items.title');

    return response.json({point, items});
  }

  async index(request: Request, response: Response)  {
    const {city, state, items} = request.query;
    
    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('collect_points')
      .join('collect_point_items', 'collect_points.id', '=', 'collect_point_items.collect_point_id')
      .whereIn('collect_point_items.collect_item_id', parsedItems)
      .where('city', String(city))
      .where('state', String(state))
      .distinct()
      .select('collect_points.*');

    return response.json(points);
  }
}
export default PointsController;