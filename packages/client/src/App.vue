<template>
<b-container id="app" class="m-0 p-0" fluid>
  <lobby-view v-if="connected && !inGame"/>
  <game-board-view v-else-if="connected && inGame"/>
  <loading-view v-else />

  <new-game-modal/>
  <join-game-modal/>
  <confirm-stop-game-modal/>
  <start-game-modal/>
</b-container>

<!--
  <b-row>
    <b-col align-self="center" class="text-center">
      <h1>Whatever Against Humanity</h1>
      <loading-icon title="Connecting ..." v-if="!connected" class="text-center"/>
    </b-col>
  </b-row>
  <b-row v-if="connected">
    <b-col v-if="player">
      <game-board v-if="inGame === true"/>
      <game-selection v-else />
    </b-col>
    <b-col v-else>
      <sign-up-form />
    </b-col>
  </b-row>

  -->
</template>

<style lang="scss">
@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mixins } from 'vue-class-component';
import { Socket } from 'vue-socket.io-extended';
import { Get } from 'vuex-pathify';
import { IPlayer } from '@wah/lib/src/models/player';

import Events from '@wah/lib/src/events';
import Errors from '@wah/lib/src/errors';

import GameSelection from './views/GameSelection.vue';
import SignUpForm from './views/SignUpForm.vue';
import LoadingIcon from './components/LoadingIcon.vue';
import GameBoardView from './views/GameBoard.vue';

import LoadingView from './views/Loading.vue';
import LobbyView from './views/Lobby.vue';

import ErrorMsgs from './lang/en/errorMsgs';

import NewGameModal from './components/modals/NewGameModal.vue';
import JoinGameModal from './components/modals/JoinGameModal.vue';
import ConfirmStopGameModal from './components/modals/ConfirmStopGame.vue';
import StartGameModal from './components/modals/StartGame.vue';

import { ErrorMixin, Error } from './errorListener';

@Component({
  components: {
    LoadingView,
    LobbyView,
    NewGameModal,
    JoinGameModal,
    GameBoardView,
    ConfirmStopGameModal,
    StartGameModal
  }
})
export default class App extends mixins(ErrorMixin) {

  @Get('session/connected') connected!: boolean;
  @Get('session/player') player!: IPlayer;
  @Get('session/inGame') inGame!: boolean;

  async mounted () {
    try {
      await this.$store.dispatch('session/startSession');
      this.$socket.client.open();
    } catch (err) {
      console.error(err);
      this.onError(Errors.UNKNOWN);
    }
  }

  @Socket(Events.JOIN_GAME)
  onJoinGame (gameId: string): void {
    console.log('Joining a game:', gameId);
  }

  @Socket(Events.GAME_STOPPED)
  onGameStopped (): void {
    console.log('GAME STOPPPED!');
    this.$bvToast.toast('The host decided they had ENOUGH and just gave up and left', {
      title: 'Game Stopped',
      variant: 'warning'
    });
  }

  @Socket(Events.PLAYER_LEFT)
  oPlayerLeft (player: IPlayer): void {
    if (player._id === this.player._id) {
      this.$bvToast.toast('You just rage quit', {
        title: 'RAGE QUIT',
        variant: 'danger'
      });
    }
  }

}
</script>
