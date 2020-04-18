<template>
<b-row id="game-selection">
  <b-col>
    <p>
      Welcome back <strong>{{ (player)? player.username : ''}}</strong>. I wrote your name in bold, feel important now?
    </p>
    <p>
      Now, obviously, you're here to do something. So either click on the "Join Game" or "Start New Game" buttons to do just that.
    </p>
    <b-button variant="outline-primary" v-b-modal.join-game-modal>Join Game</b-button>
    <b-button variant="primary" v-b-modal.new-game-modal>Start New Game</b-button>
  </b-col>
</b-row>
</template>
<style lang="scss">
#game-selection {
  padding: 4rem;
}
</style>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Get } from 'vuex-pathify';
import { IPlayer } from '@wah/lib/src/models/player';

@Component
export default class GameSelectionView extends Vue {
  @Get('session/player') player!: IPlayer;
}
</script>
