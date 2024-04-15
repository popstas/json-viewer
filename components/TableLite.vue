<script setup>
const store = useStore();
const props = defineProps({
  data: Array,
  // columns: Array,
  headings: Object,
  showTableFilters: Boolean,
});
const emit = defineEmits(["toggleField"]);
const tablewrapper = ref(null);
defineExpose({ tablewrapper });

function cellClass(row, field) {
  const classes = ["cell"];
  classes.push(`col-${field.name}`);
  if (field.default) {
    classes.push("col-default");
  }
  if (field.align) {
    classes.push(`align-${field.align}`);
  }
  if (["string", "email", "domain"].includes(field.type)) {
    classes.push("align-left");
  }
  if (["integer", "number", "boolean", "time"].includes(field.type)) {
    classes.push("align-center");
  }
  return classes.join(" ");
}
</script>

<template>
  <div class="VueTables VueTables--client">
    <div ref="tablewrapper" class="table-responsive VueTables__wrapper">
      <table class="VueTables__table table table-striped table-bordered table-hover">
        <thead>
        <tr v-if="showTableFilters" class="table__column-controls">
          <td v-for="field in store.fields" :key="field.name">
            <ColumnField
              :field="field"
              :checked="store.fieldExists(field)"
              @click="emit('toggleField', field, false, true)"
              :class="{ 'available-fields__field': true, active: store.fieldExists(field) }"
            ></ColumnField>
          </td>
        </tr>
        <tr>
          <th v-for="field in store.fields" :key="field.name">{{ headings[field.name] }}</th>
        </tr>
        </thead>
        <tbody>
        <tr class="VueTables__row" v-for="item in store.filteredItems" :key="item.id">
          <td v-for="field in store.fields" :key="field.name"
              :class="cellClass(item, field)">
            <div v-html="store.getColumnValue(item, field.name)"></div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
