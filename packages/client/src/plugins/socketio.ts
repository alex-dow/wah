import Vue from 'vue';
import VueSocketIo from 'vue-socket.io-extended';
import { connect as io  } from 'socket.io-client';
import store from '../store';

console.log('socketio plugin file:', location.protocol, location.host, location.port);

const socket = io(location.protocol + '//' + location.host, {
  autoConnect: false
});

Vue.use(VueSocketIo, socket, { store });
