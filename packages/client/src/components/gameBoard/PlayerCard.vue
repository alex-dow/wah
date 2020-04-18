<template>
<b-list-group-item href="#" class="flex-column align-items-start" :class="{'bg-danger': disconnected, 'text-light': disconnected}">
  <div class="d-flex w-100 justify-content-between">
    <h5 class="mb-1">{{ player.username }}</h5>
    <small>Score: 4</small>
  </div>
  <cah-cards :noOfCards="handSize" size="sm" stacked :left="left"/>
  <p v-if="disconnected">
    RAGE QUIT! Kicking the fool out in { disconnectTimer } seconds!
  </p>
</b-list-group-item>
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import CahCards from '@/components/CahCards.vue';
import { IPlayer } from '@wah/lib/src/models/player';
import { Get } from 'vuex-pathify';
import { Events } from '@wah/lib';
import { IStatePlayerHandCount } from '../../store/game/state';

@Component({
  components: {
    CahCards
  }
})
export default class PlayerCard extends Vue {
  @Prop({ required: true }) readonly player!: IPlayer;
  @Prop(Boolean) readonly left!: boolean;

  @Get('game/playerHandCounts') readonly playerHandCounts!: Array<IStatePlayerHandCount>;

  disconnected = false;

  get handSize(): number {
    console.log('WHY NOT WORK:', this.player._id);
    const idx = this.playerHandCounts.findIndex((p) => p.playerId == this.player._id);
    if (idx > -1) {
      console.log('Idx > -1:', this.playerHandCounts[idx]);
      return this.playerHandCounts[idx].count;
    } else {
      console.log('idx <= -1');
      return 0;
    }
  }
}
</script>