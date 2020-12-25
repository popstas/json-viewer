<template>
  <section class="scan__container">
    <el-form :inline="isInlineForm" class="scan__form" ref="form">

      <el-form-item>
        <el-switch class="urls-mode-switch"
          v-model="isUrls"
          active-text="urls"
          inactive-text="site"
        >
        </el-switch>
      </el-form-item>

      <el-form-item v-if="isUrls">
        <el-link
          type="primary" v-if="!urlsShow"
          @click.native.prevent="urlsShow = !urlsShow"
          v-html="`show urls (${urlList.length})`"
          :title="urlList.join('\n')"
        ></el-link>

        <el-input v-if="urlsShow" v-model="urls" type="textarea" :rows="10" wrap="soft" autofocus :autosize="{ minRows: 1, maxRows: 10}"
          placeholder="One line - one URL"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="!isUrls">
        <el-input v-model="url" @keydown.enter.native="sendTask" autofocus class="form__url"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="sendTask">Scan</el-button>
      </el-form-item>
    </el-form>

    <el-form class="scan__form-settings">
      <el-collapse v-model="openedPanels" class="panels">
        <Panel
          name="settings"
          title="Settings"
          icon="el-icon-setting"
        >
          <el-form-item label="Preset">
            <el-select v-model="form.preset">
              <el-option
                v-for="preset of ['minimal', 'seo', 'headers', 'parse', 'lighthouse', 'lighthouse-all']" :key="preset"
                :value="preset"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Scan Lighthouse">
            <el-switch v-model="form.lighthouse"></el-switch>
          </el-form-item>

          <el-form-item label="Max depth">
            <el-input-number v-model="form.depth" :min="1" :max="100"></el-input-number>
          </el-form-item>

          <el-form-item label="Max requests">
            <el-input-number v-model="form.maxRequests" :min="0"></el-input-number>
          </el-form-item>

          <el-form-item label="Ignore robots.txt">
            <el-switch v-model="form.ignoreRobotsTxt"></el-switch>
          </el-form-item>

          <el-form-item label="Follow sitemap.xml">
            <el-switch v-model="form.followXmlSitemap"></el-switch>
          </el-form-item>

          <el-form-item label="Arguments">
            <el-input v-model="args" @keydown.enter.native="sendTask"></el-input>
          </el-form-item>

          <el-form-item label="Server URL">
            <el-input v-model="serverUrl"></el-input>
          </el-form-item>

        </Panel>
      </el-collapse>
      
    </el-form>

    <ul class="scan__log"
      v-chat-scroll="{always: false, smooth: false}"
      v-if="log.length > 0"
    >
      <li v-for="(line, index) in log" :key="index" v-html="line"></li>
    </ul>

    <div class="scan__server-state" v-if="running !== ''">
      <h3>Server state:</h3>
      <ul class="server-state">
        <li>running: {{ running }}</li>
        <!-- <li>available: {{ available }}</li> -->
        <li>pending: {{ pending }}</li>
        <li>total scanned: {{ scansTotal }}</li>
      </ul>
    </div>

  </section>
</template>

