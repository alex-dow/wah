<template>
<div class="cah-card" :class="classObj">
  <p class="cah-card-caption">Cards<br/>Against<br/>Humanity</p>
</div>
</template>

<style lang="scss">
$lg-w: 18;
$lg-h: 22;
$lg-font-size: 3;

$md-w: $lg-w * 0.666;
$md-h: $lg-h * 0.666;
$md-font-size: $lg-font-size * 0.666;

$sm-w: $lg-w * 0.333;
$sm-h: $lg-h * 0.333;
//$sm-font-size: $lg-font-size * 0.666;
$sm-font-size: $lg-font-size * 0.333;
.cah-card {
  border: 1px solid black;
  border-radius: 1em;
  display: inline-block;
  width: 18em;
  height: 22em;
  padding: 2em;
  margin: 2em;
  font-family: helvetica neue, helvetica, arial, sans-serif;
  font-weight: bolder;
  box-shadow: .1em .1em .1em .1em #333;
  position: relative;
  background-color: white;
  color: black;

  .cah-card-caption {
    padding: .75rem;
  }
}

.cah-card-sm {
  width: #{$sm-w}em !important;
  height: #{$sm-h}em !important;

  .cah-card-caption {
    font-size: #{$sm-font-size}em !important;
  }
}

.cah-card-md {
  width: #{$md-w}em !important;
  height: #{$md-h}em !important;
  .cah-card-caption {
    font-size: #{$md-font-size}em !important;
  }
}

.cah-card-lg {
  width: #{$lg-w}em !important;
  height: #{$lg-h}em !important;
  .cah-card-caption {
    font-size: #{$lg-font-size}em !important;
  }
}

.cah-black-card {
  background-color: black !important;
  color: white;
  border-color: #333;
}

</style>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class CahCard extends Vue {
  @Prop(Boolean) readonly black!: boolean;
  @Prop({ default: 'md' }) readonly size!: string;

  classObj = {
    'cah-black-card': false,
    'cah-card-sm': false,
    'cah-card-md': true,
    'cah-card-lg': false
  }

  @Watch('black')
  onBlackChanged (newVal: boolean) {
    this.classObj['cah-black-card'] = newVal;
  }

  @Watch('size')
  onSizeChanged (newVal: string) {
    this.setCardSize(newVal);
  }

  setCardSize (size: string) {
    if (size === 'lg') {
      this.classObj['cah-card-sm'] = false;
      this.classObj['cah-card-md'] = false;
      this.classObj['cah-card-lg'] = true;
    } else if (size === 'md') {
      this.classObj['cah-card-sm'] = false;
      this.classObj['cah-card-md'] = true;
      this.classObj['cah-card-lg'] = false;
    } else if (size === 'sm') {
      this.classObj['cah-card-sm'] = true;
      this.classObj['cah-card-md'] = false;
      this.classObj['cah-card-lg'] = false;
    }
  }

  created () {
    if (this.black) {
      this.classObj['cah-black-card'] = true;
    }
    this.setCardSize(this.size);
  }
}
</script>
