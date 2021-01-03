<template>
  <section class="scan__container">

    <el-row class="scan__form">
      <el-col :span="4" :xs="24" class="form__urls-switch-col">
        <el-switch class="urls-mode-switch"
          v-model="isUrls"
          active-text="urls"
          inactive-text="site"
        >
        </el-switch>
      </el-col>

      <el-col :span="16" :xs="24">
        <div class="scan__urls" v-if="isUrls">
          <el-link
            type="primary" v-if="!urlsShow"
            @click.native.prevent="urlsShow = !urlsShow"
            v-html="`show urls (${urlList.length})`"
            :title="urlList.join('\n')"
          ></el-link>

          <el-input v-if="urlsShow" v-model="urls" type="textarea" :rows="10" wrap="soft" autofocus :autosize="{ minRows: 1, maxRows: 10}"
            placeholder="One line - one URL"
          ></el-input>
        </div>
        <span v-if="!isUrls">
          <el-autocomplete v-model="url" @keydown.enter.native.prevent="sendTask" autofocus class="form__url"
            :fetch-suggestions="historySearch"
          ></el-autocomplete>
        </span>

        <el-button :disabled="!isScanEnabled" type="primary" @click="sendTask">Scan</el-button>
        <el-button :disabled="!isScanEnabled" type="primary" class="scan__lighthouse-button" @click="sendTask({maxRequests: 1, lighthouse: true})">Lighthouse one page</el-button>
        <!-- <el-button :disabled="!isScanEnabled" type="primary" @click="sendTask({preset: 'minimal', maxRequests: 0, lighthouse: false})">Warm</el-button> -->
      </el-col>

      <el-col :span="4" :xs="24" style="text-align:left">
      </el-col>
    </el-row>

    <el-row style="clear:both">

        <el-collapse v-model="openedPanels" class="panels">
          <Panel name="settings" icon="el-icon-setting" title="Settings" :subtitle="argsWithoutDefault" >

          <el-form class="scan__form-settings">

              <el-tabs type="border-card" v-model="activeTab">

                <el-tab-pane id="tab-general" name="general" label="General">

                  <fieldset>
                    <legend>Audit</legend>

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

                    <el-form-item label="Follow sitemap.xml">
                      <el-switch v-model="form.followXmlSitemap"></el-switch>
                    </el-form-item>

                    <el-form-item label="Ignore robots.txt">
                      <el-switch v-model="form.ignoreRobotsTxt"></el-switch>
                    </el-form-item>

                  </fieldset>

                  <fieldset>
                    <legend>Advanced</legend>

                      <el-form-item label="Server URL">
                        <el-input v-model="serverUrl"></el-input>
                      </el-form-item>

                      <el-form-item label="Max depth">
                        <el-input-number v-model="form.depth" :min="1" :max="100" @keydown.enter.native="sendTask"></el-input-number>
                      </el-form-item>

                      <el-form-item label="Max requests">
                        <el-input-number v-model="form.maxRequests" :min="0" @keydown.enter.native.prevent="sendTask"></el-input-number>
                      </el-form-item>

                      <el-form-item label="Arguments">
                        <el-input class="scan__args" v-model="args" @keydown.enter.native="sendTask"></el-input>
                      </el-form-item>

                  </fieldset>

                </el-tab-pane>

                <el-tab-pane id="tab-extractors" name="extractors" label="Extractors">

                  <fieldset>
                    <legend>Language Detection</legend>

                    <el-form-item label="Enable">
                      <el-switch v-model="form.languageDetection"></el-switch>
                    </el-form-item>

                    <el-form-item label="Whitelist Languages (ISO 639-1)">
                      <el-input-tag v-model="form.languageWhitelist"></el-input-tag>
                    </el-form-item>

                    <el-form-item label="Blacklist Languages (ISO 639-1)">
                      <el-input-tag v-model="form.languageBlacklist"></el-input-tag>
                    </el-form-item>

                  </fieldset>

                  <fieldset>
                    <legend>HtmlGrabbr</legend>

                    <el-form-item label="Enable">
                      <el-switch v-model="form.htmlGrabbr"></el-switch>
                    </el-form-item>

                    <el-form-item label="Print debug logs">
                      <el-switch v-model="form.htmlGrabbrDebug"></el-switch>
                    </el-form-item>

                    <el-form-item label="Beautify HTML content">
                      <el-switch v-model="form.htmlGrabbrPretty"></el-switch>
                    </el-form-item>

                    <el-form-item label="Page illustration">
                      <el-switch v-model="form.htmlGrabbrPageIllustration"></el-switch>
                    </el-form-item>

                    <el-form-item label="Excerpt (from meta data or HTML)">
                      <el-switch v-model="form.htmlGrabbrExcerpt"></el-switch>
                    </el-form-item>

                    <el-form-item label="Read length">
                      <el-switch v-model="form.htmlGrabbrReadLength"></el-switch>
                    </el-form-item>

                    <el-form-item label="Embedded image URLs">
                      <el-switch v-model="form.htmlGrabbrEmbeddedImageURLs"></el-switch>
                    </el-form-item>

                  </fieldset>

                </el-tab-pane>

                <el-tab-pane id="tab-ai" name="ai" label="Predictive">

                  <fieldset>
                    <legend>Reading Time Estimation</legend>
                    <el-form-item label="Enable">
                      <el-switch v-model="form.readingTime"></el-switch>
                    </el-form-item>
                  </fieldset>

                  <fieldset>
                    <legend>Yake</legend>

                    <el-form-item label="Enable">
                      <el-switch v-model="form.yake"></el-switch>
                    </el-form-item>

                    <el-form-item label="Language">
                      <el-select v-model="form.yakeLanguage">
                        <el-option
                          v-for="yakeLanguage of ['auto', 'en', 'fr', 'ru']" :key="yakeLanguage"
                          :value="yakeLanguage"></el-option>
                      </el-select>
                    </el-form-item>

                    <el-form-item label="Max NGRAM Size">
                      <el-input-number v-model="form.yakeMaxNgramSize" :default="3" :min="1" :max="4" @keydown.enter.native.prevent="sendTask"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Ngram Score Thresold">
                      <el-input-number v-model="form.yakeNgramThreshold" :precision="3" :step="0.01" :default="0.02" :min="0" :max="1" @keydown.enter.native.prevent="sendTask"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Number of Keywords">
                      <el-input-number v-model="form.yakeNumberKeywords" :default="10" :min="1" :max="20" @keydown.enter.native.prevent="sendTask"></el-input-number>
                    </el-form-item>

                    <el-form-item label="Server URL">
                      <el-input v-model="form.yakeServerUrl"></el-input>
                    </el-form-item>

                  </fieldset>

                </el-tab-pane>

                <el-tab-pane id="tab-export" name="export" label="Export">

                  <fieldset>
                    <legend>InfluxDB</legend>

                    <el-form-item label="Enable">
                      <el-switch v-model="form.influxDB"></el-switch>
                    </el-form-item>

                    <el-form-item label="Database">
                      <el-input v-model="form.influxDatabase"></el-input>
                    </el-form-item>

                    <el-form-item label="Measurement">
                      <el-input v-model="form.influxMeasurement"></el-input>
                    </el-form-item>

                  </fieldset>

                </el-tab-pane>

                <el-tab-pane id="tab-notification" name="notification" label="Notification">

                  <fieldset>
                    <legend><i class="fab fa-slack"></i> Slack</legend>
                    <el-form-item label="Slack Notify">
                      <el-switch v-model="form.slackNotify"></el-switch>
                    </el-form-item>

                    <el-form-item label="Conversation ID (can be a channel ID, a DM ID, a MPDM ID, or a group ID)">
                      <el-input v-model="form.slackConversationID"></el-input>
                    </el-form-item>

                  </fieldset>

                </el-tab-pane>
              </el-tabs>

          </el-form>
        </Panel>
      </el-collapse>

      <div class="scan__buttons-secondary" v-if="openedPanels.includes('settings')">
        <el-button :disabled="!isScanEnabled" type="primary" @click="sendTask">Scan</el-button>
        <el-button :disabled="!isScanEnabled" type="primary" class="scan__lighthouse-button" @click="sendTask({maxRequests: 1, lighthouse: true})">Lighthouse one page</el-button>
      </div>

      <div class="scan__current">
        <!-- {{ currentScanPage }} / {{ currentScanQueue }} -->
        <el-progress :percentage="currentScanPercent" :format="showCurrentScan"></el-progress>
        <i v-if="currentScanPage" class="el-icon-loading"></i>
      </div>

    </el-row>

    <NuxtLink :to="'/?url='+itemsJsonUrl" v-if="itemsJsonUrl" 
      :class="{'scan__report-link': true, 'el-button': true, 'is-round': true, 'el-button--success': lastUpdated && !currentScanPage}"
    >
      Report: {{ $store.getters.shortReportUrl(itemsJsonUrl) }}
    </NuxtLink>
    <div class="scan__report-updated" v-if="lastUpdatedHuman && !currentScanPage">{{ lastUpdatedHuman }} ago</div>


    <div class="scan__log-container">
      <el-link @click="showLog = !showLog">{{ showLog ? 'hide log' : 'show log' }}</el-link>
      <ul class="scan__log"
        v-chat-scroll="{always: false, smooth: false}"
        v-if="showLog && log.length > 0"
      >
        <li v-for="(line, index) in log" :key="index" v-html="line"></li>
      </ul>
    </div>

    <el-row class="scan__server-state" v-if="showLog && running !== ''">
      <h3>Server state:</h3>
      <el-col :span="12">
        <ul class="server-state">
          <li>running: {{ running }}</li>
          <!-- <li>available: {{ available }}</li> -->
          <li>pending: {{ pending }}</li>
          <li>connections: {{ connections }}</li>
        </ul>
      </el-col>
      <el-col :span="12">
        <ul class="server-state">
          <li>total scans: {{ scansTotal }} (all time: {{ scansTotalAll }})</li>
          <li>total pages: {{ pagesTotal }} (all time: {{ pagesTotalAll }})</li>
          <li>uptime: {{ uptimeHuman }}</li>
          <li>reboots: {{ reboots }}</li>
        </ul>
      </el-col>
    </el-row>

  </section>
