<template>
<b-list-group-item href="#" class="flex-column align-items-start" :class="{'bg-danger': disconnected, 'text-light': disconnected}">
  <b-row no-gutters>
    <b-col cols="1">
      <wah-icon class="m-0 align-middle" :icon="playerIcon" title="This is your ruler" size="md" spin speed="fast"/>
    </b-col>
    <b-col>
      <p class="m-0 p-0 pl-3 player-name">{{ player.username }}</p>
    </b-col>
  </b-row>
  <b-row no-gutters>
    <b-col cols="6">
      <cah-cards :noOfCards="handSize" size="xxs" stacked :left="left" class="pt-1"/>
    </b-col>
    <b-col cols="6">
      <b-badge variant="secondary">Score: 5</b-badge>
    </b-col>
  </b-row>
</b-list-group-item>
</template>

<style lang="scss">
.player-name {
  font-weight: bolder;
  font-size: 1.3rem;
  display: inline-block;
  color: black;
}
</style>
<script lang="ts">

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import CahCards from '@/components/CahCards.vue';
import { IPlayer } from '@wah/lib/src/models/player';
import { Get } from 'vuex-pathify';
import { Events } from '@wah/lib';
import { IStatePlayerHandCount } from '@wah/lib/src/models/game';
import WahIcon from '@/components/WahIcon.vue';

@Component({
  components: {
    CahCards,
    WahIcon
  }
})
export default class PlayerCard extends Vue {
  @Prop({ required: true }) readonly player!: IPlayer;
  @Prop(Boolean) readonly left!: boolean;

  @Get('game/playerHandCounts') readonly playerHandCounts!: Array<IStatePlayerHandCount>;
  @Get('game/host@_id') readonly hostId!: string;

  disconnected = false;

  get isHost(): boolean {
    return (this.hostId.toString() == this.player._id.toString());
  }

  get isPresenter(): boolean {
    return false;
  }

  get playerIcon(): string {
    if (this.isHost) {
      return 'host';
    } else if (this.isPresenter) {
      return 'presenter';
    } else {
      return '';
    }
  }

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