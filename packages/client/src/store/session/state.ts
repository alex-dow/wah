import { IPlayer } from '@wah/lib/src/models';

export interface ISessionState {
  joiningGame: boolean;
  inGame: boolean;
  connected: boolean;
  player: IPlayer | null;
  baseUrl: string;
};

export const SessionState: ISessionState = {
  joiningGame: false,
  inGame: false,
  connected: false,
  player: null,
  baseUrl: location.protocol + '//' + location.host
};

