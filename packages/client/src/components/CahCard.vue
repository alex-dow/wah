<template>
<div class="cah-card" :class="classObj">
  <p class="cah-card-caption" v-if="!front">Cards<br/>Against<br/>Humanity</p>
  <p class="cah-card-text" v-else>{{ cardText }}</p>
</div>
</template>

<style lang="scss">
$lg-w: 18;
$lg-h: 22;
$lg-caption-size: 3;
$lg-text-size: 2;

$md-w: $lg-w * 0.666;
$md-h: $lg-h * 0.666;
$md-caption-size: $lg-caption-size * 0.666;
$md-text-size: $lg-text-size * 0.666;

$sm-w: $lg-w * 0.333;
$sm-h: $lg-h * 0.333;
$sm-caption-size: $lg-caption-size * 0.333;
$sm-text-size: $lg-text-size * 0.333;

.cah-card {
  border: 1px solid black;
  border-radius: 1em;
  display: inline-block;
  min-width: 18em;
  min-height: 22em;
  padding: 2em;
  //margin: 2em;
  font-family: helvetica neue, helvetica, arial, sans-serif;
  font-weight: bolder;
  box-shadow: 0.1em 0.3em #333;
  position: relative;
  background-color: white;
  color: black;
  text-align: left;

  .cah-card-caption {
    padding: .75rem;
  }

  .cah-card-text {
    padding: .75rem;
  }
}

.cah-card-sm {
  max-width: #{$sm-w}em !important;
  max-height: #{$sm-h}em !important;
  min-width: #{$sm-w}em !important;
  min-height: #{$sm-h}em !important;
  padding: 0.5em !important;

  .cah-card-caption {
    font-size: #{$sm-caption-size}em !important;
    padding: 0 !important;
  }

  .cah-card-text {
    font-size: #{$sm-text-size}em !important;
    padding: 0 !important;
  }
}

.cah-card-md {
  min-width: #{$md-w}em !important;
  min-height: #{$md-h}em !important;
  .cah-card-caption {
    font-size: #{$md-caption-size}em !important;
  }
  .cah-card-text {
    font-size: #{$md-text-size}em !important;
  }
}

.cah-card-lg {
  min-width: #{$lg-w}em !important;
  min-height: #{$lg-h}em !important;
  .cah-card-caption {
    font-size: #{$lg-caption-size}em !important;
  }
  .cah-card-text {
    font-size: #{$lg-text-size}em !important;
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
  @Prop({ default: false, type: Boolean}) readonly black!: boolean;
  @Prop({ default: 'md' }) readonly size!: string;
  @Prop({ default: false, type: Boolean}) readonly front!: boolean;
  @Prop({ type: String, default: 'Someone forgot to put text here!!!!'}) readonly text!: string;

  classObj = {
    'cah-black-card': false,
    'cah-card-sm': false,
    'cah-card-md': true,
    'cah-card-lg': false
  }

  @Watch('black')
  onBlackChanged (newVal: boolean): void {
    this.classObj['cah-black-card'] = newVal;
  }

  @Watch('size')
  onSizeChanged (newVal: string): void {
    this.setCardSize(newVal);
  }

  get cardText (): string {
    return this.text.replace(/_/g, '______');
  }

  setCardSize (size: string): void {
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

  created (): void {
    if (this.black) {
      this.classObj['cah-black-card'] = true;
    }
    this.setCardSize(this.size);
  }
}
</script>
