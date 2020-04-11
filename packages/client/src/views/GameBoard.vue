<template>
<div>
  <b-row no-gutters class="bg-dark text-light">
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
      <player :player="player"/>
      <player :player="player"/>
    </b-col>
    <b-col cols="6" class="center-board p-3">
      <waiting-to-start  v-if="waitingToStart"/>
      <b-row v-else>
        <b-col cols="6">
          <h4>Pick a Black Card</h4>
          <cah-cards :cards="3" size="md" black/>
        </b-col>
        <b-col cols="6">
          <h4>Pick a White Card</h4>
          <cah-cards :cards="3" size="md" white/>
        </b-col>
      </b-row>
    </b-col>
    <b-col cols="3" class="players">
      <b-list-group>
        <player v-for="player in rightPlayers" :key="player._id" :player="player"/>
      </b-list-group>
      <player :player="player" left/>
      <player :player="player" left/>
      <player :player="player" left/>
    </b-col>
  </b-row>
  <b-row no-gutters>
    <b-col cols="12">
      <cah-cards :cards="10" size="sm" white front/>
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
import CahCard from '../components/CahCard.vue';
import WaitingToStart from '../components/gameBoard/WaitingToStart.vue';
import { Events } from '@wah/lib';
import { Socket } from 'vue-socket.io-extended';

@Component({
  components: {
    CahCards,
    CahCard,
    Player,
    WaitingToStart
  }
})
export default class GameBoard extends Vue {
  @Get('game@gameId') gameId!: string;
  @Get('game') game!: IGame;
  @Get('game@host') hostPlayer!: IPlayer;
  @Get('player') player!: IPlayer;
  @Get('joiningGame') joiningGame!: boolean;

  totalCards = 4;

  waitingToStart = true;

  get leftPlayers (): Array<IPlayer> {
    if (this.game) {
      return this.game.players.slice(0, 3);
    }
    return [];
  }

  get rightPlayers (): Array<IPlayer> {
    if (this.game) {
      return this.game.players.slice(3, 6);
    }
    return [];
  }


  get isHosting () {
    return (this.game && this.game.host._id === this.player._id);
  }

  stopGame () {
    this.$socket.client.emit(Events.STOP_GAME, this.gameId);
  }

  leaveGame () {
    this.$socket.client.emit(Events.LEAVE_GAME, this.gameId);
  }

  @Socket(Events.PLAYER_LEFT)
  onPlayerLeft(player: IPlayer): void {
    this.$bvToast.toast(`${player.username} RAGE QUIT!!!!`, {
      title: 'RAGE QUITTER ALTERT',
      variant: 'danger'
    });
  }
}
</script>
