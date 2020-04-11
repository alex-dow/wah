import { default as Player } from '@wah/lib/src/models/player';
// import { IGame, default as Game } from '@wah/lib/src/models/game';
import { startNewGame, GameManager } from '../src/gameManager';
import * as dbHandler from './__globalScripts/testdb';

//const mongoose = require('mongoose');
//const UserModel = require('../../src/models/user');
//const userData = { name: 'TekLoon', gender: 'Male', dob: new Date(), loginUsing: 'Facebook' };

describe('Game Manager', () => {

  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  it('Starts a new game with a given player as host', async () => {


      const player = new Player({ username: 'Player One'});
      await player.save();

      const gm: GameManager = await startNewGame(player, "foo");
      const host = await gm.host();

      expect(host._id.toString()).toBe(player._id.toString());
      expect(host.username).toBe(player.username);

  });

});