<style lang="scss">
  .scan__container {
    padding: 0 8px;

    .el-collapse {
      border: none;
      margin-top: -25px;
    }
  }

  .scan__form {
    // padding: 0 8px;
    // margin-top: 30px;
    max-width: 1200px;

    input {
      padding: 0 10px;
      // min-width: 270px;
    }

    textarea {
      min-width: 360px;
      white-space: nowrap;
      overflow-x: auto;
    }

    .form__url {
      min-width: 360px;
    }
  }

  .scan__log {
    font-family: monospace;
    background: #2d2d2d;
    color: #ccc;
    list-style: none;
    margin: 0;
    padding: 5px 10px;
    max-height: calc(100vh - 170px);
    overflow-x: auto;

    @media (max-width: 768px) {
      margin: 0 -8px;
      font-size: 10px;
      line-height: 1em;
    }

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

  .scan__server-state {
    padding: 8px 0;
  }
</style>

<script>
import Panel from "~/components/Panel";
import firebase from "firebase";

const defaultForm = {
  preset: 'seo',
  depth: 10,
  maxRequests: 50,
  ignoreRobotsTxt: false,
  followXmlSitemap: false,
  lighthouse: false,
};

const controlsMap = {
  preset: {
    arg: '--preset',
  },
  depth: {
    arg: '-d'
  },
  maxRequests: {
    arg: '-m'
  },
  ignoreRobotsTxt: {
    arg: '--ignore-robots-txt',
    type: 'boolean',
  },
  followXmlSitemap: {
    arg: '--follow-xml-sitemap',
    type: 'boolean',
  },
  lighthouse: {
    arg: '--lighthouse',
    type: 'boolean',
  },
};

export default {
  components: { Panel },
  data() {
    return {
      routerProcess: false,
      running: '',
      available: '',
      pending: '',
      scansTotal: '',
      isNeedAuth: true,
      openedPanels: [],
      isUrls: false,
      urlsShow: false,
      form: {...defaultForm},
    };
  },

  computed: {
    log(){
      return this.$store.state.log;
    },

    url: {
      get() {
        return this.$store.state.url;
      },
      set(val) {
        this.$store.commit('url', val);
      }
    },
    urls: {
      get() {
        return this.$store.state.urls;
      },
      set(val) {
        this.$store.commit('urls', val);
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

    isInlineForm() {
      return window.innerWidth > 768;
    },

    urlList() {
      return this.urls.
        split(/[,\s]/).
        map(url => url.trim()).
        filter(url => url);
    },
  },

  watch: {
    isUrls(val) {
      // console.log('val: ', val);
      if (!val) this.urlsShow = true;
    }
  },

  methods: {
    logPush(msg) {
      const log = [...this.log, ...[msg]];
      if (log.length > 10000) log.shift();
      this.$store.commit('log', log);
    },

    // form state to GET params
    updateUrlQuery(push = false) {
      if (this.routerProcess) return;
      this.routerProcess = true;
      setTimeout(() => {
        this.routerProcess = false;
      }, 100);

      let query = {};

      if (this.isUrls) {
        if (this.urlList.length > 0) query.urls = this.urlList.join(',');
        if (query.urls.length > 5000) delete(query.urls);
      } else {
        if (this.url) query.url = this.url;
      }

      const args = this.buildArgs(false);
      if (args) query.args = args;

      // console.log('route scan: updateUrlQuery:', query);
      if (push) this.$router.push({ query });
      else this.$router.replace({ query });
    },

    // GET params to form state
    updateFormFromQuery() {
      // console.log('updateFormFromQuery: ', this.$route.query);
      if (this.routerProcess) return;
      if (this.$route.query["fields"]) return; // ignore params from viewer

      for (let paramName of ['url', 'urls', 'args', 'serverUrl']) {
        let val = this.$route.query[paramName];
        if (val) {
          if (paramName === 'url' && val.includes('/reports/')) continue;
          if (paramName === 'urls') {
            val = val.split(',').join('\n');
            this.isUrls = true;
            this.urlsShow = false;
          }
          if (paramName === 'args') {
            const unknownArgs = this.parseKnownArgs(val);
            // console.log('unknownArgs: ', unknownArgs);
            val = unknownArgs.join(' ');
          }

          this[paramName] = val;
        }
      }
    },

    // update this.form, return unknown args array
    parseKnownArgs(args) {
      args = args.trim();
      const argNameMap = {};
      for (let name in controlsMap) {
        const conf = controlsMap[name];
        // console.log('name: ', name);
        // console.log('conf: ', conf);
        argNameMap[conf.arg] = name;
      }

      const unknownArgs = [];
      const result = {};
      const parts = args.split(' ');
      let lastVal = false;

      for (let i in parts) {
        if (lastVal) {
          lastVal = false;
          continue;
        }

        const part = parts[i];
        const formItemName = argNameMap[part];
        if (!formItemName) {
          unknownArgs.push(part);
          continue;
        }
        const defaultVal = defaultForm[formItemName];

        const conf = controlsMap[formItemName];

        // --lighthouse
        if (conf.type === 'boolean') this.form[formItemName] = true;
        else {
          const val = parts[parseInt(i) + 1];
          // console.log('formItemName: ', formItemName);
          // console.log('val: ', val);
          if (val) {
            this.form[formItemName] = val;
            lastVal = true;
          }
        }
      }

      return unknownArgs;
    },

    buildArgs(withDefault = true) {
      let args = this.args;

      if (this.isUrls && this.urlList.length > 0) {
        args += ' --urls ' + this.urlList.join(',');
      }

      // args from form
      for (let name in controlsMap) {
        const conf = controlsMap[name];
        const val = this.form[name];

        // ignore default
        if (!withDefault && val === defaultForm[name]) continue;

        if (conf.type === 'boolean') {
          if (!val) continue;
          args += ' ' + conf.arg;
        }
        else {
          args += ` ${conf.arg} ${val}`;
        }
      }

      return args;
    },

    async sendTask() {
      this.$store.commit('log', []); // clear log
      this.urlsShow = false;

      const opts = {
        url: this.url,
        args: this.buildArgs()
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
        this.logPush(msg);
      });
      this.socket.on("status", (msg, cb) => {
        console.log('msg: ', msg);
        this.logPush(msg);
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
          this.logPush(`result: <a href="${url}">${url}</a>`);
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
          this.logPush(`result: <a href="${url}">${url}</a>`);
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
      this.logPush('server disconnected');
      this.isNeedAuth = true;
      this.running = '';
    });

    this.socket.on("reconnect_attempt", () => {
      this.logPush('try to connect ' + this.serverUrl + '...');
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
