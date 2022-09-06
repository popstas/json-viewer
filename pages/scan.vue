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

          <el-link
            type="primary" v-if="urlsShow"
            @click.native.prevent="urlsShow = !urlsShow"
            v-html="`hide urls (${urlList.length})`"
          ></el-link>
        </div>
        <span v-if="!isUrls">
          <el-autocomplete v-model="url" @keydown.enter.native.prevent="sendTask" autofocus class="form__url"
            :fetch-suggestions="historySearch"
          ></el-autocomplete>
        </span>

        <el-button :disabled="!isScanEnabled" :type="isReportSuccess ? 'secondary' : 'primary'" @click="sendTask">Scan</el-button>
        <el-button :disabled="!isScanEnabled" type="secondary" class="scan__lighthouse-button" @click="sendTask({maxRequests: 1, lighthouse: true})">Lighthouse one page</el-button>
        <!-- <el-button :disabled="!isScanEnabled" type="primary" @click="sendTask({preset: 'minimal', maxRequests: 0, lighthouse: false})">Warm</el-button> -->
      </el-col>

      <el-col :span="4" :xs="24" style="text-align:left">
      </el-col>
    </el-row>

    <el-row style="clear:both">
      <el-form class="scan__form-settings">
        <el-collapse v-model="openedPanels" class="panels">
          <Panel name="settings" icon="el-icon-setting" title="Settings" :subtitle="!openedPanels.includes('settings') ? argsWithoutDefault : ''" >

            <div class="scan__other-args" v-if="openedPanels.includes('settings')" v-html="argsWithoutDefault"></div>

            <el-form-item label="Fields preset">
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
              <el-input-number v-model="form.depth" :min="1" :max="100" @keydown.enter.native="sendTask"></el-input-number>
            </el-form-item>

            <el-form-item label="Max requests">
              <el-input-number v-model="form.maxRequests" :min="0" @keydown.enter.native.prevent="sendTask"></el-input-number>
            </el-form-item>

            <el-form-item label="Ignore robots.txt">
              <el-switch v-model="form.ignoreRobotsTxt" title="Scan all found pages"></el-switch>
            </el-form-item>

            <el-form-item label="Follow sitemap.xml">
              <el-switch v-model="form.followXmlSitemap"></el-switch>
            </el-form-item>

            <el-form-item label="URL contains URL list" title="Parse URL as URL list">
              <el-switch v-model="form.urlList"></el-switch>
            </el-form-item>

            <el-divider></el-divider>

            <el-form-item label="Report name">
              <el-input class="scan__out-name" v-model="form.outName" title="Default: domain name"></el-input>
            </el-form-item>

            <el-form-item label="Report fields">
              <el-input class="scan__report-fields" v-model="form.reportFields" title="Example: url,h1,readability_length"></el-input>
            </el-form-item>

            <el-form-item label="Report query">
              <el-input class="scan__report-fields" v-model="form.reportQ" title="Example: request_time>1000"></el-input>
            </el-form-item>

            <el-divider></el-divider>

            <el-form-item label="Arguments">
              <el-input class="scan__args" v-model="args" @keydown.enter.native="sendTask"></el-input>
            </el-form-item>

            <el-form-item label="Server URL">
              <el-input v-model="serverUrl"></el-input>
            </el-form-item>

          </Panel>
        </el-collapse>
      </el-form>

      <div class="scan__buttons-secondary" v-if="openedPanels.includes('settings')">
        <el-button :disabled="!isScanEnabled" type="primary" @click="sendTask">Scan</el-button>
        <el-button :disabled="!isScanEnabled" type="primary" class="scan__lighthouse-button" @click="sendTask({maxRequests: 1, lighthouse: true})">Lighthouse one page</el-button>

        <div class="scan__preset-save-form">
          <el-input placeholder="Preset name" class="scan__report-fields" v-model="form.presetName" title="For save preset"></el-input>
          <el-button type="secondary" :disabled="form.presetName === ''" @click="saveAsPreset">Save preset</el-button>
        </div>
      </div>

      <div class="scan__current">
        <!-- {{ currentScanPage }} / {{ currentScanQueue }} -->
        <el-progress :percentage="currentScanPercent" :format="showCurrentScan"></el-progress>
        <i v-if="currentScanPage" class="el-icon-loading"></i>
        <el-button v-if="currentScanPercent && !canceling" type="primary" @click="cancelTask">Cancel</el-button>
        <span v-if="canceling">Canceling...</span>
      </div>

    </el-row>

    <NuxtLink :to="reportUrl" v-if="itemsJsonUrl"
      :class="{'scan__report-link': true, 'el-button': true, 'is-round': true, 'el-button--success': isReportSuccess}"
    >
      Report: {{ $store.getters.shortReportUrl(itemsJsonUrl) }}
    </NuxtLink>
    <div class="scan__report-updated" v-if="lastUpdatedHuman && !currentScanPage">{{ lastUpdatedHuman }} ago</div>


    <el-card class="scan__presets-container scan__list box-card" v-if="scanPresets.length > 0">
      <h3>Scan presets:</h3>
      <draggable v-model="scanPresets" tag="ul" class="scan__presets">
        <li v-for="preset in scanPresets" :key="preset.name">
          <NuxtLink :to="presetUrl(preset)" :title="preset.args" v-html="preset.name"></NuxtLink>
          <button class="scan__presets-remove" @click="removePreset(preset.name)">✖</button>
        </li>
      </draggable>
    </el-card>

    <ScanHistory :items="scanHistory"></ScanHistory>

    <el-link @click="showLog = !showLog">{{ showLog ? 'hide advanced' : 'show advanced' }}</el-link>

    <div class="scan__advanced" v-if="showLog">
      <div class="scan__log-container" v-if="log.length > 0">
        <ul class="scan__log" v-chat-scroll="{always: false, smooth: false}">
          <li v-for="(line, index) in log" :key="index" v-html="line"></li>
        </ul>
      </div>

      <el-row class="scan__server-state" v-if="running !== ''">
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
            <li v-if="serverVersion">version: {{ serverVersion }}</li>
            <li>reboots: {{ reboots }}</li>
          </ul>
        </el-col>
      </el-row>

      <el-row class="scan__connection-state">
        <h3>Connection state:</h3>
        <el-col :span="12">
          <ul class="server-state">
            <li>connection id: {{ $store.state.connectionId }}</li>
            <li>last connection id: {{ $store.state.lastConnectionId }}</li>
          </ul>
        </el-col>
        <el-col :span="12">
          <ul class="server-state">
          </ul>
        </el-col>
      </el-row>
    </div>
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

      .el-switch__label.is-active {
        color: inherit;
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

  .scan__preset-save-form {
    padding-top: 1em;
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

  .scan__out-name,
  .scan__report-fields {
    width: 180px;
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
    max-width: 615px;
    margin: 0 auto;

    .el-collapse-item__header,
    .el-collapse-item__wrap {
      border: none;

      .panel__subtitle {
        display: inline-block;
        max-height: 32px;
        overflow: hidden;
      }
    }

    .scan__other-args {
      color: #999;
    }

    .el-collapse-item__content {
      padding-bottom: 0;
    }
  }

  .scan__list {
    text-align: left;
    max-width: 600px;
    margin-bottom: 15px;
  }

  .scan__presets-container {
    margin-top: 100px;
  }

  .scan__presets {
    text-align: left;
    padding: 0;

    li {
      list-style: none;
      line-height: 2em;

      &:hover {
        box-shadow: 0 0 2px #ccc;
      }
    }

    .scan__presets-remove {
      background: none;
      border: none;
      padding: 0 5px;
      float: right;
      color: #ccc;
      line-height: 2em;

      &:hover {
        color: #666;
      }
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
    margin-top: 30px;
  }

  .scan__advanced {
    padding: 8px 0;
    text-align: left;
  }
</style>

<script>
import Panel from "~/components/Panel";
import ScanHistory from "~/components/ScanHistory";
import firebase from "firebase";
import _ from "lodash";
import draggable from 'vuedraggable';

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
  lighthouse: {
    arg: '--lighthouse',
    type: 'boolean',
  },
  urlList: {
    arg: '--url-list',
    type: 'boolean',
  },
  outName: {
    arg: '--out-name',
    // type: 'string',
  },
  reportFields: {
    arg: '--report-fields',
    // type: 'string',
  },
  reportQ: {
    arg: '--report-q',
    // type: 'string',
  },
};

export default {
  components: { draggable, Panel, ScanHistory },
  data() {
    return {
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
      serverVersion: '',
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
      canceling: false,
      showLog: false,
      autoscan: false,
    };
  },

  computed: {
    log(){
      return this.$store.state.log;
    },

    scanPresets: {
      get() {
        return this.$store.state.scanPresets;
      },
      set(presets) {
        this.$store.commit('scanPresets', presets);
      }
    },

    isScanEnabled() {
      return this.connected && !this.currentScanPage;
    },

    scanDefaultForm(){
      return this.$store.state.scanDefaultForm;
    },

    scanHistory(){
      return this.$store.state.scanHistory;
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
        + ` - ${this.$store.state.name}`;
    },

    isInlineForm() {
      return window.innerWidth > 768;
    },

    isReportSuccess() {
      return this.lastUpdated && !this.currentScanPage;
    },

    reportUrl() {
      return '/?' +
        (this.form.reportQ ? `q=${this.form.reportQ}&` : '') +
        (this.form.reportFields ? `fields=${this.form.reportFields}&` : '') +
        `url=${this.itemsJsonUrl}`;
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
      // console.log('val: ', val);
      if (!val) this.urlsShow = true;
    },

    currentScanPercent(val) {
      if (val == 0) this.canceling = false;
    }
  },

  methods: {
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
        if (this.urlList.length > 0 && this.urlList.length < 100) query.urls = this.urlList.join(',');
        if (query.urls?.length > 2048) delete(query.urls);
      } else {
        if (this.url) query.url = this.url;
      }

      if (this.argsWithoutDefault) query.args = this.argsWithoutDefault;

      // console.log('route scan: updateUrlQuery:', query);
      if (push) this.$router.push({ query });
      else this.$router.replace({ query });
    },

    // GET params to form state
    updateFormFromQuery() {
      // console.log('updateFormFromQuery: ', this.$route.query);
      if (this.routerProcess) return;
      if (this.$route.query["fields"]) return; // ignore params from viewer

      // reset form to default
      for (let formName in this.scanDefaultForm) {
        this.form[formName] = this.scanDefaultForm[formName];
      }

      // add params from query
      for (let paramName of ['url', 'urls', 'urls_list', 'args', 'serverUrl', 'preset', 'run']) {
        let val = this.$route.query[paramName];
        if (val) {
          if (paramName === 'url' && val.includes('/reports/')) continue;
          if (paramName === 'urls') {
            val = val.split(',').join('\n');
            this.isUrls = true;
            this.urlsShow = false;
          }


          // urls_list url to urls input
          if (paramName === 'urls_list') {
            fetch(val).then((response) => {
              return response.json();
            }).then(data => {
              const urls = [];
              for (const item of data) {
                if (item.url) urls.push(item.url);
              }
              this.urls = urls.join('\n');
            })
            this.isUrls = true;
          }

          if (paramName === 'args') {
            const unknownArgs = this.parseKnownArgs(val);
            // console.log('unknownArgs: ', unknownArgs);
            val = unknownArgs.join(' ');
          }
          if (paramName === 'preset') {
            this.form.presetName = val;
            continue;
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
        const defaultVal = this.scanDefaultForm[formItemName];

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

    buildArgs(withDefault = true, overrides = {}) {
      let args = this.args;

      // don't add urls to args, it might be too long
      // withDefault - full args
      if (withDefault && this.isUrls && this.urlList.length > 0) {
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
          if (val === '' || val === undefined) continue;
          args += ` ${conf.arg} ${val}`;
        }
      }

      return args;
    },

    saveAsPreset() {
      let presets = [...this.scanPresets];
      const preset = {
        name: this.form.presetName,
        url: this.url,
        args: this.buildArgs(true)
      }

      // remove if exists
      presets = presets.filter(p => p.name !== preset.name);

      presets.push(preset);
      this.$store.commit('scanPresets', presets);
    },

    saveHistory() {
      let items = [...this.scanHistory];
      const item = {
        name: this.form.presetName,
        url: this.url,
        args: this.buildArgs(true),
        date: Date.now(),
      }

      items.push(item);
      this.$store.commit('scanHistory', items);
    },

    removePreset(name) {
      // console.log('remove preset: ', name);
      let presets = [...this.scanPresets]
      presets = presets.filter(preset => preset.name !== name);
      this.$store.commit('scanPresets', presets);
    },

    presetUrl(preset) {
      // console.log('preset: ', preset);
      return `/scan?url=${preset.url}&args=${preset.args}&preset=${preset.name}`;
    },

    closeSettings() {
      const pindex = this.openedPanels.indexOf('settings');
      if (pindex !== -1) this.openedPanels.splice(pindex, 1);
    },

    // send task to server
    async sendTask(overrides = {}) {
      this.$store.commit('log', []); // clear log
      this.urlsShow = false;
      this.closeSettings();

      const opts = {
        url: this.url,
        args: this.buildArgs(true, overrides)
      };

      // hack: remove virtual arg, it used only for report link generate
      opts.args = opts.args.replace(/--report-fields .*?(\s|$)/, '');
      opts.args = opts.args.replace(/--report-q .*?(\s|$)/, '');


      this.updateUrlQuery(true); // set in url only scanned

      // save url scan history
      if (!this.isUrls) {
        this.$store.commit('addUrlHistory', this.url);
      }

      this.saveHistory();

      console.log("scan:", opts);
      this.socket.emit('scan', opts);

      // const res = await this.$axios.$post(`${this.serverUrl}/scan`, opts);
      // console.log('res: ', res);
    },

    async cancelTask() {
      this.socket.emit('cancel', {});
    },

    auth() {
      if (this.socket.connected && this.$store.state.user?.uid && this.isNeedAuth) {
        this.isNeedAuth = false;
        const opts = {
          ...this.$store.state.user,
          ...{ connectionId: this.$store.state.connectionId || this.$store.state.lastConnectionId } // send last connectionId
        };
        // console.log('opts: ', opts);
        this.socket.emit('auth', opts);
        this.$store.commit('connectionId', this.socket.id);
        this.$store.commit('lastConnectionId', this.socket.id);
      }
    },

    submitEvents(key) {
      // console.log('this.socket: ', this.socket);
      // console.log('submitEvents: ', key);

      // log to "terminal"
      this.socket.on("status" + key, (msg, cb) => {
        // current scan status extract
        const res = msg.match(/^(\d+).*\((\d+)\)$/);
        if (res) {
          // console.log('res: ', res);
          this.currentScanPage = parseInt(res[1]);
          this.currentScanQueue = this.currentScanPage + parseInt(res[2]);
          if (this.form.maxRequests && this.form.maxRequests < this.currentScanQueue) {
            this.currentScanQueue = this.form.maxRequests;
          }

          // when page > queue
          if (this.currentScanPage > this.currentScanQueue) this.currentScanQueue = this.currentScanPage;

          this.currentScanPercent = Math.round(this.currentScanPage / this.currentScanQueue * 100);
          if (this.currentScanQueue < 10) this.currentScanPercent = 0; // in begin
          this.currentScanPercent = Math.min(100, this.currentScanPercent); // when overscan
          // if (this.currentScanPercent === 100) this.currentScanPercent = 0; // 100% -> 0%
          if (!this.currentScanPage && this.lastUpdated) this.currentScanPercent = 100; // when finished
        }

        if (msg.includes('cancel command')) {
          this.canceling = true;
        }

        if (msg.includes('Finish audit')) {
          this.currentScanPage = '';
          this.currentScanPercent = 0;

          // open report after scan
          if (this.autoscan) {
            this.autoscan = false;
            this.$router.push({ path: this.reportUrl });
          }
        }

        if (msg.includes('Pending...')) {
          this.currentScanPage = 'Pending...';
        }

        this.logPush(msg);
      });
      this.socket.on("status", (msg, cb) => {
        console.log('status: ', msg);
        // console.log('this.socket: ', this.socket);
        // console.log('this.socket.id: ', this.socket.id);
        this.logPush(msg);
      });

      // server queue info
      this.socket.on("serverState" + key, (serverState, cb) => {
        // update last report date
        this.lastUpdatedHuman = this.getLastUpdatedHuman();
        if (serverState.sockets) console.log('sockets: ', serverState.sockets);

        // console.log('msg: ', msg);
        // map to data
        for (let name in serverState) {
          if (this[name] !== undefined) this[name] = serverState[name];
          // this.serverState[name] = serverState[name];
        }
      });

      // scan result
      this.socket.on("result" + key, (data, cb) => {
        this.currentScanPercent = 0;
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
    // https://github.com/richardeschloss/nuxt-socket-io/blob/80bd7195b12eaa1dd51dea0e968e8e06635f848f/io/types.d.ts#L129
    this.socket = this.$nuxtSocket({
      channel: "/",
      // persist: 'socket' + Math.random(0, 10000), // https://nuxt-socket-io.netlify.app/vuexmodule/?
      teardown: false,
      emitTimeout: 40000,
      timeout: 60000,
    });

    // console.log('this.socket: ', this.socket);

    this.form = {...this.scanDefaultForm};
    /* Listen for events: */

    this.socket.on("connect", () => {
      this.connected = true;
      this.currentScanPage = '';
      this.currentScanPercent = 0;
      this.currentScanQueue = 0;
      this.auth();

      if (this.autoscan) {
        setTimeout(this.sendTask, 500);
      }
    });

    this.socket.on("error", () => {
      console.log('socket error');
    });

    this.socket.on("disconnect", reason => {
      this.logPush('server disconnected: ' + reason);
      // console.log('disconnect socket: ', {...this.socket});
      this.$store.commit('connectionId', '');
      this.isNeedAuth = true;
      this.connected = false;
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

    if (this.$route.query.run == '1') {
      this.autoscan = true;
    }

    if (this.$route.query.connection_id) {
      this.$store.commit('connectionId', this.$route.query.connection_id);
      this.$store.commit('lastConnectionId', this.$route.query.connection_id);
      this.showLog = true;
    }
  },

  // middleware: 'auth',

  head() {
    return {
      title: this.pageTitle
    }
  }

};
</script>
