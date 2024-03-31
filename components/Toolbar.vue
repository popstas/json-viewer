<template>
  <div class="table-toolbar">
    <!-- columns by tag -->
    <div class="available-fields">
      <button class="column-presets__button_expand-all column-presets__button column-presets__button_icon"
              @click="changeGroupOpenedAll">
        <template v-if="store.openGroups">
          <el-icon>
            <el-icon-minus />
          </el-icon>&nbsp;<span>collapse all</span>
        </template>
        <template v-else>
          <el-icon>
            <el-icon-plus />
          </el-icon>&nbsp;<span>expand all</span>
        </template>
      </button>

      <br><br>
      <button
        class="column-presets__button_show-all column-presets__button column-presets__button_icon"
        @click="setPreset({name: 'none', columns: store.availableFields.map(f => f.name)});"
      >
        <el-icon>
          <el-icon-select />
        </el-icon>&nbsp;<span>show all columns</span></button>

      <button
        class="column-presets__button column-presets__button_icon"
        @click="setPreset({name: 'none', columns: [store.defaultField]});"
      >✖ <span>remove all columns</span></button>

      <button v-if="store.columnPresets.default"
              class="column-presets__button column-presets__button_icon"
              @click="setDefaultPreset"
      ><span>default columns</span></button>

      <!-- <button
        class="column-presets__button"
        @click="getCSV"
        v-html="'получить CSV'"
        title="Вывод будет в console.log"
      ></button> -->

      <!-- one group -->
      <FieldGroup
        :group="group"
        :opened="dd.fieldGroupsOpened[group.name] || store.openGroups"
        @changeGroupOpened="changeGroupOpened(group)"
        @toggleField="toggleField"
        @setPreset="setPreset"
        v-for="group in fieldGroups"
        :key="group.name"
      ></FieldGroup>

      <el-autocomplete
        class="field-search field-add-input"
        ref="inputRef"
        placeholder="add column"
        v-model="dd.fieldQuery"
        title="Field search"
        :fetch-suggestions="fieldComplete"
        valueKey="name"
        :clearable="true"
        @select="fieldSelect"
      >
        <template #default="{ item }">
          <span class="query-input__field-name">{{ item.name }}</span>
          <span class="query-input__field-label">{{ item.comment }}</span>
        </template>
      </el-autocomplete>
    </div>

    <div class="total">
      total: {{ store.filteredItems.length }}
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

<script setup>
const emit = defineEmits(["toggleField", "setPreset"]);
const store = useStore();

const dd = reactive({
  fieldGroupsOpened: {},
  completionProcess: false,
  fieldQuery: "",
});

const inputRef = ref(null);

// раскладывает поля по группам, с дублированием
const fieldGroups = computed(() => {
  let groups = { unnamed: { name: "[ungrouped]", fields: [] } };
  for (let i in store.availableFields) {
    const field = store.availableFields[i];
    const info = store.tests[field.name];
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
});

// сворачивает/разворачивает одну группу
function changeGroupOpened(group) {
  dd.fieldGroupsOpened[group.name] =
    group.name in dd.fieldGroupsOpened
      ? !dd.fieldGroupsOpened[group.name]
      : true;
}

// сворачивает/разворачивает все группы
function changeGroupOpenedAll() {
  let to = !store.openGroups;
  store.$patch({ openGroups: to });

  Object.keys(fieldGroups.value).forEach(groupName => {
    dd.fieldGroupsOpened[groupName] = to;
  });
}

// поставить из пресета полей
function setPreset(preset) {
  emit("setPreset", preset);
}

function setDefaultPreset() {
  // changeGroupOpened(group); TODO2: collapse columns explorer
  setPreset(store.columnPresets.default);
}

function toggleField(field, add = false, updateQuery = false) {
  emit("toggleField", field, add, updateQuery);
}

// автодополнение названия поля
function fieldComplete(q, cb) {
  if (!q || dd.completionProcess) return cb([]);

  dd.completionProcess = true;
  setTimeout(() => {
    dd.completionProcess = false;
  }, 500);

  // field name completion
  const fields =
    store.availableFields.length > 0
      ? store.availableFields
      : store.allFields;
  const matchFields = fields.filter(
    filter =>
      filter.name.includes(q) ||
      filter.comment && filter.comment.toLowerCase().includes(q.toLowerCase()),
  );
  const sortedFields = matchFields.sort((a, b) =>
    a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
  );
  cb(sortedFields);
}

// выбор автодополнения
function fieldSelect(field) {
  inputRef.value.focus();
  dd.fieldQuery = "";

  // const field = allFields.value.find(field => field.name == q);
  if (field) toggleField(field);

  // без этого сразу фильтрует при вводе имени
  setTimeout(() => {
    dd.completionProcess = false;
  }, 500);
}
</script>
