<script setup>
import "./assets/index.scss";

const store = useStore();
const route = useRoute();
const router = useRouter();

const isHeader = computed(() => store.serverUrl || store.flags.login);
const activeIndex = computed(() => {
  const dict = {
    scan: "1",
    index: "2",
  };
  return dict[route.name] || "0";
});

// import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCdKjLhrXLHy46sYfx3qpHTqIE7w5-ew9w",
  authDomain: "site-audit-seo-1597591908441.firebaseapp.com",
  projectId: "site-audit-seo-1597591908441",
  storageBucket: "site-audit-seo-1597591908441.appspot.com",
  messagingSenderId: "416232515295",
  appId: "1:416232515295:web:82f6bee07c6b76f3b2eb6a",
  measurementId: "G-ZKXVHXZL2R",
};

const firebaseApp = initializeApp(firebaseConfig);
store.$patch({ firebaseApp: firebaseApp });
const analytics = getAnalytics(firebaseApp);

migrate();

function handleSelect(index) {
  const dict = {
    1: "/scan",
    2: "/",
  };
  const path = dict[index];
  if (path) router.push({ path: path });
}

function migrate() {
  // if store.jsonUrlHistory is object and not is array, convert to array with key as field url
  if (typeof store.jsonUrlHistory === "object" && !Array.isArray(store.jsonUrlHistory)) {
    console.info("Convert jsonUrlHistory to array");
    const jsonUrlHistory = [];
    for (let key in store.jsonUrlHistory) {
      jsonUrlHistory.push({ url: key, ...store.jsonUrlHistory[key] });
    }
    store.$patch({ jsonUrlHistory: jsonUrlHistory });
  }
}
</script>

<style>
html {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  height: 100%;
}

body {
  overflow-x: auto;
  height: 100%;
  font-size: 14px;
}

#__nuxt, #__layout {
  height: 100%;
}

.el-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.el-footer {
  padding: 8px 8px;
}

.el-footer a {
  color: #ccc;
}

*, *:before, *:after {
  box-sizing: border-box;
  margin: 0;
}

/* 100% width */
.container {
  width: auto;
}

</style>

<template>
  <el-container>
    <el-header height="66px" v-if="isHeader">
      <el-row>
        <el-col :span="14">
          <el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect" class="header__menu">
            <el-menu-item v-if="store.serverUrl" index="1">Scan</el-menu-item>
            <el-menu-item index="2">Results</el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="10">
          <Profile v-if="store.flags.login"></Profile>
        </el-col>
      </el-row>
    </el-header>

    <el-main>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </el-main>

    <Footer></Footer>
  </el-container>
</template>
