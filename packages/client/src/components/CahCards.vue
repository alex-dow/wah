<template>
<div class="game-hand" :class="classObj">
  <template  v-for="i in noOfCards">
    <cah-card :key="'playerCard' + i" :black="black" :size="size" :front="front" :text="(cards[i-1])? cards[i-1].text : ''"/>
  </template>
</div>
</template>

<style lang="scss">
div.game-hand {
  padding: 0;
  margin: 0;
  display: flex;
  flex-flow: nowrap;
  //position: relative;
  //clear: both;

  .cah-card {
    margin: 0;
    padding: 0;
    //float: left;
    position: relative;
  }
}

.game-hand.cah-card-left .cah-card {
box-shadow: -0.3em 0.1em #333 !important;
}

@for $i from 0 through 100 {
  .cah-card-stacked > .cah-card-sm:nth-child(#{$i + 1}) {
    left: 0em + (-5.2em * $i);
    //top: 0em;
  }

  .cah-card-stacked > .cah-card-md:nth-child(#{$i + 1}) {
    left: 0em + (-10em * $i);
    //top: 0em;
  }

  .cah-card-stacked > .cah-card-lg:nth-child(#{$i + 1}) {
    left: 0em + (-14em * $i);
    //top: 0em;
  }
}


@for $i from 0 through 100 {
  .cah-card-stacked.cah-card-left .cah-card:nth-child(#{$i + 1}) {
    z-index: 100 - $i;
  }
}

</style>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import CahCard from './CahCard.vue';
import { IWhiteCard } from '@wah/lib/src/models/card';
import { IBlackCard } from '@wah/lib/src/models/card';

@Component({
  components: {
    CahCard
  }
})
export default class PlayerHand extends Vue {
  @Prop(Boolean) readonly black!: boolean;
  @Prop({ default: 'md' }) readonly size!: string;
  @Prop({ default: 0, type: Number }) readonly noOfCards!: number;
  @Prop({ default: false, type: Boolean }) readonly left!: boolean;
  @Prop({ default: false, type: Boolean }) readonly stacked!: boolean;
  @Prop({ default: false, type: Boolean }) readonly front!: boolean;
  @Prop({ default: () => [], type: Array}) readonly cards!: Array<IWhiteCard | IBlackCard>;

  get totalCards (): number {
    console.log('this.cards:', this.cards.length);
    console.log('this.noOfCards', this.noOfCards);
    if (this.cards) return this.cards.length;
    return this.noOfCards;
  }

  classObj = {
    'cah-card-left': false,
    'cah-card-stacked': false,
    'cah-card-stacked-front': false
  }

  @Watch('left')
  onLeftChanged (newVal: boolean): void {
    this.classObj['cah-card-left'] = newVal;
  }

  @Watch('stacked')
  onStackedChanged (newVal: boolean): void {
    this.classObj['cah-card-stacked'] = newVal;
  }

  @Watch('front')
  onFrontChanged (newVal: boolean): void {
    this.classObj['cah-card-stacked-front'] = newVal;
  }

  created () {
    if (this.left) {
      this.classObj['cah-card-left'] = true;
    }

    if (this.stacked) {
      this.classObj['cah-card-stacked'] = true;
    }

    if (this.front) {
      this.classObj['cah-card-stacked-front'] = true;
    }
  }
}
</script>
