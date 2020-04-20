<template>
<b-modal
  id="new-game-modal"
  @show="onShow"
  @ok="onSubmit"
  centered
  :title="'Start a ' + modalTitle + ' Game'"
  ok-title="START"
  ok-variant="danger"
  size="lg"
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
  <b-form-group
    id="game-deck-group"
    label="Card Deck to Use"
    label-for="game-deck-input"
    description="Which horrible collection of cards do you want to use?"
    :disabled="startingGame || loadingDecks">

    <b-form-select
      id="game-deck-input"
      ref="game-deck-input"
      v-model="form.gameDecks"
      :options="gameDeckSelectValues"
      :select-size="10"
      multiple
      />
  </b-form-group>
  <p>
    Total black cards: {{ totalBlackCards }}
  </p>
  <p>
    Total white cards: {{ totalWhiteCards }}
  </p>

</b-form>

<template v-slot:modal-footer="{ ok, cancel }">
  <template v-if="startingGame"><loading-icon/></template>
  <template v-else>
    <b-button @click="cancel()">Run Away</b-button> <b-button variant="danger" @click="onSubmit" :disabled="loadingDecks">Start Game</b-button>
  </template>
</template>

</b-modal>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';
import { ICardDeck } from '@wah/lib/src/models/card';
import LoadingIcon from '../LoadingIcon.vue';
import { ClientSessionEvents, PlayerEvents } from '@wah/lib/src/events'

@Component({
  components: {
    LoadingIcon
  }
})
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
    gameTitle: '',
    gameDecks: new Array<ICardDeck>()
  }
  startingGame = false;
  loadingDecks = false;

  get totalBlackCards (): number {
    return this.form.gameDecks.reduce((a: number, cd: any) => {
      a = a + cd.totalBlackCards;
      return a;
    }, 0);
  }

  get totalWhiteCards (): number {
    return this.form.gameDecks.reduce((a: number, cd: any) => {
      a = a + cd.totalWhiteCards;
      return a;
    },0);
  }

  get gameDeckSelectValues (): Array<any> {
    const officialDecks = {
      label: 'Official Decks',
      options: new Array<any>()
    };

    const unofficialDecks = {
      label: 'Unofficial Decks',
      options: new Array<any>()
    };

    this.$store.state.misc.cardDecks.forEach((cd: ICardDeck) => {
      if (cd.official) {
        officialDecks.options.push({ value: cd, text: cd.name });
      } else {
        unofficialDecks.options.push({ value: cd, text: cd.name });
      }
    });

    return [officialDecks, unofficialDecks];
  }

  modalTitle = 'Whatever';

  @Socket(PlayerEvents.GAME_STATE)
  onJoinGame (): void {
    this.startingGame = false;
    this.$bvModal.hide('new-game-modal');
  }

  onShow (): void {
    this.form.gameTitle = '';
    this.modalTitle = this.verbs[Math.floor(Math.random() * this.verbs.length)];
  }

  onSubmit (e: any): void {

    if (e.preventDefault) {
      e.preventDefault();
    }

    this.startingGame = true;

    const game = this.form.gameTitle === '' ? 'Whatever Against Humanity' : this.form.gameTitle;

    console.log('selected game decks:', this.form.gameDecks);

    this.$socket.client.emit(ClientSessionEvents.NEW_GAME, [this.form.gameTitle, this.form.gameDecks]);
  }

  async refreshDecks(): Promise<void> {
    this.loadingDecks = true;
    await this.$store.dispatch('misc/loadCardDecks');
    this.loadingDecks = false;
  }

  created(): void {
    this.refreshDecks();
  }
}

</script>
