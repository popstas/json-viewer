<template>
  <div class="report-history">
    <el-select size="mini" class="current-json__history" placeholder="Report URL" v-model="itemsJsonUrl">
      <el-option
        v-for="(data, url) in jsonUrlHistory" :key="url"
        :value="url">
        <span style="float: left">{{ url.replace('https://site-audit.viasite.ru/reports/', '') }}</span>
        <span style="float: right; color: #8492a6; font-size: 13px">{{ new Date(data.used).toLocaleString() }}</span>
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
