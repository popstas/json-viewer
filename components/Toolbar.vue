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

      <el-autocomplete
        class="field-search"
        ref="input"
        placeholder="добавить колонку"
        v-model="fieldQuery"
        title="Поиск полей"
        :fetch-suggestions="fieldComplete"
        valueKey="name"
        :clearable="true"
        @select="fieldSelect"
      >
        <template slot-scope="slotProps">
          <span class="query-input__field-name">{{ slotProps.item.name }}</span>
          <span class="query-input__field-label">{{ slotProps.item.comment }}</span>
        </template>
      </el-autocomplete>
    </div>

    <QueryInput class="filter__query"></QueryInput>

    <div class="filter-presets">filters:
      <FilterPresetButton
        :preset="preset"
        v-for="preset in filterPresets"
        :key="preset.name"
        toggle
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

  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
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
  data() {
    return {
      columnPresets: columnPresets,
      filterPresets: filterPresets,
      fieldGroupsOpened: {},
      completionProcess: false,
      fieldQuery: ""
    };
  },

  computed: {
    tests() {
      return this.$store.state.tests;
    },

    fields() {
      return this.$store.state.fields;
    },

    availableFields() {
      return this.$store.state.availableFields;
    },

    allFields() {
      return this.$store.state.allFields;
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
    },

    // автодополнение названия поля
    fieldComplete(q, cb) {
      if (!q || this.completionProcess) return cb([]);

      this.completionProcess = true;
      setTimeout(() => {
        this.completionProcess = false;
      }, 500);

      // field name completion
      const fields =
        this.$store.state.availableFields.length > 0
          ? this.$store.state.availableFields
          : this.allFields;
      const matchFields = fields.filter(
        filter =>
          filter.name.includes(q) ||
          filter.comment.toLowerCase().includes(q.toLowerCase())
      );
      const sortedFields = matchFields.sort((a, b) =>
        a.name > b.name ? 1 : b.name > a.name ? -1 : 0
      );
      cb(sortedFields);
    },

    // выбор автодополнения
    fieldSelect(field) {
      this.$refs.input.focus();
      this.fieldQuery = "";

      // const field = this.allFields.find(field => field.name == q);
      if (field) this.toggleField(field);

      // без этого сразу фильтрует при вводе имени
      setTimeout(() => {
        this.completionProcess = false;
      }, 500);
    }
  }
};
</script>
