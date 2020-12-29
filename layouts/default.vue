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
const firebaseConfig = {
  apiKey: "AIzaSyCdKjLhrXLHy46sYfx3qpHTqIE7w5-ew9w",
  authDomain: "site-audit-seo-1597591908441.firebaseapp.com",
  projectId: "site-audit-seo-1597591908441",
  storageBucket: "site-audit-seo-1597591908441.appspot.com",
  messagingSenderId: "416232515295",
  appId: "1:416232515295:web:82f6bee07c6b76f3b2eb6a",
  measurementId: "G-ZKXVHXZL2R"
};
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
