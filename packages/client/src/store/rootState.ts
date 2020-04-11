import { IPlayer, IGame } from '@wah/lib/src/models';

export interface RootState {
  player: IPlayer | null;
  game: IGame | null;
  connected: boolean;
  sessionStarted: boolean;
  joiningGame: boolean;
  inGame: boolean;
  disconnectedPlayers: Array<IPlayer>;
  baseUrl: string;
}