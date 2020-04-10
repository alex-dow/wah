export enum Errors {
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  ALREADY_REGISTERED = 'ALREADY_REGISTERED',
  FAILED_TO_SAVE = 'FAILED_TO_SAVE',
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  NOT_THE_HOST = 'NOT_THE_HOST',
  UNKNOWN = 'UNKNOWN',
  DB_ERROR = 'DB_ERROR'
}

export default Errors;

export class WahError extends Error {
  errType: Errors;
  constructor(errType: Errors, errMsg?: string) {
    super(errMsg);
    this.errType = errType;
  }

}