import { ISessionState } from './state';
import { IPlayer } from '@wah/lib/src/models';

export function SOCKET_SESSION_PLAYER(state: ISessionState, player: IPlayer) {
  state.player = player;
}

export function SOCKET_SESSION_CONNECTED (state: ISessionState, player: IPlayer | undefined): void {
  state.connected = true;
  if (player) {
    state.player =  player;
  }
}

export function SOCKET_DISCONNECT (state: ISessionState): void {
  state.connected = false;
  state.player = null;
}