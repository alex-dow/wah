<template>
<img src="../assets/icons/loading-bar.svg" :alt="title"/>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class LoadingIcon extends Vue {
  @Prop({ default: 'Loading ...' }) readonly title: string | undefined;
}
</script>
