import { Application } from 'express';
import { getLogger } from 'log4js';
import { Model, Document } from 'mongoose';

import Player from '@wah/lib/src/models/player';
import Game from '@wah/lib/src/models/game';


const LOG = getLogger('api');

async function getAllModels<D extends Document>(model: Model<D>): Promise<D[]> {
  const players = await model.find();
  console.log(players);
  return players;
}

async function createModel<D extends Document>(obj: any, model: Model<D>): Promise<D> {
  const m = new model(obj);
  await m.save();
  return m;
}

function createCrudRoutes<D extends Document>(app: Application, model: Model<D>, name: string): void {
  app.route('/api/' + name)
    .get(async(req, res) => {
      try {
        const list = await getAllModels(model);
        res.status(200).json(list);
      } catch (err) {
        LOG.error(err);
        res.status(500).json(err);
      }
    })
    .post(async (req, res) => {
      try {
        const newModel = await createModel(req.body, model);
        res.status(200).json(newModel);
      } catch (err) {
        LOG.error(err);
        res.status(500).json(err);
      }
    });
}

export default function(app: Application): void {

  createCrudRoutes(app, Player, 'players');
  createCrudRoutes(app, Game, 'games');

}