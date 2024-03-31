<template>
  <div class="profile">
    <a class="profile-logout" v-if="user.email" title="Click to logout" @click.prevent="logout" href="#"
       v-html="user.email"></a>
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

<script setup>
import { getAuth } from "firebase/auth";
// import {child, get, getDatabase, ref} from "firebase/database";

const store = useStore();

const user = computed(() => store.user);
const uid = computed(() => store.uid);
let isLogin = ref(false);
const auth = ref(null);

auth.value = getAuth(store.firebaseApp);
auth.value.onAuthStateChanged(user => {
  if (user) {
    isLogin.value = false;
  } else {
    isLogin.value = true;
    if (!uid.value) {
      store.$patch({ uid: "anon" + parseInt(Math.random() * 100000) });
    }
  }
  setUser(user);
});

function setUser(user) {
  if (!user) {
    store.$patch({ user: false });
    return;
  }

  store.$patch({
    user: {
      uid: user.uid,
      photoURL: user.photoURL,
      displayName: user.displayName,
      email: user.email,
    },
  });

  if (!user.email) getRemoteUserSettings();
}

// TODO2: sync history for this domain
function getRemoteUserSettings() {
  /*// const db = getDatabase(state.firebaseApp);
  const db = getDatabase();
  // const dbRef = ref(db, `users/${state.user.uid}`)
  const dbRef = ref(db);
  get(child(dbRef, `users/${state.user.uid}`)).then((snapshot) => {
    // get(dbRef).then((snapshot) => {
    const settings = (snapshot.val() && snapshot.val().settings) || false;
    if (settings) {
      console.log('Update settings from firebase:', settings);
    }
  });*/
}

function logout() {
  auth.value.signOut();
  isLogin.value = true;
  const uid = "anon" + parseInt(Math.random() * 100000);
  setUser(uid);
}
</script>
