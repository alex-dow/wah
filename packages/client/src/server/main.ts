const createServer = require('./createServer');

const server = createServer();
server.listen(3000, () => {
  console.log('listening on *:3000');
});

