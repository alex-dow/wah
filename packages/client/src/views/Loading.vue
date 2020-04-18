<template>
<div class="text-center w-100">
  <loading-icon/>
</div>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';
import LoadingIcon from '@/components/LoadingIcon.vue';

@Component({
  components: {
    LoadingIcon
  }
})
export default class LoadingView extends Vue {

}

</script>