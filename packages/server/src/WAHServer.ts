import * as express from 'express';
import * as socketio from 'socket.io';
import { createServer, Server } from 'http';
import session from 'express-session';
import { getLogger, Logger } from 'log4js';
import * as cors from "cors";
import * as bodyParser from "body-parser";

import modelRouter from './routes/modelRoutes';
import sessionRouter from './routes/sessionRoutes';

// import { onConnect } from './eventHandlers/session';

import MongoDBStore = require('connect-mongodb-session');
// import { default as MongoDBStore } from 'connect-mongodb-session';
// var MongoDBStore = require('connect-mongodb-session')(session);
import { SocketsManager } from './socketsManager';

class WAHServer {
  private _app: express.Application;
  private server: Server;
  private port: number;
  private io: socketio.Server;
  private LOG: Logger = getLogger('WAHServer');
  private sessionName = 'WAHSID';
  private sessionSecret = 'whablegable';

  private socksManager: SocketsManager;

  constructor() {
    this._app = express.default();

    const mongodbSess = MongoDBStore(session);
    const store = new mongodbSess({
      uri: 'mongodb://psikon:root123@127.0.0.1:27017/wah',
      collection: 'sessions',
      databaseName: 'wah'
    });

    const sess = session({
      secret: this.sessionSecret,
      resave: true,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: false,
        expires: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
      },
      name: this.sessionName,
      store: store
    });

    this._app.use(sess);
    this._app.use(cors.default());
    this._app.use(bodyParser.json());

    this.port = 3000;
    this.server = createServer(this._app);
    this.io = socketio.default(this.server);

    //transports: ['websocket']

    this.io.use((socket: socketio.Socket, next) => {
      sess(socket.request, socket.request.res, next);
    });

    // this.io.on('connect', onConnect);



    sessionRouter(this._app);
    modelRouter(this._app);

    this.socksManager = new SocketsManager(this.io);
  }



  public async listen(): Promise<WAHServer> {
    this.LOG.info('Initialiting sockets manager');
    await this.socksManager.init();
    this.server.listen(this.port, () => {
      this.LOG.info('Server listening on port', this.port);
    });

    return this;
  }
}

export default WAHServer;