</template>

<style lang="scss">
  .scan__container {
    padding: 0 8px;
    text-align: center;

    .el-collapse {
      border: none;
      margin-top: -25px;
    }
  }

  .scan__form {
    // padding: 0 8px;
    // margin-top: 30px;
    margin: 0 auto;
    max-width: 1200px;

    input {
      padding: 0 10px;
      // min-width: 270px;
    }

    textarea {
      min-width: 380px;
      min-height: 40px !important;
      white-space: nowrap;
      overflow-x: auto;
    }

    .form__urls-switch-col {
      padding: 10px 0;
      @media (min-width: 640px) {
        text-align: right;
        margin-right: 10px;
      }
    }

    .form__url {
      min-width: 380px;
      @media (max-width: 640px) {
        padding-bottom: 10px;
      }
    }

    .scan__urls {
      padding-bottom: 10px;
    }

    .scan__lighthouse-button {
      margin-left: 0;
    }
  }

  .scan__buttons-secondary {
    clear: both;
  }

  .scan__current {
    padding-top: 10px;
    // margin-left: 10px;
    margin: 0 auto;
    max-width: 640px;

    .el-progress__text {
      display: block;
    }
  }

  .scan__args input {
    font-family: monospace;
  }

  .scan__report-link {
    margin: 15px 0;
  }

  .scan__report-updated {
    margin-left: 15px;
    color: #999;
    white-space: nowrap;
  }

  .scan__form-settings {
    text-align: right;
    max-width: 1024px;
    margin: 0 auto;

    .el-collapse-item__header,
    .el-collapse-item__wrap {
      border: none;
    }

    .el-input-tag {
      text-align: left;
      height: 44px;
    }

    .el-collapse-item__content {
      padding-bottom: 0;
    }

  }

  .scan__log-container {
    text-align: left;
  }

  .scan__log {
    font-family: monospace;
    background: #2d2d2d;
    color: #ccc;
    list-style: none;
    margin: 5px 0 0;
    padding: 5px 10px;
    max-height: calc(100vh - 170px);
    overflow-x: auto;

    @media (max-width: 768px) {
      margin: 0 -8px;
      font-size: 10px;
      line-height: 1em;
    }

    @media (min-height: 768px) {
      max-height: 600px;
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
    text-align: left;
  }
</style>

<script>
import Panel from "~/components/Panel";
import firebase from "firebase";
import _ from "lodash";
const url = require('url');

const controlsMap = {
  preset: {
    arg: '--preset',
  },
  depth: {
    arg: '--max-depth'
  },
  maxRequests: {
    arg: '--max-requests'
  },
  ignoreRobotsTxt: {
    arg: '--ignore-robots-txt',
    type: 'boolean',
  },
  followXmlSitemap: {
    arg: '--follow-xml-sitemap',
    type: 'boolean',
  },
  // language-detection
  languageDetection: {
    arg: '--language-detection',
    type: 'boolean',
  },  
  languageWhitelist: {
    arg: '--language-whitelist',
  },
  languageBlacklist: {
    arg: '--language-blacklist',
  },  
  // readingTime
  readingTime: {
    arg: '--reading-time',
    type: 'boolean',
  },
  // readingTime
  htmlGrabbr: {
    arg: '--html-grabbr',
    type: 'boolean',
  },
  // Yake
  yake: {
    arg: '--yake',
    type: 'boolean',
  },
  yakeServerUrl: {
    arg: '--yake-server-url',
  },
  yakeLanguage: {
    arg: '--yake-language',
  },
  yakeMaxNgramSize: {
    arg: '--yake-max-ngram-size',
  },
  yakeNumberKeywords: {
    arg: '--yake-number-keywords',
  },
  yakeNgramThreshold: {
    arg: '--yake-ngram-threshold',
  },
  // InfluxDB
  influxDB: {
    arg: '--influxdb',
    type: 'boolean',
  },
  influxDatabase: {
    arg: '--influxdb-database',
  },
  influxMeasurement: {
    arg: '--influxdb-measurement',
  },
  // Slack
  slackNotify: {
    arg: '--slack',
    type: 'boolean',
  },
  slackConversationID: {
    arg: '--slack-conversation-id',
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
      activeTab: "general",
      routerProcess: false,
      running: '',
      available: '',
      pending: '',
      connections: '',
      scansTotal: '',
      pagesTotal: '',
      scansTotalAll: '',
      pagesTotalAll: '',
      uptime: '',
      reboots: '',
      isNeedAuth: true,
      openedPanels: [],
      isUrls: false,
      urlsShow: false,
      connected: false,
      lastUpdated: '',
      lastUpdatedHuman: '',
      form: {},
      currentScanPage: '',
      currentScanQueue: '',
      currentScanPercent: 0,
      showLog: false,
    };
  },

  computed: {
    log(){
      return this.$store.state.log;
    },

    isScanEnabled() {
      return this.connected && !this.currentScanPage;
    },

    scanDefaultForm(){
      return this.$store.state.scanDefaultForm;
    },

    scanUrlHistory(){
      return this.$store.state.scanUrlHistory;
    },

    itemsJsonUrl(){
      return this.$store.state.itemsJsonUrl;
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
    argsWithoutDefault() {
      return this.buildArgs(false);
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
      const domain = url.parse((this.url)).hostname;
      return `Audit ${domain}`
        + (this.argsWithoutDefault ? ` - args: ${this.argsWithoutDefault}` : '')
        + ` - site-audit-seo`;
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

    uptimeHuman() {
      if (!this.uptime) return '';
      const delta = this.uptime;
      let mins = Math.floor(delta / 60); // s to min
      let hours = Math.floor(mins / 60);
      const days = Math.floor(mins / 1440);
      mins = mins % 60;
      hours = hours % 24;

      const parts = [];
      if (days) parts.push(`${days}d`);
      if (hours || days) parts.push(`${hours}h`);
      parts.push(`${mins}m`);
      return parts.join(' ');
    }
  },

  watch: {
    isUrls(val) {
      console.log('val: ', val);
      if (!val) this.urlsShow = true;
    }
  },

  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },

    logPush(msg) {
      const log = [...this.log, ...[msg]];
      if (log.length > 10000) log.shift();
      this.$store.commit('log', log);
    },

    showCurrentScan(percentage) {
      if (!this.currentScanPage && !this.currentScanQueue) return '';
      if (this.currentScanPage == 'Pending...') return this.currentScanPage;
      return `${this.currentScanPage || this.currentScanQueue} / ${this.currentScanQueue || '?'}`;
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

      if (this.argsWithoutDefault) query.args = this.argsWithoutDefault;

      console.log('route scan: updateUrlQuery:', query);
      if (push) this.$router.push({ query });
      else this.$router.replace({ query });
    },

    // GET params to form state
    updateFormFromQuery() {
      console.log('updateFormFromQuery: ', this.$route.query);
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
        console.log('name: ', name);
        console.log('conf: ', conf);
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
        const defaultVal = this.scanDefaultForm[formItemName];

        const conf = controlsMap[formItemName];

        // --lighthouse
        if (conf.type === 'boolean') this.form[formItemName] = true;
        else {
          const val = parts[parseInt(i) + 1];
          console.log('formItemName: ', formItemName);
          console.log('val: ', val);
          if (val) {
            this.form[formItemName] = val;
            lastVal = true;
          }
        }
      }

      return unknownArgs;
    },

    buildArgs(withDefault = true, overrides = {}) {
      let args = this.args;

      if (this.isUrls && this.urlList.length > 0) {
        args += ' --urls ' + this.urlList.join(',');
      }

      // args from form
      for (let name in controlsMap) {
        const conf = controlsMap[name];
        const val = overrides[name] || this.form[name];

        // ignore default
        if (!withDefault && val === this.scanDefaultForm[name]) continue;

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

    closeSettings() {
      const pindex = this.openedPanels.indexOf('settings');
      if (pindex !== -1) this.openedPanels.splice(pindex, 1);
    },

    async sendTask(overrides = {}) {
      this.$store.commit('log', []); // clear log
      this.urlsShow = false;
      this.closeSettings();

      const opts = {
        url: this.url,
        args: this.buildArgs(true, overrides)
      };


      this.updateUrlQuery(true); // set in url only scanned

      // save url scan history
      if (!this.isUrls) {
        this.$store.commit('addUrlHistory', this.url);
      }

      console.log("scan:", opts);
      this.socket.emit('scan', opts);

      // const res = await this.$axios.$post(`${this.serverUrl}/scan`, opts);
      // console.log('res: ', res);
    },

    auth() {
      console.log('this.socket.connected', this.socket.connected);
      console.log('this.$store.state.user?.uid', this.$store.state.user?.uid);
      console.log('this.isNeedAuth', this.isNeedAuth);
      if (this.socket.connected && this.$store.state.user?.uid && this.isNeedAuth) {
        this.isNeedAuth = false;
        this.socket.emit('auth', this.$store.state.user);
      }
    },

    submitEvents(key) {
      // console.log('this.socket: ', this.socket);

      // log to "terminal"
      this.socket.on("status" + key, (msg, cb) => {
        // console.log(`msg ${key}: ${msg}`);


        // current scan status extract
        const res = msg.match(/^(\d+).*\((\d+)\)$/);
        if (res) {
          // console.log('res: ', res);
          this.currentScanPage = res[1];
          this.currentScanQueue = parseInt(res[2]);
          if (this.form.maxRequests && this.form.maxRequests < this.currentScanQueue) {
            this.currentScanQueue = this.form.maxRequests;
          }

          // when page > queue
          if (this.currentScanPage > this.currentScanQueue) this.currentScanQueue = this.currentScanPage;

          this.currentScanPercent = Math.round(this.currentScanPage / this.currentScanQueue * 100);
          if (this.currentScanQueue < 10) this.currentScanPercent = 0; // in begin
          this.currentScanPercent = Math.min(100, this.currentScanPercent); // when overscan
          if (!this.currentScanPage && this.lastUpdated) this.currentScanPercent = 100; // when finished
        }

        if (msg.includes('Finish audit')) {
          this.currentScanPage = '';
        }

        if (msg.includes('Pending...')) {
          this.currentScanPage = 'Pending...';
        }

        this.logPush(msg);
      });
      this.socket.on("status", (msg, cb) => {
        console.log('msg: ', msg);
        this.logPush(msg);
      });

      // server queue info
      this.socket.on("serverState" + key, (serverState, cb) => {
        // update last report date
        this.lastUpdatedHuman = this.getLastUpdatedHuman();

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
          this.lastUpdated = Date.now();
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
          this.lastUpdated = Date.now();
        }
      });
    },

    // url history autocomplete
    historySearch(q, cb) {
      let res = [];
      let all = [];

      for (let url in this.scanUrlHistory) {
        all.push(url);
        if (url.includes(q)) res.push(url);
      }

      if (res.length <= 1) {
        res = [...res, ...all];
      }

      res = _.uniq(res);

      // limit 20
      if (res.length > 20) res = res.slice(0, 20);

      res = res.map(value => {
        return { value }
      });
      cb(res);
    },

    getLastUpdatedHuman() {
      if (!this.lastUpdated) return '';
      const delta = (Date.now() - this.lastUpdated) / 1000;
      let mins = Math.floor(delta / 60); // s to min
      let hours = Math.floor(mins / 60);
      const days = Math.floor(mins / 1440);
      mins = mins % 60;
      hours = hours % 24;

      const parts = [];
      if (days) parts.push(`${days}d`);
      if (hours || days) parts.push(`${hours}h`);
      parts.push(`${mins}m`);
      return parts.join(' ');
    }
  },

  async mounted() {
    this.socket = this.$nuxtSocket({
      channel: "/",
      path: "/api/v1/sas/socket.io",
      reconnection: true,
      reconnectionDelayMax: 10000,
      teardown: false,
    });

    this.form = {...this.scanDefaultForm};
    /* Listen for events: */

    this.socket.on("connect", () => {
      this.connected = true;
      this.auth();
      this.submitEvents(this.$store.state.user?.uid || '');
    });

    this.socket.on("disconnect", () => {
      this.logPush('server disconnected');
      this.isNeedAuth = true;
      this.connected = false;
      this.running = '';
    });

    this.socket.on("reconnect_attempt", () => {
      this.logPush('try to connect ' + this.serverUrl + '...');
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