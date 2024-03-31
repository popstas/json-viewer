<template>
  <div class="field-group" :id="'filter-' + group.name" v-if="group.fields.length > 0">
    <!-- group header -->
    <div class="field-group__header">
      <input
        type="checkbox"
        :checked="groupChecked"
        @click="setPreset({name: 'all', columns: [...[store.defaultField],...group.fields.map(f => f.name)]});"
        :title="'Columns:\n' + group.fields.map(f => f.comment).join('\n')"
      >

      <el-dropdown>
        <span class="el-dropdown-link" @click="changeGroupOpened">
          <span class="field-group__name">{{ group.name }}</span>
          <el-icon><el-icon-arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="preset in columnPresets"
              :key="'columnPreset' + preset.name"
            >
              <ColumnPresetButton :preset="preset" @click="setPreset(preset);"></ColumnPresetButton>
            </el-dropdown-item>
            <el-dropdown-item
              v-for="preset in filterPresets"
              :key="preset.name"
            >
              <FilterPresetButton :preset="preset"></FilterPresetButton>
            </el-dropdown-item>
            <el-dropdown-item v-for="field in group.fields" :key="field.name">
              <ColumnField
                :field="field"
                :checked="store.fieldExists(field)"
                @click="emit('toggleField', field, false, true)"
                :class="{ active: store.fieldExists(field) }"
              ></ColumnField>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- selected-fields -->
    <div class="field-group__selected-fields" v-if="!opened">
      <ColumnField
        :field="field"
        :checked="store.fieldExists(field)"
        v-for="field in groupExistsFields"
        :key="field.name"
        @click="emit('toggleField', field, false, true)"
        :class="{ active: store.fieldExists(field) }"
      ></ColumnField>
    </div>

    <!-- group content -->
    <div :class="{'field-group__content': true, hidden: !opened}">
      <!--      <span
              v-for="preset in columnPresets"
              :key="'columnPreset' + preset.name"
            >
              <ColumnPresetButton :preset="preset" @click="setPreset(preset);"></ColumnPresetButton>
            </span>

            <span
              v-for="preset in filterPresets"
              :key="preset.name"
            >
              <FilterPresetButton :preset="preset"></FilterPresetButton>
            </span>-->

      <ColumnField
        :field="field"
        :checked="store.fieldExists(field)"
        @click="emit('toggleField', field, false, true)"
        :class="{ 'available-fields__field': true, active: store.fieldExists(field) }"
        v-for="field in group.fields"
        :key="'content' + field.name"
      ></ColumnField>
    </div>
  </div>
</template>

<style lang="scss">
.field-group__content.hidden {
  display: none;
}
</style>

<script setup>
const props = defineProps({
  group: Object,
  opened: Boolean,
});
const emit = defineEmits(["toggleField", "setPreset", "changeGroupOpened"]);
const store = useStore();

const columnPresets = computed(() => {
  const presets = Object.entries(store.columnPresets).filter(([name, preset]) => isPresetInGroup(preset));
  return Object.fromEntries(presets);
});
const filterPresets = computed(() => {
  const presets = Object.entries(store.filterPresets).filter(([name, preset]) => isPresetInGroup(preset));
  return Object.fromEntries(presets);
});

const groupChecked = computed(() => {
  let checked = true;
  props.group.fields.forEach(field => {
    if (!store.fieldExists(field)) checked = false;
  });
  return checked;
});

const groupExistsFields = computed(() => {
  return props.group.fields.filter(field => store.fieldExists(field));
});

function isPresetInGroup(preset) {
  return preset.groups?.indexOf(props.group.name) !== -1;
}

function setPreset(preset) {
  emit("setPreset", preset);
}

function changeGroupOpened() {
  emit("changeGroupOpened");
}
</script>
