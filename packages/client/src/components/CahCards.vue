<template>
<div class="game-hand" :class="classObj">
  <template  v-for="i in cards">
    <cah-card :key="'playerCard' + i" :black="black" :size="size"/>
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

  @for $i from 0 through 100 {
    .cah-card-sm:nth-child(#{$i + 1}) {
      left: 0em + (-5.5em * $i);
      //top: 0em;
    }

    .cah-card-md:nth-child(#{$i + 1}) {
      left: 0em + (-10em * $i);
      //top: 0em;
    }

    .cah-card-lg:nth-child(#{$i + 1}) {
      left: 0em + (-14em * $i);
      //top: 0em;
    }
  }
}

@for $i from 0 through 100 {
  .cah-card-left .cah-card:nth-child(#{$i + 1}) {
    z-index: 100 - $i;
  }
}

</style>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import CahCard from './CahCard.vue';

@Component({
  components: {
    CahCard
  }
})
export default class PlayerHand extends Vue {
  @Prop(Boolean) readonly black!: boolean;
  @Prop({ default: 'md' }) readonly size!: string;
  @Prop({ default: 0, type: Number }) readonly cards!: number;
  @Prop({ default: false, type: Boolean }) readonly left!: boolean;

  classObj = {
    'cah-card-left': false
  }

  @Watch('left')
  onLeftChanged (newVal: boolean) {
    this.classObj['cah-card-left'] = newVal;
  }

  created () {
    if (this.left) {
      this.classObj['cah-card-left'] = true;
    }
  }
}
</script>
