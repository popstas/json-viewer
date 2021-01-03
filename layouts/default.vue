<template>
  <el-container>
    <el-header height="66px">
      <el-row>
        <el-col :span="12">
          <el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect" class="header__menu">
            <el-menu-item v-if="$store.state.serverUrl" index="1">Scan</el-menu-item>
            <el-menu-item index="2">Results</el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="12">
          <Profile></Profile>
        </el-col>
      </el-row>
    </el-header>

    <el-main>
      <nuxt />
    </el-main>

    <el-footer height="36px">
      <a 
        target="_blank"
        href="https://github.com/viasite/site-audit-seo-viewer/releases"
      >{{ $store.state.name }} {{ $store.state.version }}</a>
    </el-footer>
  </el-container>
</template>

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

<script>

import Profile from "~/components/Profile";
import firebase from "firebase";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || ',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || ,
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default {
  components: {Profile},
  computed: {
    activeIndex() {
      const dict = {
        scan: '1',
        index: '2'
      }
      const val = dict[$nuxt.$route.name] || '0';
      return val;
    }
  },
  methods: {
    handleSelect(index) {
      const dict = {
        1: '/scan',
        2: '/',
      };
      const path = dict[index];
      if (path) this.$router.push({path: path});
    }
  }
};
</script>