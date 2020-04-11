/**
 * WAH Server
 */


// Bootstrap Step 1: Setup logger
import { configure, getLogger } from 'log4js';
configure({
  appenders: {
    'out': { type: 'stdout' }
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'debug'
    }
  }
});
const LOG = getLogger('main');
const signatures = `

 _______   _______   ___   ___ ___    _______   ______
|   _   | |   _   | |   | |   Y   )  |   _   | |   _  \\
|.  1   | |   1___| |.  | |.  1  /   |.  |   | |.  |   |
|.  ____| |____   | |.  | |.  _  \\   |.  |   | |.  |   |
|:  |     |:  1   | |:  | |:  |   \\  |:  1   | |:  |   |
|::.|     |::.. . | |::.| |::.| .  ) |::.. . | |::.|   |
\`---'     \`-------' \`---' \`--- ---'  \`-------' \`--- ---'
                https://psikon.org

`;
LOG.info(signatures)

// Bootstrap Step 2: MongoDB
import mongoose from 'mongoose';
const mongoUri = "mongodb://psikon:root123@127.0.0.1:27017/wah?authSource=wah";

LOG.info('Connecting to MongoDB');
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});


LOG.info('Starting HTTP server');
// Bootstrap Step 3: Start HTTP Server
import WAHServer from './WAHServer';
const wh = new WAHServer();
wh.listen().then(() => {
  LOG.info('Started');
})
.catch((err) => {
  LOG.error(err);
});