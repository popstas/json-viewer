<template>
  <section class="scan__container">
    <el-form :inline="true" class="scan__form" ref="form">
      <el-form-item label="URL">
        <el-input v-model="url"></el-input>
      </el-form-item>
      <el-form-item label="Arguments">
        <el-input v-model="args"></el-input>
      </el-form-item>
      <el-form-item label="Server URL" class="form__server-url">
        <el-input v-model="serverUrl"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="sendTask">Scan</el-button>
      </el-form-item>
    </el-form>

    <ul class="scan__log" v-chat-scroll>
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
      log: [],
      running: '',
      available: '',
      pending: '',
      scansTotal: '',
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
  },

  methods: {
    async sendTask() {
      this.log.splice(0, this.log.length);
      const opts = {
        url: this.url,
        args: this.args
      };
      console.log("scan:", opts);
      this.socket.emit('scan', opts);
      // const res = await this.$axios.$post(`${this.serverUrl}/scan`, opts);
      // console.log('res: ', res);
    },

    submitEvents(key) {
      console.log('this.socket: ', this.socket);
      this.socket.on("status" + key, (msg, cb) => {
        console.log(`msg ${key}: ${msg}`);
        this.log.push(msg);
      });
      this.socket.on("status", (msg, cb) => {
        console.log('msg: ', msg);
        this.log.push(msg);
      });

      this.socket.on("serverState" + key, (serverState, cb) => {
        // console.log('msg: ', msg);
        for (let name in serverState) {
          if (this[name] !== undefined) this[name] = serverState[name];
          // this.serverState[name] = serverState[name];
        }
      });

      this.socket.on("result" + key, (data, cb) => {
        const viewerUrl = window.location.origin + this.$router.options.base;
        if (data.json) {
          const url = viewerUrl + '?url=' + data.json;
          this.log.push(`result: <a target="_blank" href="${url}">${url}</a>`);
        }
        if (data.name) {
          const url = `${viewerUrl}?url=${this.serverUrl}/reports/${data.name}`;
          this.log.push(`result: <a target="_blank" href="${url}">${url}</a>`);
        }
      });
    },
  },

  async mounted() {
    this.socket = this.$nuxtSocket({
      channel: "/",
    });

    /* Listen for events: */

    /* this.socket.on("disconnect", () => {
      this.log.push('server disconnected');
    });

    this.socket.on("reconnect_attempt", () => {
      this.log.push('server reconnected');
    });

    this.socket.on("reconnect", () => {
      this.log.push('server reconnected');
    }); */

    firebase.auth().onAuthStateChanged(user => {
      // if (!user) user = { uid: 'anon' + Math.random() * 100000}
      this.socket.emit('auth', this.$store.state.user);
      this.submitEvents(this.$store.state.user?.uid || '');
    });

    // submitEvents(user.uid);

  }
};
</script>
