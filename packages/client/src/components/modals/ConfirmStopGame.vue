<template>
<b-modal id="stop-game-modal"
  @show="onShow"
  @ok="onSubmit"
  centered
  title="End this Nonsense"
  ok-title="YES! This is so wrong, gotta stop before it gets worse!"
  ok-variant="danger"
  cancel-title="NO! I'm commited to seeing this to the very end!">

Really? You want to stop the game?

</b-modal>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';
import { SessionEvents, GameEvents, ClientGameEvents, ClientGameEventPayload, IGameClientState } from '@wah/lib';

@Component
export default class ConfirmStopGameModal extends Vue {

  stopping = false;

  @Socket(GameEvents.GAME_STOPPED)
  onGameStopped (): void {
    this.$bvModal.hide('stop-game-modal');
  }

  onShow (): void {
    this.stopping = false;
  }

  get game(): IGameClientState {
    return this.$store.state.game;
  }

  onSubmit (): void {
    this.stopping = true;
    const payload: ClientGameEventPayload = {
      gameId: this.game.gameId,
      data: null
    };
    this.$socket.client.emit(ClientGameEvents.STOP_GAME, payload);
    // this.$socket.client.emit(ClientEvents.STOP_GAME, this.$store.state.game.gameId);
  }
}

</script>
