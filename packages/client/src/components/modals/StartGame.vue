<template>
<b-modal id="start-game-modal"
  @show="onShow"
  @ok="onSubmit"
  centered
  title="Start the Horror Show"
  ok-title="LET'S DO THIS!"
  ok-variant="danger"
  cancel-title="Nonono, this was a huge mistake">

<p>To get this into high gear, pick the first presenter.</p>
<b-form @submit.prevent="onSubmit">
  <b-form-group id="input-userlist-group"
    label="Select a Player"
    label-for="input-userlist-field"
    :description="currentCriteria">
    <b-form-select v-model="selectedPlayer" :options="playerOptions"/>
  </b-form-group>
</b-form>

</b-modal>

</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';
import { Get } from 'vuex-pathify';
import { IGameClientState } from '@wah/lib/src/models/game';

@Component
export default class StartGameModal extends Vue {


  criteria = [
    'Pick the person with the most stage fright',
    'Pick the person who last pooped',
    'Pick the person who last took a drink',
    'Pick the person with the most menacing stare',
    'Pick the person who is most likely to cause an environmental catastrophe with their farts',
    'Pick the person who is most likely to cause a serious international incident',
    'Pick the person who is most likely to get drunk before this is over',
    'Pick the person who is most likely going to get up on stage and dance... during a Michael Flatley show',
    'Pick the person who is most likely going to spoil the ending of Titantic for you'
  ]

  selectedPlayer = ''

  currentCriteria = ''

  get playerOptions(): Array<any> {
    if (this.game.players) {
      return this.game.players.map((p) => {
        return {
          value: p._id,
          text: p.username
        }
      });
    } else {
      return [];
    }
  }

  @Get('game') readonly game!: IGameClientState;

  onShow(): void {
    this.currentCriteria = this.criteria[Math.floor(Math.random() * this.criteria.length)];
  }

  onSubmit(): void {
    '';
  }

}

</script>