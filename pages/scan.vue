<template>
  <section class="scan__container">
    <el-form :inline="true" class="scan__form" ref="form">
      <el-form-item label="URL">
        <el-input v-model="url" @keydown.enter.native="sendTask" autofocus></el-input>
      </el-form-item>
      <el-form-item label="Arguments">
        <el-input v-model="args" @keydown.enter.native="sendTask"></el-input>
      </el-form-item>
      <el-form-item label="Server URL" class="form__server-url">
        <el-input v-model="serverUrl"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="sendTask">Scan</el-button>
      </el-form-item>
    </el-form>

    <ul class="scan__log"
      v-chat-scroll="{always: false, smooth: false}"
      v-if="log.length > 0"
    >
      <li v-for="(line, index) in log" :key="index" v-html="line"></li>
    </ul>

    <template v-if="running !== ''">
      <h3>Server state:</h3>
      <ul class="server-state">
        <li>running: {{ running }}</li>
        <!-- <li>available: {{ available }}</li> -->
        <li>pending: {{ pending }}</li>
        <li>total scanned: {{ scansTotal }}</li>
      </ul>
    </template>

  </section>
</template>

<style lang="scss">
  .scan__form {
    // margin-top: 30px;
    max-width: 1200px;

    input {
      padding: 0 10px;
      min-width: 270px;
    }

    .form__server-url input {
      min-width: 120px;
    }
  }

  .scan__log {
    font-family: monospace;
    background: #2d2d2d;
    color: #ccc;
    list-style: none;
    margin: 0;
    padding: 5px 10px;
    max-height: calc(100vh - 150px);
    overflow-x: auto;

    a {
      color: #9ec8f0;
      text-decoration: underline;
      &:hover { color: #fff; }
    }

    pre {
      color: inherit;
      background: inherit;
      margin: 0;
      padding: 0;
      background: none;
      border: none;
    }
  }
</style>

<script>
import firebase from "firebase";
export default {
  components: {},
  data() {
    return {
      routerProcess: false,
      log: [],
      running: '',
      available: '',
      pending: '',
      scansTotal: '',
      isNeedAuth: true,
    };
  },

  computed: {
    url: {
      get() {
        return this.$store.state.url;
      },
      set(val) {
        this.$store.commit('url', val);
      }
    },
    args: {
      get() {
        return this.$store.state.args;
      },
      set(val) {
        this.$store.commit('args', val);
      }
    },
    serverUrl: {
      get() {
        return this.$store.state.serverUrl;
      },
      set(val) {
        this.$store.commit('serverUrl', val);
      }
    },

    pageTitle() {
      return `Scan url: ${this.url}, args: ${this.args} - site-audit-seo`;
    },
  },

  methods: {
    // form state to GET params
    updateUrlQuery(push = false) {
      if (this.routerProcess) return;
      this.routerProcess = true;
      setTimeout(() => {
        this.routerProcess = false;
      }, 100);

      let query = {};
      if (this.url) query.url = this.url;
      if (this.args) query.args = this.args;

      // console.log('route scan: updateUrlQuery:', query);
      if (push) this.$router.push({ query });
      else this.$router.replace({ query });
    },

    // GET params to form state
    updateFormFromQuery() {
      // console.log('updateFormFromQuery: ', this.$route.query);
      if (this.routerProcess) return;
      if (this.$route.query["fields"]) return; // ignore params from viewer

      for (let paramName of ['url', 'args', 'serverUrl']) {
        const val = this.$route.query[paramName];
        if (val) {
          if (paramName === 'url' && val.includes('/reports/')) continue;
          this[paramName] = val;
        }
      }
    },

    async sendTask() {
      this.log.splice(0, this.log.length);
      const opts = {
        url: this.url,
        args: this.args
      };

      this.updateUrlQuery(true); // set in url only scanned

      console.log("scan:", opts);
      this.socket.emit('scan', opts);
      // const res = await this.$axios.$post(`${this.serverUrl}/scan`, opts);
      // console.log('res: ', res);
    },

    auth() {
      if (this.socket.connected && this.$store.state.user?.uid && this.isNeedAuth) {
        this.isNeedAuth = false;
        this.socket.emit('auth', this.$store.state.user);
      }
    },

    submitEvents(key) {
      // console.log('this.socket: ', this.socket);

      // log to "terminal"
      this.socket.on("status" + key, (msg, cb) => {
        console.log(`msg ${key}: ${msg}`);
        this.log.push(msg);
      });
      this.socket.on("status", (msg, cb) => {
        console.log('msg: ', msg);
        this.log.push(msg);
      });

      // server queue info
      this.socket.on("serverState" + key, (serverState, cb) => {
        // console.log('msg: ', msg);
        for (let name in serverState) {
          if (this[name] !== undefined) this[name] = serverState[name];
          // this.serverState[name] = serverState[name];
        }
      });

      // scan result
      this.socket.on("result" + key, (data, cb) => {
        const viewerUrl = window.location.origin + this.$router.options.base;
        if (data.json) {
          const url = viewerUrl + '?url=' + data.json;
          this.log.push(`result: <a target="_blank" href="${url}">${url}</a>`);
          this.$store.commit('itemsJsonUrl', data.json);
        }
        if (data.name) {
          let baseUrl = `${this.serverUrl}/reports`;
          if (this.$store.state.user?.uid) {
            const userDir = this.$store.state.user.uid.slice(0, 5);
            baseUrl += '/' + userDir;
          }
          const jsonUrl = `${baseUrl}/${data.name}`;
          const url = `${viewerUrl}?url=${jsonUrl}`;
          this.log.push(`result: <a target="_blank" href="${url}">${url}</a>`);
          this.$store.commit('itemsJsonUrl', jsonUrl);
        }
      });
    },
  },

  async mounted() {
    this.socket = this.$nuxtSocket({
      channel: "/",
      reconnection: true,
      reconnectionDelayMax: 10000,
      teardown: false,
    });

    /* Listen for events: */

    this.socket.on("connect", () => {
      this.auth();
    });

    this.socket.on("disconnect", () => {
      this.log.push('server disconnected');
      this.isNeedAuth = true;
      this.running = '';
    });

    this.socket.on("reconnect_attempt", () => {
      this.log.push('try to connect ' + this.serverUrl + '...');
    });

    firebase.auth().onAuthStateChanged(user => {
      // if (!user) user = { uid: 'anon' + Math.random() * 100000}
      this.auth();
      this.submitEvents(this.$store.state.user?.uid || '');
    });

    // router change event
    this.$router.afterEach((to, from) => {
      this.updateFormFromQuery();
    });

    this.updateFormFromQuery(); // update form after localStorage
  },

  
  head() {
    return {
      title: this.pageTitle
    }
  }

};
</script>
