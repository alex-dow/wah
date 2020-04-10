<template>
<b-list-group-item href="#" class="flex-column align-items-start" :class="{'bg-danger': disconnected, 'text-light': disconnected}">
  <div class="d-flex w-100 justify-content-between">
    <h5 class="mb-1">{{ player.username }}</h5>
    <small>Score: 4</small>
  </div>
  <cah-cards :cards="10" size="sm"/>
  <p v-if="disconnected">
    RAGE QUIT! Kicking the fool out in { disconnectTimer } seconds!
  </p>
</b-list-group-item>
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import CahCards from './CahCards.vue';
import { IPlayer } from '@wah/lib/src/models/player';
import { Get } from 'vuex-pathify';
import { Events } from '@wah/lib';

@Component({
  components: {
    CahCards
  }
})
export default class Player extends Vue {

   @Prop({ required: true }) readonly player!: IPlayer;

   @Get('disconnectedPlayers') readonly disconnectedPlayers!: Array<IPlayer>;

   timeoutTimer = -1;
   disconnectTimer = 0;

   get disconnected (): boolean {
     return this.disconnectedPlayers.findIndex((p) => p._id === this.player._id) > -1;
   }

   @Watch('disconnected')
   onDisconnected (newVal: boolean) {
     if (newVal === true) {

       this.disconnectTimer = 60;

       this.timeoutTimer = window.setInterval(() => {

         this.disconnectTimer--;
         if (this.disconnectTimer <= 0) {
           this.$socket.client.emit(Events.KICK_PLAYER, this.player);
           window.clearInterval(this.timeoutTimer);
         }

       }, 1000);
     } else if (newVal === false) {
       window.clearInterval(this.timeoutTimer);
     }
   }

}
</script>
