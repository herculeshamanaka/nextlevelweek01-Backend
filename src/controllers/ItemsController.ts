import { Request, Response } from 'express';

import knex from '../database/connection';

// Methods: index (show all), show (only one), create, update, delete

class ItemsController {
  async index(request: Request, response: Response) {
    const collectItems = await knex('collect_items').select('*');
  
    const serializedCollectItems = collectItems.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://localhost:3333/uploads/${item.image}`,
      };
    });
    
    return response.json(serializedCollectItems);
  
  }
};

export default ItemsController;