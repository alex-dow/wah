<template>
<b-row>
  <b-col cols="12" class="text-center">
    <h1>Whatever Against Humanity</h1>
    <p>Welcome to the Lobby</p>
  </b-col>

  <b-col cols="12" v-if="player">
    <game-board-view v-if="inGame" />
    <game-selection-view v-else />
  </b-col>
  <b-col v-else>
    <sign-up-form-view />
  </b-col>
</b-row>
</template>

<script lang="ts">
import GameBoardView from './GameBoard.vue';
import GameSelectionView from './GameSelection.vue';
import SignUpFormView from './SignUpForm.vue';
import { Vue, Component } from 'vue-property-decorator';
import { Get } from 'vuex-pathify';
import { IPlayer } from '@wah/lib/src/models';

@Component({
  components: {
    GameBoardView,
    GameSelectionView,
    SignUpFormView
  }
})
export default class LobbyView extends Vue {

  @Get('session/connected') connected!: boolean;
  @Get('session/player') player!: IPlayer;
  @Get('session/inGame') inGame!: boolean;
}
</script>