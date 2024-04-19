<template>
  <section class="scan__container">
    <el-row class="scan__form">
      <el-col :span="4" :xs="24" class="form__urls-switch-col">
        <el-switch class="urls-mode-switch"
                   v-model="dd.isUrls"
                   active-text="urls"
                   inactive-text="site"
        >
        </el-switch>
      </el-col>

      <el-col :span="16" :xs="24">
        <div class="scan__urls" v-if="dd.isUrls">
          <el-link
            type="primary" v-if="!dd.urlsShow"
            @click.native.prevent="dd.urlsShow = !dd.urlsShow"
            v-html="`show urls (${urlList.length})`"
            :title="urlList.join('\n')"
          ></el-link>

          <el-input v-if="dd.urlsShow" v-model="urlsStore" type="textarea" :rows="10" wrap="soft" autofocus
                    :autosize="{ minRows: 1, maxRows: 10}"
                    placeholder="One line - one URL"
          ></el-input>

          <el-link
            type="primary" v-if="dd.urlsShow"
            @click.native.prevent="dd.urlsShow = !dd.urlsShow"
            v-html="`hide urls (${urlList.length})`"
          ></el-link>
        </div>
        <el-autocomplete v-if="!dd.isUrls" v-model="urlStore" @keydown.enter.native.prevent="sendTask" autofocus
                         class="form__url"
                         :fetch-suggestions="historySearch"
        ></el-autocomplete>

        <el-tooltip class="item" effect="dark" :disabled="!scanButtonTitle" :content="scanButtonTitle" placement="top">
          <el-button :disabled="!isScanEnabled" :type="isScanEnabled ? 'primary' : 'default'" @click="sendTask">Scan
          </el-button>
        </el-tooltip>
        <el-button :disabled="!isScanEnabled" class="scan__lighthouse-button"
                   @click="sendTask({maxRequests: 1, lighthouse: true})">Lighthouse one page
        </el-button>
        <el-button v-if="dd.featureScreenshot" :disabled="!isScanEnabled" class="scan__screenshot-button"
                   @click="sendTask({maxRequests: 1, screenshot: true})">Screenshot one page
        </el-button>
        <!-- <el-button :disabled="!isScanEnabled" type="primary" @click="sendTask({preset: 'minimal', maxRequests: 0, lighthouse: false})">Warm</el-button> -->
      </el-col>

      <el-col :span="4" :xs="24" style="text-align:left">
      </el-col>
    </el-row>

    <el-row style="clear:both">
      <el-col :span="24">
        <el-form class="scan__form-settings"
                 label-width="auto"
                 label-position="left"
        >

          <el-collapse v-model="dd.openedPanels" class="panels">
            <Panel name="settings" :icon="ElIconSetting" title="Settings"
                   :subtitle="!dd.openedPanels.includes('settings') ? settingsHint : ''">

              <el-form-item>
                <div class="scan__other-args" v-if="dd.openedPanels.includes('settings')"
                     v-html="argsWithoutDefault"></div>
              </el-form-item>

              <el-form-item label="Max requests">
                <el-input-number v-model="dd.form.maxRequests" :min="0" :max="dd.serverMaxRequests > 0 ? dd.serverMaxRequests : undefined"
                                 @keydown.enter.native.prevent="sendTask"></el-input-number>
                <el-button text @click="dd.form.maxRequests = dd.serverMaxRequests" v-if="dd.form.maxRequests !== dd.serverMaxRequests && dd.serverMaxRequests !== -1 && dd.form.maxRequests > 0">
                  max ({{ dd.serverMaxRequests ? dd.serverMaxRequests : "no limit" }})
                </el-button>

              </el-form-item>

              <el-form-item label="Fields preset">
                <el-select v-model="dd.form.preset">
                  <el-option
                    v-for="preset of ['minimal', 'seo', 'seo-minimal', 'headers', 'parse', 'lighthouse', 'lighthouse-all']"
                    :key="preset"
                    :value="preset"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="Max depth">
                <el-input-number v-model="dd.form.depth" :min="1" :max="100"
                                 @keydown.enter.native="sendTask"></el-input-number>
              </el-form-item>

              <el-form-item label="Scan Lighthouse">
                <el-switch v-model="dd.form.lighthouse"></el-switch>
              </el-form-item>

              <el-form-item v-if="dd.featureScreenshot" label="Screenshot">
                <el-switch v-model="dd.form.screenshot"></el-switch>
              </el-form-item>

              <el-form-item label="Ignore robots.txt">
                <el-switch v-model="dd.form.ignoreRobotsTxt" title="Scan all found pages"></el-switch>
              </el-form-item>

              <el-form-item label="Follow sitemap.xml">
                <el-switch v-model="dd.form.followXmlSitemap"></el-switch>
              </el-form-item>

              <el-form-item label="URL contains URL list" title="Parse URL as URL list">
                <el-switch v-model="dd.form.urlList"></el-switch>
              </el-form-item>

              <el-divider></el-divider>

              <el-form-item label="Report name">
                <el-input class="scan__out-name" v-model="dd.form.outName" title="Default: domain name"></el-input>
              </el-form-item>

              <el-form-item label="Report fields">
                <el-input class="scan__report-fields" v-model="dd.form.reportFields"
                          title="Example: url,h1,readability_length"></el-input>
              </el-form-item>

              <el-form-item label="Report query">
                <el-input class="scan__report-fields" v-model="dd.form.reportQ"
                          title="Example: request_time>1000"></el-input>
              </el-form-item>

              <el-divider></el-divider>

              <el-form-item label="Arguments">
                <!--              <el-button type="default" @click="args = ">noindex</el-button>-->
                <el-input class="scan__args" v-model="argsStore" @keydown.enter.native="sendTask"></el-input>
              </el-form-item>

              <el-form-item label="Server URL">
                <el-input v-model="serverUrlStore"></el-input>
              </el-form-item>

              <el-form-item
                label="Partial report to continue (data/reports/...)"
                v-if="urlList.length > 0 || dd.form.urlList"
              >
                <el-input v-model="dd.partialReport"></el-input>
              </el-form-item>

            </Panel>
          </el-collapse>
        </el-form>

        <div class="scan__buttons-secondary" v-if="dd.openedPanels.includes('settings')">
          <el-tooltip class="item" effect="dark" content=":scanButtonTitle" placement="top">
            <el-button :title="scanButtonTitle" :disabled="!isScanEnabled" type="primary" @click="sendTask">Scan
            </el-button>
          </el-tooltip>
          <el-button type="primary"
                     v-if="urlList.length > 0 || dd.form.urlList"
                     :disabled="!isScanEnabled || (dd.partialReport === '' && !store.itemsJsonUrl)"
                     @click="sendTask({partialReport: dd.partialReport})">Continue scan
          </el-button>
          <el-button :disabled="!isScanEnabled" type="primary" class="scan__lighthouse-button"
                     @click="sendTask({maxRequests: 1, lighthouse: true})">Lighthouse one page
          </el-button>

          <div class="scan__preset-save-form">
            <el-input placeholder="Preset name" class="scan__report-fields" v-model="dd.form.presetName"
                      title="For save preset"></el-input>
            <el-button :disabled="dd.form.presetName === ''" @click="saveAsPreset">Save preset</el-button>
          </div>
        </div>
      </el-col>

      <el-col :span="4"></el-col>
      <el-col :span="16">
        <div class="scan__current">
          <!-- {{ currentScanPage }} / {{ currentScanQueue }} -->
          <el-progress :percentage="dd.currentScanPercent" :format="showCurrentScan"></el-progress>
          <div class="scan__current-controls">
            <span v-if="dd.currentScanPage" class="scan__loader-wrap"><el-icon class="is-loading"><el-icon-loading /></el-icon></span>
            <el-button v-if="(dd.currentScanPercent || dd.currentScanQueue) && !dd.canceling" type="primary"
                       style="margin: 5px 0" @click="cancelTask">Cancel
            </el-button>
            <span class="scan__canceling-label" v-if="dd.canceling">Canceling...</span>
          </div>
        </div>
      </el-col>
      <el-col :span="4"></el-col>
    </el-row>

    <NuxtLink :to="reportUrl" v-if="store.itemsJsonUrl"
              :class="{'scan__report-link': true, 'el-button': true, 'is-round': true, 'el-button--success': isReportSuccess}"
    >
      Report: {{ store.shortReportUrl(store.itemsJsonUrl) }}
      {{ store.itemsJsonCount ? ` (${store.itemsJsonCount})` : "" }}
    </NuxtLink>
    <div class="scan__report-updated" v-if="dd.lastUpdatedHuman">{{ dd.lastUpdatedHuman }} ago</div>


    <el-card class="scan__presets-container scan__list box-card" v-if="store.scanPresets.length > 0">
      <h3>Scan presets:</h3>
      <draggable v-model="scanPresetsStore" tag="ul" class="scan__presets">
        <li v-for="preset in scanPresetsStore" :key="preset.name">
          <NuxtLink :to="presetUrl(preset)" :title="preset.args" v-html="preset.name"></NuxtLink>
          <button class="scan__presets-remove" @click="removePreset(preset.name)">✖</button>
        </li>
      </draggable>
    </el-card>

    <ScanHistory :items="store.scanHistory"></ScanHistory>

    <el-row class="scan__server-state" justify="center">
      <el-col :span="24" v-if="dd.running !== ''">
        <span>Server state:</span>&nbsp;
        <span
          :class="{warning: dd.serverLoadPercent > 50 && dd.serverLoadPercent <= 70, danger: dd.serverLoadPercent > 70}">load: {{
            dd.serverLoadPercent
          }}%</span>,&nbsp;
        <span>running: {{ dd.running }}</span>,&nbsp;
        <span>pending: {{ dd.pending }}</span>,&nbsp;
        <span>connections: {{ dd.connections }}</span>
      </el-col>
    </el-row>

    <el-link @click="toggleShowLog">{{ store.showLog ? "hide advanced" : "show advanced" }}</el-link>

    <div class="scan__advanced" id="advanced" v-if="store.showLog">
      <LogTerminal />

      <el-row class="scan__connection-state">
        <el-col :span="24" align="center">
          <h3>Connection state:</h3>
        </el-col>
        <el-col :span="4"></el-col>
        <el-col :span="8">
          <ul class="server-state">
            <li><span style="width: 140px; display: inline-block">connection id:</span> {{ store.connectionId }}</li>
            <li><span style="width: 140px; display: inline-block">last connection id:</span>
              {{ store.lastConnectionId }}
            </li>
          </ul>
        </el-col>
        <el-col :span="8">
          <ul class="server-state">
            <li><span style="width: 85px; display: inline-block">total scans:</span> {{ dd.scansTotal }} (all time:
              {{ dd.scansTotalAll }})
            </li>
            <li><span style="width: 85px; display: inline-block">total pages:</span> {{ dd.pagesTotal }} (all time:
              {{ dd.pagesTotalAll }})
            </li>
            <li><span style="width: 85px; display: inline-block">uptime:</span> {{ uptimeHuman }}</li>
            <li v-if="dd.serverVersion"><span style="width: 85px; display: inline-block">version:</span>
              {{ dd.serverVersion }}
            </li>
            <li><span style="width: 85px; display: inline-block">reboots:</span> {{ dd.reboots }}</li>
          </ul>
        </el-col>
        <el-col :span="4"></el-col>
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
    //margin-top: -25px;
  }
}

