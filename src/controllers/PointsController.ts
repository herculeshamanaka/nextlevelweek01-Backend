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
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      state,
    };

    const createdIds = await trxKnex('collect_points').insert(newPoint);
  
    const collectPointItems = collectItems
      .split(',')
      .split((item: string) => Number(item.trim()))
      .map((item_id :number) => {
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

    const serializedPoint = {
        ...point,
        image_url: `http://192.168.0.51:3333/uploads/${point.image}`
    };

    const items = await knex('collect_items')
    .join('collect_point_items', 'collect_items.id', '=', 'collect_point_items.collect_item_id')
    .where('collect_point_items.collect_point_id', id)
    .select('collect_items.title');

    return response.json({point: serializedPoint, items});
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

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.0.51:3333/uploads/${point.image}`
      }
    });

    return response.json(serializedPoints);
  }
}
export default PointsController;