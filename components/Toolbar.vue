<template>
  <div class="table-toolbar">
    <!-- columns by tag -->
    <div class="available-fields">
      <button class="column-presets__button" @click="changeGroupOpenedAll">
        <span v-if="'main' in this.fieldGroupsOpened && this.fieldGroupsOpened.main">свернуть все</span>
        <span v-else>развернуть все</span>
      </button>
      <br>
      <button
        class="column-presets__button"
        @click="setPreset({name: 'none', columns: ['domain_idn']});"
        v-html="'убрать все колонки'"
      ></button>

      <!-- one group -->

      <FieldGroup
        :group="group"
        :opened="fieldGroupsOpened[group.name]"
        @changeGroupOpened="changeGroupOpened(group)"
        @toggleField="toggleField"
        @setPreset="setPreset"
        v-for="group in fieldGroups"
        :key="group.name"
        v-if="group.fields.length > 0"
      ></FieldGroup>
    </div>

    <el-autocomplete
      class="filter__query"
      placeholder="query"
      v-model="q"
      autofocus
      title="Например:
  engine:bitrix prod:1"
      v-bind:style="{width: filterWidth + 'px'}"
      ref="input"

      :fetch-suggestions="queryComplete"
      @select="querySelect"
      @keyup.enter.native="queryChangeAction"
    ></el-autocomplete>

    <div class="filter__query-tags">
      <el-tag closable
        v-for="tag in queryParts" :key="tag"
        v-if="tag != ''"
        :disable-transitions="false"
        @close="handleTagClose(tag)"
        v-html="tag.replace(/=1$/, '').replace('=', ' = ')"
      ></el-tag>
    </div>

    <div class="filter-presets">filters:
      <FilterPresetButton
        :preset="preset"
        @click="q = preset.q; queryChangeAction()"
        v-for="preset in filterPresets"
        :key="preset.name"
        :class="{ 'filter-presets__button_active': preset.q == q }"
      ></FilterPresetButton>
    </div>

    <div class="column-presets">columns:
      <ColumnPresetButton
        :preset="preset"
        @click="setPreset(preset);"
        v-for="preset in columnPresets"
        :key="preset.name"
      ></ColumnPresetButton>
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
import columnPresets from "~/assets/js/presets/columns.conf";
import filterPresets from "~/assets/js/presets/filters.conf";
import FilterPresetButton from "~/components/FilterPresetButton";
import ColumnPresetButton from "~/components/ColumnPresetButton";
import FieldGroup from "~/components/FieldGroup";

export default {
  components: { FilterPresetButton, ColumnPresetButton, FieldGroup },
  props: ["fields", "availableFields"],
  data() {
    return {
      q: "",
      lastQ: "",
      columnPresets: columnPresets,
      filterPresets: filterPresets,
      routerProcess: false,
      fieldGroupsOpened: {}
    };
  },

  computed: {
    tests() {
      return this.$store.state.tests;
    },

    queryParts() {
      return this.q.split('&');
    },

    // раскладывает поля по группам, с дублированием
    fieldGroups() {
      let groups = { unnamed: { name: "", fields: [] } };
      for (let i in this.availableFields) {
        const field = this.availableFields[i];
        const info = this.tests.find(test => test.name == field.name);
        if (!info || !info.groups) {
          groups.unnamed.fields.push(field);
          continue;
        }

        const groupsList = Array.isArray(info.groups)
          ? info.groups
          : [info.groups];
        for (let g in groupsList) {
          let groupName = groupsList[g];
          if (!(groupName in groups)) {
            groups[groupName] = { name: groupName, fields: [] };
          }
          groups[groupName].fields.push(field);
        }
      }
      return groups;
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
    }
  },

  created() {
    this.debouncedQueryChangeAction = _.debounce(this.queryChangeAction, 500);
  },

  methods: {
    queryChangeAction() {
      this.q = this.normalizeQuery(this.q);
      this.$emit("changeFilter", this.q);
    },

    normalizeQuery(q) {
      const parts = q.split('&');
      const normalizedParts = parts.map(part => {
        return part.replace(/^([a-z_0-9]+)$/, '$1=1'); // prod => prod=1
      });
      return normalizedParts.join('&');
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
    queryComplete(q, cb){
      const parts = q.split('&');
      const lastPart = parts[parts.length - 1];
      const matchFields = this.availableFields.filter(filter => filter.name.includes(lastPart));
      const sortedFields = matchFields.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
      cb(sortedFields.map(field => { return { value: field.name }}));
    },

    // выбор автодополнения
    querySelect(q){
      this.$refs.input.focus();
      let parts = this.lastQ.split('&');
      parts[parts.length - 1] = q.value;
      this.q = parts.join('&');
      this.queryChangeAction();
    }
  },

  handleTagClose(tag) {
    console.log('remove tag: ', tag);
    this.q = this.q.replace(tag + '&', '').replace('&' + tag, '').replace(tag, '');
  },

  mounted() {
    // filter init
    if (this.$route.query["q"]) this.q = this.$route.query["q"];
  }
};
</script>
