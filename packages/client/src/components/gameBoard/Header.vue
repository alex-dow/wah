<template>
<b-row no-gutters class="game-board-header">
  <b-col cols="3" class="p-4">
    <b-input-group prepend="Game ID">
      <b-form-input :value="game.gameId" readonly id="input-gameid-field"/>
      <b-input-group-append>
        <b-button @click="copyGameIdToClipboard"><b-icon :icon="(gameIdCopied)? 'clipboard-data' : 'clipboard'"/></b-button>
      </b-input-group-append>
    </b-input-group>
  </b-col>
  <b-col cols="6" class="text-center p-4">
    <h2>{{ game.title }}</h2>
  </b-col>
  <b-col cols="3" class="text-right p-4">
    <b-dropdown text="Host Commands" v-if="isHost">
      <b-dropdown-item v-b-modal.start-game-modal v-if="gameWaiting">BEGIN!</b-dropdown-item>
      <b-dropdown-item v-b-modal.stop-game-modal>End This Nonsense</b-dropdown-item>
    </b-dropdown>
  </b-col>
</b-row>

</template>

<style lang="scss">
.game-board-header {
  background-color: #eee;
}
</style>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';
import { Get } from 'vuex-pathify';
import { IGameClientState } from '@wah/lib/src/models/game';
import { ISessionState } from '../../store/session/state';
import { GameStatus } from '@wah/lib/src/models/game';

@Component
export default class GameBoardHeader extends Vue {

  @Get('game') readonly game!: IGameClientState;
  @Get('session') readonly session!: ISessionState;

  get isHost(): boolean {
    if (this.game.host && this.session.player) {
      return this.game.host._id == this.session.player._id;
    } else {
      return false;
    }
  }

  get gameWaiting(): boolean {
    return this.game.status === GameStatus.WAITING;
  }

  get gameStarted(): boolean {
    return this.game.status === GameStatus.STARTED;
  }

  gameIdCopied: boolean = false;

  copyGameIdToClipboard() {
    const input: HTMLInputElement = <HTMLInputElement>document.getElementById('input-gameid-field');
    input.select();
    input.setSelectionRange(0, 9999);
    document.execCommand('copy');
    input.setSelectionRange(0, 0);
    input.blur();
    this.gameIdCopied = true;
  }

}


</script>
