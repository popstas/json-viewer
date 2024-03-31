<template>
  <div class="auth-container">
    <section id="firebaseui-auth-container"></section>
  </div>
</template>

<style lang="scss">
.auth-container {
  display: inline-block;
}
</style>

<script setup>
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

const store = useStore();
// const router = useRouter();
const auth = getAuth(store.firebaseApp);

onMounted(() => {
  let ui = firebaseui.auth.AuthUI.getInstance();
  if (!ui) {
    ui = new firebaseui.auth.AuthUI(auth);
  }
  const uiConfig = {
    signInSuccessUrl: location.origin, // router.options.base // This redirect can be achived by route using callback.
    signInFlow: "popup",
    signInOptions: [GoogleAuthProvider.PROVIDER_ID],
  };
  ui.start("#firebaseui-auth-container", uiConfig);
});
</script>
