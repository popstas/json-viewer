<template>
  <div class="report-history">
    <el-select size="mini" class="current-json__history" placeholder="Report URL" v-model="itemsJsonUrl">
      <el-option
        v-for="option in options" :key="option.url"
        :value="option.url">
        <span style="float: left">{{ option.url.replace('https://site-audit.viasite.ru/reports/', '') }}</span>
        <span style="float: right; color: #8492a6; font-size: 13px">{{ new Date(option.used).toLocaleString() }}</span>
      </el-option>
    </el-select>

    <button class="input-clear" @click="removeCurrentFromHistory" title="Remove current report from history">&cross;</button>

    <a :href="itemsJsonUrl" target="_blank">json</a>,
    <a :href="shareUrl" target="_blank">share</a>
    <template v-if="$router.options.base == '/'">
      , <a  :href="shareProdUrl" target="_blank">prod</a>
    </template>
  </div>
</template>

<style lang="scss">
.report-history {
  .el-select {
    min-width: 300px;
    @media (min-width:600px) {
      min-width: 500px;
    }
  }
  &__history input{
    padding-left: 5px;
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
      const byField = 'url';
      return opts.sort((a, b) => {
        if (a[byField] === b[byField]) return 0;
        return a[byField] > b[byField] ? 1 : -1;
      });
    },

    jsonUrlHistory() {
      return this.$store.state.jsonUrlHistory;
    },

    shareUrl() {
      // console.log('this.$router: ', this.$router);
      return this.$router.options.base + `?url=${this.itemsJsonUrl}`;
    },

    shareProdUrl() {
      // console.log('this.$router: ', this.$router);
      return `https://viasite.github.io/site-audit-seo-viewer/?url=${this.itemsJsonUrl}`;
    },

  },

  methods: {
    removeCurrentFromHistory() {
      const history = {...this.$store.state.jsonUrlHistory};
      if(history[this.itemsJsonUrl]) {
        delete(history[this.itemsJsonUrl]);
        this.$store.commit('jsonUrlHistory', history);
      }
    },

  },
};
</script>
