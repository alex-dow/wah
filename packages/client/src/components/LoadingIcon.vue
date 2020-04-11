<template>
<img :src="require('../assets/icons/loading-bar.svg').default" :alt="title"/>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

// import loadingBar from '../assets/icons/loading-bar.svg';

@Component
export default class LoadingIcon extends Vue {
  @Prop({ default: 'Loading ...' }) readonly title: string | undefined;
}
</script>
