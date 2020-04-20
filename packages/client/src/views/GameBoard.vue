<template>
<b-row no-gutters>
  <b-col cols="12">
    <game-board-header />
  </b-col>
  <b-col cols="12">
    <b-row no-gutters>

      <b-col cols="3" class="players">
        <b-list-group v-if="game">
          <player-card v-for="player in leftPlayers" :key="player._id" :player="player"/>
        </b-list-group>
      </b-col>
      <b-col cols="6" class="center-board p-3">
        <b-row>
          <b-col cols="6" class="text-center">
            <h5>White Pile</h5>
            <cah-cards :noOfCards="3" size="md" white stacked @click.native.prevent="addWhiteCard" />
            <p>
              Cards Remaining: {{ game.remainingWhiteCards }}
            </p>
          </b-col>
          <b-col cols="6" class="text-center">
            <h5>Black Pile</h5>
            <cah-cards :noOfCards="3" size="md" black stacked />
            <p>
              Cards Remaining: {{ game.remainingBlackCards }}
            </p>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="3" class="players">
        <b-list-group>
          <player-card v-for="player in rightPlayers" :key="player._id" :player="player"/>
        </b-list-group>
      </b-col>
    </b-row>
    <game-board-player-hand />
  </b-col>
</b-row>
</template>
<style lang="scss">
.game-board {
  height: auto;
  overflow: auto;
}

</style>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Get } from 'vuex-pathify';
import { IPlayer } from '@wah/lib';
import { IGameClientState } from '@wah/lib';
import PlayerCard from '../components/gameBoard/PlayerCard.vue';
import CahCards from '../components/CahCards.vue';
import CahCard from '../components/CahCard.vue';
import WaitingToStart from '../components/gameBoard/WaitingToStart.vue';
import { Events, PlayerEvents } from '@wah/lib';
import { Socket } from 'vue-socket.io-extended';
import GameBoardHeader from '../components/gameBoard/Header.vue';
import GameBoardPlayerHand from '../components/gameBoard/PlayerHand.vue';
import { ClientGameEvents, ClientGameEventPayload } from '@wah/lib/src/events'

@Component({
  components: {
    CahCards,
    CahCard,
    PlayerCard,
    WaitingToStart,
    GameBoardHeader,
    GameBoardPlayerHand
  }
})
export default class GameBoardView extends Vue {
  @Get('game@gameId') gameId!: string;
  @Get('game') game!: IGameClientState;
  @Get('game@host') hostPlayer!: IPlayer;
  @Get('session/player') player!: IPlayer;

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
    return (this.game && this.game.host?._id === this.player._id);
  }

  addWhiteCard (): void {

    const payload: ClientGameEventPayload = {
      gameId: this.game.gameId,
      data: 1
    };

    this.$socket.client.emit(ClientGameEvents.NEW_WHITE_CARD, payload);
  }
}
</script>
