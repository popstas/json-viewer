<template>
  <div class="query-input">
    <el-autocomplete
      class="filter__query"
      ref="input"
      placeholder="query"
      v-model="q"
      autofocus
      title="Например:
  engine=bitrix&prod=1"
      v-bind:style="{width: filterWidth + 'px'}"
      :fetch-suggestions="queryComplete"
      @select="querySelect"
      @keyup.enter.native="queryChangeAction"
    ></el-autocomplete>

    <div class="filter__query-tags">
      <el-tag
        v-for="tag in queryParts"
        :key="tag"
        v-if="tag != ''"
        closable
        :disable-transitions="true"
        @close="handleTagClose(tag)"
      >{{ tag.replace(/=1$/, '').replace('=', ' = ') }}</el-tag>
    </div>
  </div>
</template>

<style lang="scss">
.el-autocomplete-suggestion {
  min-width: 360px;
}
.el-tag {
  margin: 0 5px;
}
</style>

<script>
import _ from "lodash";
export default {
  props: ["availableFields"],
  data() {
    return {
      q: "",
      lastQ: ""
    };
  },

  computed: {
    globalQ() {
      return this.$store.state.q;
    },

    queryParts() {
      return this.$store.state.q.split("&");
    },

    filterWidth() {
      const padding = 15;
      return (this.q.length + 1) * 10 + padding;
    }
  },

  watch: {
    q(val) {
      this.lastQ = this.q;
      // this.debouncedQueryChangeAction(); // задержка после ввода фильтра
    },
    globalQ() {
      this.q = this.globalQ;
    }
  },

  created() {
    // this.debouncedQueryChangeAction = _.debounce(this.queryChangeAction, 500);
  },

  methods: {
    queryChangeAction() {
      this.q = this.normalizeQuery(this.q);
      this.$store.dispatch("q", this.q);
    },

    normalizeQuery(q) {
      const parts = q.split("&");
      const normalizedParts = parts.map(part => {
        return part.replace(/^([a-z_0-9]+)$/, "$1=1"); // prod => prod=1
      });
      return normalizedParts.join("&");
    },

    // сворачивает/разворачивает одну группу
    changeGroupOpened(group) {
      this.fieldGroupsOpened[group.name] =
        group.name in this.fieldGroupsOpened
          ? !this.fieldGroupsOpened[group.name]
          : true;
      this.$forceUpdate();
    },

    // сворачивает/разворачивает все группы
    changeGroupOpenedAll() {
      let to = true;
      if ("main" in this.fieldGroupsOpened && this.fieldGroupsOpened.main)
        to = false;

      Object.keys(this.fieldGroups).forEach(groupName => {
        this.fieldGroupsOpened[groupName] = to;
      });
      this.$forceUpdate();
    },

    // поставить из пресета полей
    setPreset(preset) {
      this.$emit("setFields", preset.columns);
    },

    toggleField(field) {
      this.$emit("toggleField", field);
    },

    // индекс поля в массиве по объекту
    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return field && column.name == field.name;
      });
    },

    // autocomplete of query
    queryComplete(q, cb) {
      const parts = q.split("&");
      const lastPart = parts[parts.length - 1];
      const matchFields = this.availableFields.filter(filter =>
        filter.name.includes(lastPart)
      );
      const sortedFields = matchFields.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );
      cb(
        sortedFields.map(field => {
          return { value: field.name };
        })
      );
    },

    // выбор автодополнения
    querySelect(q) {
      this.$refs.input.focus();
      let parts = this.lastQ.split("&");
      parts[parts.length - 1] = q.value;
      this.q = parts.join("&");
      this.queryChangeAction();
    },

    handleTagClose(tag) {
      this.q = this.q
        .replace(tag + "&", "")
        .replace("&" + tag, "")
        .replace(tag, "");
      this.queryChangeAction();
    }
  },

  mounted() {
    // filter init
    this.q = this.$store.state.q;
  }
};
</script>
