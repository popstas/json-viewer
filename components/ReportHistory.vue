<template>
  <div class="report-history" v-if="jsonUrlHistoryCount > 1">
    <el-radio-group class="report-history__sort" v-model="currentJsonSort" size="mini">
      <el-radio-button label="url">name</el-radio-button>
      <el-radio-button label="added">date</el-radio-button>
      <el-radio-button label="used">last used</el-radio-button>
    </el-radio-group>

    <el-select size="mini" class="report-history__select" filterable placeholder="Report URL" v-model="itemsJsonUrl">
      <el-option class="report-history__option"
        v-for="option in options" :key="option.url"
        :value="option.url">
        <a @click.prevent="" class="report-history__value-name" :href="getShareUrl(option.url)">{{ shortReportUrl(option.url) }}</a>
        <span class="report-history__value-date">{{ new Date(option.added).toLocaleString() }}</span>
      </el-option>
    </el-select>

    <button :class="{'input-clear': true, hidden: !isCurrentJsonInHistory}" @click="removeCurrentFromHistory" title="Remove current report from history">&cross;</button>

    <a :href="itemsJsonUrl" target="_blank">json</a>,
    <a :href="getShareUrl(itemsJsonUrl)" target="_blank">share</a>
    <template v-if="$router.options.base == '/'">
      , <a  :href="shareProdUrl" target="_blank">prod</a>
    </template>
  </div>
</template>

<style lang="scss">
.report-history {
  &__sort {
    margin: 4px 3px 0 0;

    .el-radio-button__orig-radio:checked+.el-radio-button__inner {
      background-color: #ccc;
      border-color: #ccc;
      box-shadow: -1px 0 0 0 #ccc;
    }
  }

  &__select {
    min-width: 300px;
    @media (min-width:600px) {
      min-width: 500px;
    }

    input{
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
    @media (max-width: 640px){
      display: none;
    }
  }

  button {
    background: none;
    border: none;
  }
}

</style>

<script>
import FilterPresetButton from "~/components/FilterPresetButton";
import "vue-awesome/icons/filter";

export default {
  components: {},

  computed: {
    itemsJsonUrl: {
      get() {
        return this.$store.state.itemsJsonUrl;
      },
      set(val) {
        this.$store.commit('itemsJsonUrl', val);
      }
    },

    currentJsonSort: {
      get() {
        return this.$store.state.currentJsonSort;
      },
      set(val) {
        this.$store.commit('currentJsonSort', val);
      }
    },

    options() {
      const opts = [];
      for (let url in this.jsonUrlHistory) {
        const data = this.jsonUrlHistory[url];
        opts.push({
          url: url,
          used: data.used,
          added: data.added,
        });
      }
      const byField = this.currentJsonSort;
      const orderDesc = ['added', 'used'].includes(byField);
      return opts.sort((a, b) => {
        let val = 0;
        if (a[byField] === b[byField]) val = 0;
        else val = a[byField] > b[byField] ? 1 : -1;
        if (orderDesc) val *= -1; // inverse;
        return val;
      });
    },

    jsonUrlHistory() {
      return this.$store.state.jsonUrlHistory;
    },

    jsonUrlHistoryCount() {
      return Object.entries(this.jsonUrlHistory).length;
    },

    isCurrentJsonInHistory() {
      return this.jsonUrlHistory[this.itemsJsonUrl] !== undefined;
    },

    shareProdUrl() {
      // console.log('this.$router: ', this.$router);
      return `https://viasite.github.io/site-audit-seo-viewer/?url=${this.itemsJsonUrl}`;
    },

  },

  methods: {
    removeCurrentFromHistory() {
      const history = {...this.jsonUrlHistory};
      if(history[this.itemsJsonUrl]) {
        delete(history[this.itemsJsonUrl]);
        this.$store.commit('jsonUrlHistory', history);
      }
    },

    getShareUrl(url) {
      return this.$router.options.base + `?url=${url}`;
    },

    shortReportUrl(url) {
      const userDir = (this.$store.state.user?.uid || '').slice(0, 5);
      return url.
        replace('https://site-audit.viasite.ru/reports/', '').
        replace(this.$store.state.serverUrl + '/reports/', '').
        replace(userDir + '/', '');
    }
  },
};
</script>
