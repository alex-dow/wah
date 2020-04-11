<template>
<b-modal
  id="new-game-modal"
  @show="onShow"
  @ok="onSubmit"
  centered
  :title="'Start a ' + modalTitle + ' Game'"
  ok-title="START"
  ok-variant="danger"
  cancel-title="Run Away">

<b-form @submit="onSubmit">
  <b-form-group
    id="game-title-group"
    label="Game Title"
    label-for="game-title-input"
    description="Show how edgy you think you are with a custom title"
    :disabled="startingGame">

    <b-form-input
      id="game-title-input"
      ref="game-title-input"
      v-model="form.gameTitle"
      placeholder="Whatever Against Humanity"/>
  </b-form-group>
</b-form>

</b-modal>
</template>

<script lang="ts">

import { Vue, Component, Watch } from 'vue-property-decorator';
import { Events } from '@wah/lib';
import { IGame } from '@wah/lib/src/models';
import { NewGameRequest } from '@wah/lib/src/requests/newGameRequest';
import { Socket } from 'vue-socket.io-extended';

@Component
export default class NewGameModal extends Vue {

  verbs = [
    'Glorious',
    'Grand',
    'Incredible',
    'Sultry',
    'Provocative',
    'Serious',
    'Ridiculous',
    'Steamy',
    'Wharblegarble'
  ];

  form = {
    gameTitle: ''
  }
  startingGame = false;

  modalTitle = 'Whatever';

  @Socket(Events.JOIN_GAME)
  @Socket(Events.GAME_STARTED)
  onJoinGame (): void {
    this.$bvModal.hide('new-game-modal');
  }

  onShow (): void {
    this.form.gameTitle = '';
    this.modalTitle = this.verbs[Math.floor(Math.random() * this.verbs.length)];
  }

  onSubmit (): void {

    this.startingGame = true;

    const game = this.form.gameTitle === '' ? 'Whatever Against Humanity' : this.form.gameTitle;

    this.$socket.client.emit(Events.START_NEW_GAME, game);

  }
}

</script>
