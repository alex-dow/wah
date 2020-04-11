<template>
<b-form @submit.prevent="createPlayer" id="sign-up-form">
  <p>
    Welcome to Whatever Against Humanity. If you don't know what to expect from this, the better the experience will be.
  </p>
  <b-form-group id="input-username-group" label="Player Name" description="Choose a name that best describes your favourite alter ego" label-for="input-username">
    <b-form-input id="input-username" v-model="form.username" required :disabled="saving"/>
  </b-form-group>
  <b-button type="submit" variant="primary" :disabled="saving">Create Player</b-button> <loading-icon title="Saving ..." v-if="saving" class="ml-4"/>
</b-form>
</template>
<style lang="scss">
#sign-up-form {
  padding: 4rem;
}
</style>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Get } from 'vuex-pathify';
import { Socket } from 'vue-socket.io-extended';
import { IPlayer } from '@wah/lib/src/models/player';

import { Events, Errors } from '@wah/lib';

import LoadingIcon from '../components/LoadingIcon.vue';

@Component({
  components: {
    LoadingIcon
  }
})
export default class SignUpForm extends Vue {

  form = {
    username: ''
  };

  saving = false;

  async createPlayer (): Promise<void> {
    this.saving = true;
    this.$socket.client.emit(Events.REGISTER_PLAYER, this.form.username, (err: Errors | null, player: IPlayer | undefined) => {
      if (err) {
        if (err === Errors.USERNAME_TAKEN) {
          this.$bvToast.toast('Sorry chum, someone stole your identifty. Pick a new username, maybe change your bank password too', {
            variant: 'danger',
            title: 'Username Taken'
          });
        } else {
          this.$bvToast.toast('Wow, whatever you did broke everything. GOOD JOB! Maybe try again but don\'t screw it up this time eh?', {
            variant: 'danger',
            title: err
          });
          console.error('Error creating player:', err);
        }
      } else {
        this.$store.commit('SET_PLAYER', player);
      }
      this.saving = false;

    });
  }

  mounted (): void {
    this.saving = false;
  }

}
</script>
