<template>
<div>
  <b-row no-gutters class="bg-dark text-light ">
    <b-col cols="4" align-self="center">
      <table class="table table-dark table-borderless table-sm mb-0">
        <tbody>
          <tr>
            <th scope="row">Game ID:</th>
            <td>{{ gameId }}</td>
          </tr>
          <tr>
            <th scope="row">Host:</th>
            <td> {{ hostPlayer ? hostPlayer.username : '' }} </td>
          </tr>
        </tbody>
      </table>
    </b-col>
    <b-col cols="8" align-self="center" class="text-right pr-2">
      <b-button @click="stopGame" v-if="isHosting" variant="danger">Stop Game</b-button>
      <b-button @click="leaveGame" v-else variant="danger">Run Away</b-button>
    </b-col>
  </b-row>
  <b-row no-gutters>

    <b-col cols="3" class="players">
      <b-list-group v-if="game">
        <player v-for="player in leftPlayers" :key="player._id" :player="player"/>
      </b-list-group>
    </b-col>
    <b-col cols="6" class="center-board p-3">
      <cah-cards :cards="4" size="lg" black/>
    </b-col>
    <b-col cols="3" class="players">
      <b-list-group>
        <player v-for="player in rightPlayers" :key="player._id" :player="player"/>
      </b-list-group>
    </b-col>
  </b-row>
</div>
</template>
<style lang="scss">
.game-board {
  height: auto;
  overflow: auto;
}

</style>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Get } from 'vuex-pathify';
import { IGame, IPlayer } from '@wah/lib/src/models';

import Player from '../components/Player.vue';
import CahCards from '../components/CahCards.vue';
import { Events } from '@wah/lib';

@Component({
  components: {
    CahCards,
    Player
  }
})
export default class GameBoard extends Vue {
  @Get('game@gameId') gameId!: string;
  @Get('game') game!: IGame;
  @Get('game@hostPlayer') hostPlayer!: IPlayer;
  @Get('player') player!: IPlayer;
  @Get('joiningGame') joiningGame!: boolean;

  totalCards = 4;

  get leftPlayers () {
    if (this.game) {
      return this.game.players.slice(0, 3);
    }
    return [];
  }

  get rightPlayers () {
    if (this.game) {
      return this.game.players.slice(3, 6);
    }
    return [];
  }

  get isHosting () {
    return (this.game && this.game.hostPlayer._id === this.player._id);
  }

  stopGame () {
    this.$socket.client.emit(Events.STOP_GAME, this.gameId);
  }

  leaveGame () {
    this.$socket.client.emit(Events.LEAVE_GAME, this.gameId);
  }
}
</script>
