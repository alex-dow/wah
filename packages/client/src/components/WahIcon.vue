<template>
<span class="wah-icon spin" :class="classObject" :title="title" :license="iconAttributions[icon]"/>
</template>

<style lang="scss">

.wah-icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  background-repeat: no-repeat;
  background-size: 100%;
}

.wah-icon-small {
  width: 1em;
  height: 1em;
}

.wah-icon-md {
  width: 2em;
  height: 2em;
}

.wah-icon-lg {
  width: 3em;
  height: 3em;
}

.wah-icon-host {
  background-image: url('../assets/icons/host.svg');
}

.wah-icon-presenter {
  background-image: url('../assets/icons/presenter.svg');
}

.wah-icon-spin-slow {
  animation: spin 10s infinite linear;
}

.wah-icon-spin-fast {
  animation: spin 2s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class WahIcon extends Vue {

  @Prop(String) readonly icon!: string;
  @Prop(String) readonly title!: string;
  @Prop({ type: String, default: 'sm' }) readonly size!: string;
  @Prop(Boolean) readonly spin!: boolean;
  @Prop(String) readonly speed!: string;

  iconAttributions = {
    'presenter': 'yell by Creative Stall from the Noun Project'
  }

  get classObject(): any {
    return {
      'wah-icon-sm': this.size === 'sm',
      'wah-icon-md': this.size === 'md',
      'wah-icon-lg': this.size === 'lg',
      'wah-icon-host': this.icon === 'host',
      'wah-icon-presenter': this.icon === 'presenter',
      'wah-icon-spin-slow': this.spin === true && (this.speed === 'slow' || !this.speed),
      'wah-icon-spin-fast': this.spin === true && this.speed === 'fast'
    }
  }
}

</script>