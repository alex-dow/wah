import { Application } from 'express';
import { Register } from '@wah/lib/src/requests/register';
import Errors from '@wah/lib/src/errors';
import Player from '@wah/lib/src/models/player';
import player from '@wah/lib/src/models/player';
import { Logger, getLogger } from 'log4js';

const LOG: Logger = getLogger('sessionApi');

export default function(app: Application): void {

  app.route('/api/session')
    .get((req, res) => {
      res.status(200).json({
        username: req.session?.username,
        expires: req.session?.cookie.expires
      });
    });

  app.route('/api/session/register')
    .post(async (req, res) => {
      const body: Register = req.body;

      if (req.session?.username) {
        LOG.error(`${req.session.username} is already reigstered`);
        res.status(409).json({ err: Errors.ALREADY_REGISTERED });
        return;
      }

      try {
        const p = new Player(body);
        await p.save();
        if (req.session) {
          req.session.username = p.username;
        }
        res.status(204).send();
      } catch (err) {
        LOG.error(err);
        if (err.code) {
          if (err.code === 11000) {
            res.status(409).json({ err: Errors.USERNAME_TAKEN });
            return;
          }
        }
        res.status(500).json(err);
      }
    });
}