<template>
<b-container id="app" class="m-0 p-0" >
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
  <joining-modal/>
  <new-game-modal/>
  <join-game-modal/>
</b-container>
</template>

<style lang="scss">
@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';
import { Get } from 'vuex-pathify';
import { IPlayer } from '@wah/lib/src/models/player';

import Events from '@wah/lib/src/events';
import Errors from '@wah/lib/src/errors';

import GameSelection from './views/GameSelection.vue';
import SignUpForm from './views/SignUpForm.vue';
import LoadingIcon from './components/LoadingIcon.vue';
import GameBoard from './views/GameBoard.vue';

import ErrorMsgs from './lang/en/errorMsgs';

import JoiningModal from './components/JoiningModal.vue';
import NewGameModal from './components/NewGameModal.vue';
import JoinGameModal from './components/JoinGameModal.vue';

@Component({
  components: {
    GameSelection,
    SignUpForm,
    LoadingIcon,
    GameBoard,
    JoiningModal,
    NewGameModal,
    JoinGameModal
  }
})
export default class App extends Vue {

  @Get('connected') connected!: boolean;
  @Get('sessionStarted') sessionStarted!: boolean;
  @Get('player') player!: IPlayer;
  @Get('inGame') inGame!: boolean;

  async mounted () {
    try {
      await this.$store.dispatch('startSession');
      this.$socket.client.open();
    } catch (err) {
      console.error(err);
      this.onError(Errors.UNKNOWN);
    }
  }

  @Socket(Events.ERROR)
  onError (err: Errors) {

    this.$bvToast.toast(err, {
      title: 'Service Error',
      variant: 'danger',
      solid: true
    });
    console.error('[wah-service]', err);
  }

  @Socket(Events.JOIN_GAME)
  onJoinGame (gameId: string) {
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
