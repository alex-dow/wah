<template>
<b-form @submit.prevent="createPlayer" id="sign-up-form">
  <p>
    Welcome to Whatever Against Humanity. An online CAH-style card game.
  </p>
  <b-form-group id="input-username-group" label="Player Name" description="Choose a player name in order to continue" label-for="input-username">
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

  createPlayer () {
    this.saving = true;
    this.$socket.client.emit(Events.REGISTER_PLAYER, this.form.username);
  }

  @Socket(Events.ERROR)
  onSocketError (err: Errors) {
    if (err === Errors.USERNAME_TAKEN) {
      this.saving = false;
    }
  }

  mounted () {
    this.saving = false;
  }

}
</script>
