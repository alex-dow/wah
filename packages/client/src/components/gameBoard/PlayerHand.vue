<template>
<b-row no-gutters>
  <b-col cols="12" class="text-center">
    <cah-cards :cards="playerHand" :noOfCards="noOfCards" size="sm" white front hover/>
  </b-col>
</b-row>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Get } from 'vuex-pathify';
import { IWhiteCard } from '@wah/lib/src/models/card';
import CahCards from '../CahCards.vue';

@Component({
  components: {
    CahCards
  }
})
export default class GameBoardPlayerHand extends Vue {


  @Get('game/playerHand') readonly playerHand!: Array<IWhiteCard>;
  @Get('game/playerHand@length') readonly noOfCards!: number;

}

</script>