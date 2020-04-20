<template>
<b-modal id="join-game-modal"
  @show="onShow"
  @ok="onSubmit"
  centered
  title="Join a Game"
  ok-title="JOIN"
  ok-variant="danger"
  cancel-title="Run Away">

<b-form @submit.prevent="onSubmit">
  <b-form-group
    id="game-id-group"
    label="Game ID"
    label-for="game-id-input"
    description="Ask someone for a game ID. Pay whatever they charge you.">

    <b-form-input
      id="game-id-input"
      v-model="form.gameId"/>
  </b-form-group>
</b-form>

</b-modal>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';
import { SessionEvents } from '@wah/lib';
import { ClientSessionEvents } from '@wah/lib';

@Component
export default class JoinGameModal extends Vue {

  form = {
    gameId: ''
  }

  joining = false;

  @Socket(SessionEvents.GAME)
  onJoinGame (): void {
    this.$bvModal.hide('join-game-modal');
  }

  onShow (): void {
    this.form.gameId = '';
    this.joining = false;
    const el = document.getElementById('game-id-input');
    if (el) el.focus();
  }

  onSubmit (): void {
    this.joining = true;
    this.$socket.client.emit(ClientSessionEvents.JOIN_GAME, this.form.gameId);
  }
}

</script>
