<template>
<b-modal
  v-bind="{...$props, ...$attrs}"
  id="joining-modal"
  title="Joining Game"
  centered
  size="sm"
  button-size="sm"
  footer-class="border-top-0"
  header-class="border-bottom-0"
  hide-footer
  no-close-on-esc
  no-close-on-backdrop

  >
  {{ messages[msgIdx] }}
</b-modal>
</template>

<script lang="ts">

import { Vue, Component, Watch } from 'vue-property-decorator';
import { Events } from '@wah/lib';
import { Socket } from 'vue-socket.io-extended';
import { Get } from 'vuex-pathify';

@Component
export default class JoiningModal extends Vue {

  @Get('joiningGame') joiningGame!: boolean;

  @Watch('joiningGame')
  onJoiningGame (newVal: boolean) {
    if (newVal) {
      this.msgIdx = 0;
      this.$bvModal.show('joining-modal');
      this.timer = window.setInterval(() => {
        this.msgIdx++;
      }, 5000);
    } else {
      clearInterval(this.timer);
      this.$bvModal.hide('joining-modal');
    }
  }

  messages = [
    'Just chill out...',
    'Patience is a virtue you know...',
    'Yeah, tap your fingers louder, that\'ll make things go faster...',
    'NO! Stop asking!',
    'Try hitting ALT-F4 to see if that makes it go faster...',
    'Haha yeah I did think you were that dumb...',
    'How does it feel to be insulted by a webapp?',
    'Bet you\'re raging now',
    'Well don\'t hit ALT-F4 yet, this game will start don\'t worry chum',
    'Starting to feel like maybe something is wrong...',
    'EEeesh, I dunno now...'
  ]

  msgIdx = 0;
  timer = -1;
}

</script>
