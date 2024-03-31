<template>
  <div class="report-history" v-if="store.jsonUrlHistory.length > 0">
    <el-select class="report-history__sort" v-model="currentJsonSort" size="small">
      <el-option value="url" label="sort by name">name</el-option>
      <el-option value="added" label="sort by date">date</el-option>
      <el-option value="used" label="sort by last used">last used</el-option>
    </el-select>

    <el-select size="small" class="report-history__select" filterable placeholder="Report URL" v-model="itemsJsonUrl">
      <el-option class="report-history__option"
                 v-for="option in options" :key="option.url"
                 :value="option.url" :label="store.shortReportUrl(option.url)">
        <a @click.prevent="" class="report-history__value-name" :href="getShareUrl(option.url)">
          {{ store.shortReportUrl(option.url) }}{{ option.count ? ` (${option.count})` : "" }}
        </a>
        <span class="report-history__value-date">{{ new Date(option.added).toLocaleString() }}</span>
      </el-option>
    </el-select>

    <button :class="{'input-clear': true, hidden: !isCurrentJsonInHistory}" @click="removeCurrentFromHistory"
            title="Remove current report from history">&cross;
    </button>

    <button
      :class="{'input-clear': true/*, hidden: !isCurrentJsonInHistory*/}"
      @click="itemsJsonUrl = 'input'" title="Convert JSON to table">input
    </button>
    ,

    <a :href="getShareUrl(itemsJsonUrl)" target="_blank">share</a> ,
    <a :href="itemsJsonUrl" target="_blank">json</a>
    <!--<template v-if="router.options.history.base === ''">
      , <a  :href="shareProdUrl" target="_blank">prod</a>
    </template>-->

    <template v-if="rescanUrl">
      ,
      <NuxtLink :to="rescanUrl" :title="rescanUrlTitle" class="report-history__rescan-link">rescan</NuxtLink>
      , <a @click.prevent="saveUrls" :href="rescanFiltered" class="report-history__rescan-filtered-link">
      rescan filtered
    </a>
      <!--<NuxtLink :to="rescanFiltered" v-if="rescanUrl" :title="rescanUrlTitle" class="report-history__rescan-filtered-link">
        rescan filtered
      </NuxtLink>-->
    </template>
    <template v-else>
      , <a @click.prevent="saveUrls" href="/scan?is_urls=1" class="report-history__rescan-filtered-link">
      rescan urls
    </a>
    </template>

    <div class="jsonRaw-wrapper" v-if="itemsJsonUrl === 'input'">
      <textarea
        class="jsonRaw"
        v-model="jsonRaw">
      </textarea>
    </div>
  </div>
</template>

<style lang="scss">
.report-history {
  //display: inline-block;

  &__sort {
    display: inline-block;
    width: 128px;
    margin: 0 3px 0 0;

    input {
      padding-left: 5px;
    }

    /* .el-radio-button__orig-radio:checked+.el-radio-button__inner {
      background-color: #ccc;
      border-color: #ccc;
      box-shadow: -1px 0 0 0 #ccc;
    } */
  }

  &__select {
    display: inline-block;
    min-width: 300px;
    max-width: 600px;
    @media (min-width: 600px) {
      min-width: 500px;
    }

    input {
      padding-left: 5px;
    }
  }

  &__option {
    max-width: 98vw;
  }

  &__value-name {
    float: left;
  }

  &__value-date {
    float: right;
    color: #8492a6;
    font-size: 13px;
    @media (max-width: 640px) {
      display: none;
    }
  }

  button {
    background: none;
    border: none;
  }

  .jsonRaw-wrapper {
    text-align: center;
  }

  .jsonRaw {
    margin: 10px auto;
    height: 50vh;
    width: 50vw;
  }
}

</style>

<script setup>
const store = useStore();
const route = useRoute();
const router = useRouter();

const props = defineProps({
  tableRef: Object,
});

const itemsJsonUrl = computed({
  get: () => store.itemsJsonUrl,
  set: val => store.setItemsJsonUrl({ url: val }),
});

const currentJsonSort = computed({
  get: () => store.currentJsonSort,
  set: val => store.$patch({ currentJsonSort: val }),
});

const jsonRaw = computed({
  get: () => store.jsonRaw,
  set: val => store.$patch({ jsonRaw: val }),
});

const isCurrentJsonInHistory = computed(() => {
  return store.jsonUrlHistory.some(item => item.url === itemsJsonUrl.value);
});

/*const shareProdUrl = computed(() => {
  return `https://viasite.github.io/json-viewer/?url=${itemsJsonUrl.value}`;
});*/

const rescanUrl = computed(() => {
  const scanOptions = store.scanOptions;
  let args = scanOptions.args;
  if (!args) return "";
  args = args.join(" ").trim();

  if (route.query["q"]) args += ` --report-q ${route.query["q"]}`;
  if (route.query["fields"]) args += ` --report-fields ${route.query["fields"]}`;

  return `/scan?url=${scanOptions.url}&args=${args}&run=1`;
});

const rescanFiltered = computed(() => {
  const scanOptions = store.scanOptions;
  let args = scanOptions.args;
  if (!args) return "";
  // if (args[0] === '--urls') args = args.slice(2); // save it in saveUrls(), not used
  args = args.join(" ").trim();

  if (route.query["q"]) args += ` --report-q ${route.query["q"]}`;
  if (route.query["fields"]) args += ` --report-fields ${route.query["fields"]}`;

  return `/scan?url=${scanOptions.url}&args=${args}`; // &run=1
});

function saveUrls() {
  const urls = props.tableRef.allFilteredData.map(item => item.url);
  store.$patch({ urls: urls.join("\n") });
  router.push(`${rescanFiltered.value}&is_urls=1`);
}

const rescanUrlTitle = computed(() => {
  const t = store.scanOptions.time;
  const mins = t ? Number(t / 60).toFixed(1) : "";
  return store.scanOptions.args?.join(" ").trim() + (mins ? `\n${mins} mins` : "");
});

const options = computed(() => {
  const opts = store.jsonUrlHistory.map(item => {
    return {
      url: item.url,
      count: item.count,
      added: item.added,
      used: item.used,
    };
  });
  const byField = currentJsonSort.value;
  const orderDesc = ["added", "used"].includes(byField);
  return opts.sort((a, b) => {
    let val;
    if (a[byField] === b[byField]) val = 0;
    else val = a[byField] > b[byField] ? 1 : -1;
    if (orderDesc) val *= -1; // inverse;
    return val;
  });
});

function removeCurrentFromHistory() {
  const history = [...store.jsonUrlHistory];
  const index = history.findIndex(i => i.url === itemsJsonUrl.value);
  if (index > -1) {
    history.splice(index, 1);
    store.$patch({ jsonUrlHistory: history });
  }
}

function getShareUrl(url) {
  return router.options.history.base + `?url=${url}`;
}
</script>
