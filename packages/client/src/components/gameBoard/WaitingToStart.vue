<template>
<b-row align-v="center" align-h="center" class="h-100">
  <b-col>
    <h4>Waiting for game to start</h4>
    <!-- <cah-cards :cards="6" black stacked/> -->
  </b-col>
</b-row>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator';
import CahCards from '../CahCards.vue';

@Component({
  components: {
    CahCards
  }
})
export default class WaitingToStart extends Vue {

}

</script>