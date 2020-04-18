<template>
<b-form @submit.prevent="createPlayer" id="sign-up-form">
  <p>
    All I want is a name, any name, I don't need to know your life story.
  </p>
  <b-form-group id="input-username-group" label="Player Name" description="Choose a name that best describes your favourite alter ego" label-for="input-username">
    <b-form-input id="input-username" v-model="form.username" required :disabled="saving" :state="usernameTaken" @input="usernameTaken = null" autofocus/>
    <b-form-invalid-feedback id="input-username-feedback">
      Yeah, hmm, someone else used that same username. Suspicious...
    </b-form-invalid-feedback>
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
import { Component, Vue } from 'vue-property-decorator';
import { Socket } from 'vue-socket.io-extended';
import { ClientEvents, Errors, SessionEvents } from '@wah/lib';
import LoadingIcon from '../components/LoadingIcon.vue';
import { Error, ErrorMixin } from '../errorListener';
import { mixins } from 'vue-class-component';

@Component({
  components: {
    LoadingIcon
  }
})
export default class SignUpFormView extends mixins(ErrorMixin) {

  form = {
    username: ''
  };

  saving = false;
  usernameTaken: boolean | null = null;

  @Socket(SessionEvents.PLAYER)
  onPlayer(): void {
    this.saving = false;
  }

  async createPlayer (): Promise<void> {
    this.saving = true;
    this.$socket.client.emit(ClientEvents.REGISTER_PLAYER, this.form.username);
  }

  @Error(Errors.USERNAME_TAKEN)
  onUsernameTaken(): void {
    this.saving = false;
    this.usernameTaken = false;
  }

  mounted (): void {
    this.saving = false;
    this.usernameTaken = null;
  }

}
</script>
