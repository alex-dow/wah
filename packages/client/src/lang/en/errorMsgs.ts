import { Errors } from '@wah/lib';

export default {
  [Errors.USERNAME_TAKEN]: 'Username is already in use',
  [Errors.FAILED_TO_SAVE]: 'An error occurred while saving',
  [Errors.ALREADY_REGISTERED]: 'You are already registered',
  [Errors.PLAYER_NOT_FOUND]: 'Player not found',
  [Errors.GAME_NOT_FOUND]: 'Game not found',
  [Errors.UNKNOWN]: 'An unknown error occurred'
}
