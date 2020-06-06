import Knex from 'knex';

export async function seed(knex: Knex) {
  await knex('collect_items').insert([
    {title: 'Lamps', image: 'lampadas.svg'},
    {title: 'Batteries', image: 'baterias.svg'},
    {title: 'Paper and Paperboard', image: 'papeis-papelao.svg'},
    {title: 'Electronic Waste ', image: 'eletronicos.svg'},
    {title: 'Organic Waste', image: 'organicos.svg'},
    {title: 'Kitchen Oil', image: 'oleo.svg'},
  ]);
}