.scan__current-controls {
  height: 40px;
}

.scan__loader-wrap {
  margin: 0 10px 0 -26px;
  display: inline-block;
  padding-top: 7px;
  vertical-align: middle;
  height: 30px;
}

.scan__canceling-label {
  display: inline-block;
  vertical-align: bottom;
  line-height: 29px;
}

.urls-mode-switch {
  margin-top: -15px;
}

.scan__form {
  // padding: 0 8px;
  // margin-top: 30px;
  margin: 0 auto;
  max-width: 1200px;

  input {
    // padding: 0 10px;
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
    margin-right: 2px;
    @media (max-width: 640px) {
      padding-bottom: 10px;
    }
  }

  .scan__urls {
    padding-bottom: 10px;
  }

  .scan__lighthouse-button {
    margin-left: 2px;
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
  max-width: 550px;

  .el-progress {
    flex-direction: column;
    min-height: 21px;

    .el-progress-bar {
      width: 100%;
      margin: 0;
    }
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
  text-decoration: none;
}

.scan__report-updated {
  //margin-left: 15px;
  color: #999;
  white-space: nowrap;
}

.scan__form-settings {
  text-align: right;
  max-width: 590px;
  margin: 0 auto;

  > .panels {
    margin-top: 0;
  }

  .el-collapse-item__header,
  .el-collapse-item__wrap {
    border: none;
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
  max-width: 800px;
  margin: 15px auto 15px auto;

  h3 {
    margin-top: 0;
  }

  .el-card__body {
    padding-bottom: 5px;
  }
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

    /*&:hover {
      box-shadow: 0 0 2px #ccc;
    }*/
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

    &:hover {
      color: #fff;
    }
  }

  pre {
    color: inherit;
    //background: inherit;
    background: none;
    margin: 0;
    padding: 0;
    border: none;
  }
}

.scan__server-state {
  margin-top: 15px;
  min-height: 1.5em;

  .danger {
    color: #ff0000;
  }

  .warning {
    color: #a49439;
  }
}

.scan__advanced {
  padding: 8px 0;
  text-align: left;
}
</style>

<script setup>
// TODO: --urls can be added to arguments, avoid it
import { getAuth } from "firebase/auth";
import _ from "lodash";
import draggable from "vuedraggable";
// import url from 'url';

const router = useRouter();
const route = useRoute();
const ctx = useNuxtApp();

const store = useStore();

const controlsMap = {
  preset: {
    arg: "--preset",
  },
  depth: {
    arg: "--max-depth",
    type: "number",
  },
  maxRequests: {
    arg: "--max-requests",
    type: "number",
  },
  ignoreRobotsTxt: {
    arg: "--ignore-robots-txt",
    type: "boolean",
  },
  followXmlSitemap: {
    arg: "--follow-xml-sitemap",
    type: "boolean",
  },
  lighthouse: {
    arg: "--lighthouse",
    type: "boolean",
  },
  screenshot: {
    arg: "--screenshot",
    type: "boolean",
  },
  urlList: {
    arg: "--url-list",
    type: "boolean",
  },
  outName: {
    arg: "--out-name",
    // type: 'string',
  },
  reportFields: {
    arg: "--report-fields",
    // type: 'string',
  },
  reportQ: {
    arg: "--report-q",
    // type: 'string',
  },
  partialReport: {
    arg: "--partial-report",
    // type: 'string',
  },
};


const urlList = computed(() => {
  // TODO2: when rescan filtered twice, second scan will contain first url list
  return store.urls.split(/[,\s]/).map(url => url.trim()).filter(url => url);
});

const urlsStore = computed({
  get: () => store.urls,
  set: (val) => store.$patch({ urls: val }),
});
const urlStore = computed({
  get: () => store.url,
  set: (val) => store.$patch({ url: val }),
});
const argsStore = computed({
  get: () => store.args,
  set: (val) => store.$patch({ args: val }),
});
const serverUrlStore = computed({
  get: () => store.serverUrl,
  set: (val) => store.$patch({ serverUrl: val }),
});
const scanPresetsStore = computed({
  get: () => store.scanPresets,
  set: (val) => store.$patch({ scanPresets: val }),
});

const dd = reactive({
  routerProcess: false,
  running: "",
  available: "",
  pending: "",
  connections: "",
  serverLoadPercent: 0,
  scansTotal: "",
  pagesTotal: "",
  scansTotalAll: "",
  pagesTotalAll: "",
  uptime: "",
  serverVersion: "",
  serverMaxConcurrency: 0,
  serverMaxRequests: -1,
  reboots: "",
  isNeedAuth: true,
  openedPanels: [],
  isUrls: false,
  urlsShow: urlList.value.length === 0,
  connected: false,
  lastUpdated: "",
  lastUpdatedHuman: "",
  form: {},
  currentScanPage: "",
  currentScanQueue: "",
  currentScanPercent: 0,
  canceling: false,
  showLog: false,
  autoscan: false,
  partialReport: "",

  featureScreenshot: false,
  onlyDomains: "",
});

const argsWithoutDefault = computed(() => {
  return buildArgs({ withDefault: false });
});

const scanButtonTitle = computed(() => {
  if (!dd.connected) return "Scan server is not available";
  if (dd.currentScanPage) return "Scan in progress";
  if (!isScanAllowed.value) return `Only ${dd.onlyDomains.join(", ")} users are allowed`;
});
const pageTitle = computed(() => {
  // get hostname from url store.url

  // const domain = url.parse((store.url)).hostname;
  return `Audit ${store.url}`
    + (argsWithoutDefault.value ? ` - args: ${argsWithoutDefault.value}` : "")
    + ` - ${store.name}`;
});
useHead({ title: pageTitle.value });

const isScanAvailable = computed(() => dd.connected && !dd.currentScanPage);
const isScanAllowed = computed(() => {
  let isScanAllowed = false;
  if (dd.onlyDomains) {
    const user = store.user;
    if (!user || !user?.email) return false;
    const userDomain = user?.email.split("@")[1];
    dd.onlyDomains.forEach(domain => {
      if (userDomain === domain) isScanAllowed = true;
    });
  } else {
    isScanAllowed = true;
  }
  return isScanAllowed;
});
const isScanEnabled = computed(() => {
  return isScanAvailable.value && isScanAllowed.value;
});

const settingsHint = computed(() => {
  const items = [];
  if (dd.form.maxRequests) items.push(`limit: ${dd.form.maxRequests}`);
  if (dd.form.ignoreRobotsTxt) items.push(`ignore robots.txt`);
  if (dd.form.urlList) items.push(`url-list`);
  // items.push(argsWithoutDefault.value);
  // const args = argsWithoutDefault.value;
  return items.join(", ");
});

const isInlineForm = computed(() => {
  return window.innerWidth > 768;
});

const isReportSuccess = computed(() => {
  return dd.lastUpdated && !dd.currentScanPage;
});

const reportUrl = computed(() => {
  return "/?" +
    (dd.form.reportQ ? `q=${dd.form.reportQ}&` : "") +
    (dd.form.reportFields ? `fields=${dd.form.reportFields}&` : "") +
    `url=${store.itemsJsonUrl}`;
});

const uptimeHuman = computed(() => {
  if (!dd.uptime) return "";
  const delta = dd.uptime;
  let mins = Math.floor(delta / 60); // s to min
  let hours = Math.floor(mins / 60);
  const days = Math.floor(mins / 1440);
  mins = mins % 60;
  hours = hours % 24;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
});

watch(() => dd.isUrls, (val) => {
  if (!val) dd.urlsShow = true;
});

watch(() => dd.currentScanPercent, (val) => {
  if (val === 0) dd.canceling = false;
});

// router change event
/*router.afterEach((to) => {
  if (to.name !== "scan") return;
  updateFormFromQuery();
});*/


// watch(store.showLog, (val) => {
//   /*if (val) $nextTick(() => {
//     const offset = $el.querySelector('.scan__log').scrollHeight;
//     // TODO2: scroll to bottom
//     $el.scrollTo(0, offset);
//     window.scrollTo(0, offset)
//     // scroll document to offset
//   });*/
// });

onMounted(async () => {
  // https://github.com/richardeschloss/nuxt-socket-io/blob/80bd7195b12eaa1dd51dea0e968e8e06635f848f/io/types.d.ts#L129
  dd.socket = ctx.$nuxtSocket({
    channel: "/",
    // persist: 'socket' + Math.random(0, 10000), // https://nuxt-socket-io.netlify.app/vuexmodule/?
    teardown: false,
    emitTimeout: 40000,
    timeout: 60000,
  });

  dd.form = { ...store.scanDefaultForm };
  /* Listen for events: */

  dd.socket.on("connect", () => {
    dd.connected = true;
    resetScan();
    auth();

    if (dd.autoscan) {
      setTimeout(sendTask, 500);
    }
  });

  dd.socket.on("error", () => {
    console.error("socket error");
  });

  dd.socket.on("disconnect", reason => {
    logPush("server disconnected: " + reason);
    store.$patch({ connectionId: "" });
    dd.isNeedAuth = true;
    dd.connected = false;
    dd.running = "";
  });

  dd.socket.on("reconnect_attempt", () => {
    logPush("try to connect " + store.serverUrl + "...");
  });

  const firebaseAuth = getAuth(store.firebaseApp);
  firebaseAuth.onAuthStateChanged(() => {
    // if (!user) user = { uid: 'anon' + Math.random() * 100000}
    auth();
    submitEvents(store.user?.uid || "");
  });

  updateFormFromQuery(); // update form after localStorage

  if (route.query.run === "1") {
    dd.autoscan = true;
  }

  if (route.query.connection_id) {
    store.$patch({ connectionId: route.query.connection_id });
    store.$patch({ lastConnectionId: route.query.connection_id });
    store.$patch({ showLog: true });
  }
});
onUnmounted(() => dd.socket.close());

function toggleShowLog() {
  store.$patch({ showLog: !store.showLog });
}

function logPush(msg) {
  const log = [...store.log, ...[msg]];
  if (log.length > 10000) log.shift();
  store.$patch({ log: log });
}

function resetScan() {
  dd.currentScanPage = "";
  dd.currentScanPercent = 0;
  dd.currentScanQueue = 0;
  dd.canceling = false;
}

function showCurrentScan() {
  if (!dd.currentScanPage && !dd.currentScanQueue) return "";
  if (dd.currentScanPage === "Pending...") return dd.currentScanPage;
  return `${dd.currentScanPage || dd.currentScanQueue} / ${dd.currentScanQueue || "?"}`;
}

// form state to GET params
function updateUrlQuery(push = false) {
  if (dd.routerProcess) return;
  dd.routerProcess = true;
  setTimeout(() => {
    dd.routerProcess = false;
  }, 100);

  let query = {};

  if (dd.isUrls) {
    if (urlList.value.length > 0 && urlList.value.length < 100) query.urls = urlList.value.join(",");
    if (query.urls?.length > 2048) delete (query.urls);
  } else {
    if (store.url) query.url = store.url;
  }

  if (argsWithoutDefault.value) query.args = argsWithoutDefault.value;

  if (push) router.push({ query });
  else router.replace({ query });
}

// GET params to form state
function updateFormFromQuery() {
  if (dd.routerProcess) return;
  if (route.query["fields"]) return; // ignore params from viewer

  // reset form to default
  for (let formName in store.scanDefaultForm) {
    dd.form[formName] = store.scanDefaultForm[formName];
  }

  if (route.query["is_urls"]) {
    dd.isUrls = true;
  }

  // add params from query
  const storeProps = ["url", "urls", "urls_list", "args", "serverUrl"];
  for (let paramName of [...storeProps, "preset", "run"]) {
    let val = route.query[paramName];
    if (val) {
      if (paramName === "url" && val.includes("/reports/")) continue;
      if (paramName === "urls") {
        val = val.split(",").join("\n");
        dd.isUrls = true;
        dd.urlsShow = false;
      }


      // urls_list url to urls input
      if (paramName === "urls_list") {
        fetch(val).then((response) => {
          return response.json();
        }).then(data => {
          const urls = [];
          for (const item of data) {
            if (item.url) urls.push(item.url);
          }
          store.$patch({ urls: urls.join("\n") });
        });
        dd.isUrls = true;
      }

      if (paramName === "args") {
        const unknownArgs = parseKnownArgs(val);
        val = unknownArgs.join(" ");
      }
      if (paramName === "preset") {
        dd.form.presetName = val;
        continue;
      }

      if (storeProps.includes(paramName)) {
        store.$patch({ [paramName]: val });
      } else {
        dd[paramName] = val;
      }
    }
  }
}

// update dd.form, return unknown args array
function parseKnownArgs(args) {
  args = args.trim();
  const argNameMap = {};
  for (let name in controlsMap) {
    const conf = controlsMap[name];
    argNameMap[conf.arg] = name;
  }

  const unknownArgs = [];
  const parts = args.split(" ");
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
    // const defaultVal = store.scanDefaultForm[formItemName];

    const conf = controlsMap[formItemName];

    // --lighthouse
    if (conf.type === "boolean") dd.form[formItemName] = true;
    else {
      const val = parts[parseInt(i) + 1];
      if (val) {
        dd.form[formItemName] = val;
        if (conf.type === "number") dd.form[formItemName] = parseInt(dd.form[formItemName]);
        lastVal = true;
      }
    }
  }

  return unknownArgs;
}

function buildArgs({ withDefault = true, withUrls = false, overrides = {} } = {}) {
  let args = store.args;

  // don't add urls to args, it might be too long
  if (withUrls && dd.isUrls && urlList.value.length > 0) {
    args += " --urls " + urlList.value.join(",");
  }

  // args from form
  for (let name in controlsMap) {
    const conf = controlsMap[name];
    const val = overrides[name] || dd.form[name];

    // ignore default
    if (!withDefault && val === store.scanDefaultForm[name]) continue;

    if (conf.type === "boolean") {
      if (!val) continue;
      args += " " + conf.arg;
    } else {
      if (val === "" || val === undefined) continue;
      args += ` ${conf.arg} ${val}`;
    }
  }

  return args;
}

function saveAsPreset() {
  let presets = [...store.scanPresets];
  const preset = {
    name: dd.form.presetName,
    url: store.url,
    args: buildArgs(),
  };

  // remove if exists
  presets = presets.filter(p => p.name !== preset.name);

  presets.push(preset);
  store.$patch({ scanPresets: presets });
}

function saveHistory() {
  let items = [...store.scanHistory];
  const item = {
    name: dd.form.presetName,
    url: store.url,
    args: buildArgs(),
    date: Date.now(),
  };

  items.push(item);
  store.$patch({ scanHistory: items });
}

function removePreset(name) {
  let presets = [...store.scanPresets];
  presets = presets.filter(preset => preset.name !== name);
  store.$patch({ scanPresets: presets });
}

function presetUrl(preset) {
  return `/scan?url=${preset.url}&args=${preset.args}&preset=${preset.name}`;
}

function closeSettings() {
  const pindex = dd.openedPanels.indexOf("settings");
  if (pindex !== -1) dd.openedPanels.splice(pindex, 1);
}

// send task to server
async function sendTask(overrides = {}) {
  store.$patch({ log: [] }); // clear log
  dd.urlsShow = false;
  closeSettings();

  if (overrides.partialReport === "") {
    const url = new URL(store.itemsJsonUrl);
    const urlArg = url.searchParams.get("url");
    dd.partialReport = urlArg.replace(window.location.origin, "data");
    overrides.partialReport = dd.partialReport;
  }

  const opts = {
    url: store.url,
    args: buildArgs({ withUrls: true, overrides }),
  };

  // hack: remove virtual arg, it used only for report link generate
  opts.args = opts.args.replace(/--report-fields .*?(\s|$)/, "");
  opts.args = opts.args.replace(/--report-q .*?(\s|$)/, "");


  updateUrlQuery(true); // set in url only scanned

  // save url scan history
  if (!dd.isUrls) {
    store.addUrlHistory(store.url);
  }

  saveHistory();
  dd.currentScanPercent = 0.1;

  console.info("scan:", opts);
  dd.socket.emit("scan", opts);
}

async function cancelTask() {
  dd.socket.emit("cancel", {});
}

function auth() {
  if (dd.socket.connected && store.user?.uid && dd.isNeedAuth) {
    dd.isNeedAuth = false;
    const opts = {
      ...store.user,
      ...{ connectionId: store.connectionId || store.lastConnectionId }, // send last connectionId
    };
    dd.socket.emit("auth", opts);
    // console.log("auth:", opts);
    store.$patch({ connectionId: dd.socket.id });
    store.$patch({ lastConnectionId: dd.socket.id });
  }
}

function submitEvents(key) {
  // log to "terminal"
  dd.socket.on("status" + key, (msg) => {
    // current scan status extract
    const res = msg.match(/^(\d+).*\((\d+)\)$/);
    if (res) {
      const current = parseInt(res[1]);
      const queued = parseInt(res[2]);
      // ignore logs with zero-queue when scan is stopped
      const isIgnore = dd.currentScanPercent === 0 && dd.currentScanQueue === 0 && queued === 0;
      if (isIgnore) return;

      dd.currentScanPage = current;
      dd.currentScanQueue = dd.currentScanPage + queued;
      if (dd.form.maxRequests && dd.form.maxRequests < dd.currentScanQueue) {
        dd.currentScanQueue = dd.form.maxRequests;
      }

      // when page > queue
      if (dd.currentScanPage > dd.currentScanQueue) dd.currentScanQueue = dd.currentScanPage;

      dd.currentScanPercent = Math.round(dd.currentScanPage / dd.currentScanQueue * 100);
      if (dd.currentScanQueue < 10) dd.currentScanPercent = 0; // in begin
      dd.currentScanPercent = Math.min(100, dd.currentScanPercent); // when overscan
      // if (dd.currentScanPercent === 100) dd.currentScanPercent = 0; // 100% -> 0%
      if (!dd.currentScanPage && dd.lastUpdated) dd.currentScanPercent = 100; // when finished
    }

    if (msg.includes("cancel command") && dd.currentScanPercent > 0) {
      dd.canceling = true;
    }

    if (msg.includes("restarting in")) {
      console.info("waiting for restart:");
    }

    if (msg.includes("Finish audit")) {
      resetScan();

      // open report after scan
      if (dd.autoscan) {
        dd.autoscan = false;
        router.push({ path: reportUrl.value });
      }
    }

    if (msg.includes("Pending...")) {
      dd.currentScanPage = "Pending...";
    }

    logPush(msg);
  });
  // avoid double log, why did it written?
  // dd.socket.on("status", (msg, cb) => {
  //   console.log('status: ', msg);
  // console.log('dd.socket: ', dd.socket);
  // console.log('dd.socket.id: ', dd.socket.id);
  // logPush(msg);
  // });

  // server queue info
  dd.socket.on("serverState" + key, (serverState) => {
    // update last report date
    dd.lastUpdatedHuman = getLastUpdatedHuman();
    if (serverState.sockets) console.info("sockets: ", serverState.sockets);

    // map to data
    for (let name in serverState) {
      if ([undefined, "maxConcurrency", "maxRequests"].includes(dd[name])) continue;
      dd[name] = serverState[name];
    }

    dd.serverMaxConcurrency = parseInt(serverState.maxConcurrency) ? parseInt(serverState.maxConcurrency) : 0;
    dd.serverMaxRequests = parseInt(serverState.maxRequests) ? parseInt(serverState.maxRequests) : 0;
  });

  // scan result
  dd.socket.on("result" + key, (data) => {
    console.info("result event:", data);
    dd.currentScanPercent = 0;
    const viewerUrl = window.location.origin + router.options.history.base;
    if (data.json) {
      const url = viewerUrl + "?url=" + data.json;
      if (!data.isProgress) {
        logPush(`result: <a href="${url}">${url}</a>`);
        resetScan();
      }
      store.setItemsJsonUrl({ url: data.json, count: data.count });
      if (data.count) store.$patch({ itemsJsonCount: data.count });
      dd.lastUpdated = Date.now();
    }
    if (data.name) { // TODO2: remove duplicate
      let baseUrl = `${store.serverUrl}/reports`;
      if (store.user?.uid) {
        const userDir = store.user.uid.slice(0, 5);
        baseUrl += "/" + userDir;
      }
      const jsonUrl = `${baseUrl}/${data.name}`;
      const url = `${viewerUrl}?url=${jsonUrl}`;
      if (!data.isProgress) {
        logPush(`result: <a href="${url}">${url}</a>`);
        resetScan();
      }
      store.setItemsJsonUrl({ url: jsonUrl, count: data.count });
      if (data.count) store.$patch({ itemsJsonCount: data.count });
      dd.lastUpdated = Date.now();
    }
  });
}

// url history autocomplete
function historySearch(q, cb) {
  let res = [];
  let all = [];

  for (let url in store.scanUrlHistory) {
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
    return { value };
  });
  cb(res);
}

function getLastUpdatedHuman() {
  if (!dd.lastUpdated) return "";
  const delta = (Date.now() - dd.lastUpdated) / 1000;
  let mins = Math.floor(delta / 60); // s to min
  let hours = Math.floor(mins / 60);
  const days = Math.floor(mins / 1440);
  mins = mins % 60;
  hours = hours % 24;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
}

</script>
