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
    <div class="field-group"
      :id="'filter-' + group.name"
      v-for="group in fieldGroups"
      :key="group.name"
      v-if="group.fields.length > 0"
    >
      <!-- group header -->
      <div class="field-group__header">
        <el-dropdown>
          <span class="el-dropdown-link" @click="changeGroupOpened(group)">
            <input
              type="checkbox"
              @click="setPreset({name: 'all', columns: [...['domain_idn'],...group.fields.map(f => f.name)]});"
              :title="'Вывести колонки:\n' + group.fields.map(f => f.comment).join('\n')"
            >
            <span class="field-group__name">{{ group.name }}</span>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="preset in columnPresets"
              :key="'columnPreset' + preset.name"
              v-if="preset.groups.indexOf(group.name) !== -1"
            >
              <button
                class="column-presets__button"
                @click="setPreset(preset);"
                v-html="preset.name"
                :title="'Вывести колонки:\n' + preset.columns.join('\n')"
              ></button>
            </el-dropdown-item>

            <el-dropdown-item
              v-for="preset in filterPresets"
              :key="preset.name"
              v-if="preset.groups.indexOf(group.name) !== -1"
            >
              <button
                class="filter-presets__button"
                @click="q = preset.q"
                v-html="preset.name"
                :title="'Отфильтровать:\n' + preset.q"
              ></button>
            </el-dropdown-item>

            <el-dropdown-item v-for="field in group.fields" :key="field.name">
              <div
                :title="field.name + (field.comment ? ` \n${field.comment}` : '') + (field.command ? ` \n${field.command}` : '')"
                @click="toggleField(field)"
                :class="{ 'available-fields__field': true, active: fieldIndex(field) != -1 }"
              >
                <input type="checkbox" :checked="fieldIndex(field) != -1">
                <label>{{ field.comment || field.title }}</label>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <!-- selected-fields -->
      <div class="field-group__selected-fields">
        <div
          v-for="field in group.fields"
          :key="field.name"
          v-if="fieldIndex(field) != -1 && !fieldGroupsOpened[group.name]"
          :title="field.name + (field.comment ? ` \n${field.comment}` : '') + (field.command ? ` \n${field.command}` : '')"
          @click="toggleField(field)"
          :class="{ 'available-fields__field': true, active: fieldIndex(field) != -1 }"
        >
          <input type="checkbox" :checked="fieldIndex(field) != -1">
          <label>{{ field.comment || field.title }}</label>
        </div>
      </div>

      <!-- group content -->
      <div
        :class="{'field-group__content': true, collapse: !fieldGroupsOpened[group.name]}"
      >
        <div
          :title="field.name + (field.comment ? ` \n${field.comment}` : '') + (field.command ? ` \n${field.command}` : '')"
          @click="toggleField(field)"
          :class="{ 'available-fields__field': true, active: fieldIndex(field) != -1 }"
          v-for="field in group.fields"
          :key="field.name"
        >
          <input type="checkbox" :checked="fieldIndex(field) != -1">
          <label>{{ field.comment || field.title }}</label>
        </div>
      </div>
    </div>
  </div>

  <input
    class="filter__query"
    placeholder="query"
    v-model="q"
    autofocus
    title="Например:
  engine:bitrix prod:1"
    v-bind:style="{width: filterWidth + 'px'}"
  >

  <div class="filter-presets">
    filters:
    <button
      :class="{'filter-presets__button': true, 'filter-presets__button_active': preset.q == q}"
      v-for="preset in filterPresets"
      :key="preset.name"
      @click="q = preset.q"
      v-html="preset.name"
      :title="preset.q"
    ></button>
  </div>

  <div class="column-presets">
    columns:
    <button
      class="column-presets__button"
      v-for="preset in columnPresets"
      :key="preset.name"
      @click="setPreset(preset);"
      v-html="preset.name"
      :title="preset.columns.join('\n')"
    ></button>
  </div>
</div>
</template>

<script>
import _ from "lodash";
import columnPresets from "~/assets/js/presets/columns.conf";
import filterPresets from "~/assets/js/presets/filters.conf";

export default {
  components: {},
  props: ['fields', 'availableFields'],
  data() {
    return {
      q: "",
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
    },

  },

  watch: {
    q(val) {
      this.debouncedQueryChangeAction(); // задержка после ввода фильтра
    }
  },

  created() {
    this.debouncedQueryChangeAction = _.debounce(this.queryChangeAction, 500);
  },

  methods: {
    queryChangeAction() {
      this.$emit("changeFilter", this.q);
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
      this.$emit('setFields', preset.columns);
    },

    toggleField(field) {
      this.$emit('toggleField', field);
    },

    // индекс поля в массиве по объекту
    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return field && column.name == field.name;
      });
    },

  },

  mounted() {
    // filter init
    if (this.$route.query["q"]) this.q = this.$route.query["q"];

  }
}
</script>
