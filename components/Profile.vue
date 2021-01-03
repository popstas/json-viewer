<template>
  <div class="profile">
    <a class="profile-logout" v-if="user.email" title="Click to logout" @click.prevent="logout" href="#" v-html="user.email"></a>
    <NuxtLink class="profile-login" v-if="isLogin" to="/login">Login</NuxtLink>
  </div>
</template>

<style lang="scss">

.profile {
  float: right;
  margin: 20px 8px -20px 0;

  a {
    color: #000;
  }
}
.profile-avatar {
  width: 32px;
  height: 32px;
}
</style>

<script>
import firebase from "firebase";
export default {
  data() {
    return {
      isLogin: false
    }
  },

  computed: {
    user() {
      return this.$store.state.user;
    }
  },

  created() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.$store.dispatch("setUser", user);
        this.isLogin = false;
      } else {
        this.isLogin = true;
        if (!this.$store.state.uid) {
          this.$store.commit('setUid', 'anon' + parseInt(Math.random() * 100000));
        }
        this.$store.dispatch("setUser", { uid: this.$store.state.uid});
      }
    });
  },

  methods: {
    logout() {
      firebase.auth().signOut();
      this.isLogin = true;
      this.$store.dispatch('setUser', { uid: 'anon' + parseInt(Math.random() * 100000)});
    }
  }
};
</script>