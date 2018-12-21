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

    <QueryInput class="filter__query" :availableFields="availableFields"></QueryInput>

    <div class="filter-presets">filters:
      <FilterPresetButton :preset="preset" v-for="preset in filterPresets" :key="preset.name"></FilterPresetButton>
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
import columnPresets from "~/assets/js/presets/columns.conf";
import filterPresets from "~/assets/js/presets/filters.conf";
import FilterPresetButton from "~/components/FilterPresetButton";
import ColumnPresetButton from "~/components/ColumnPresetButton";
import FieldGroup from "~/components/FieldGroup";
import QueryInput from "~/components/QueryInput";

export default {
  components: {
    FilterPresetButton,
    ColumnPresetButton,
    FieldGroup,
    QueryInput
  },
  props: ["fields", "availableFields"],
  data() {
    return {
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

    // раскладывает поля по группам, с дублированием
    fieldGroups() {
      let groups = { unnamed: { name: "", fields: [] } };
      for (let i in this.availableFields) {
        const field = this.availableFields[i];
        const info = this.tests[field.name];
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
    }
  },

  methods: {
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
    }
  }
};
</script>
