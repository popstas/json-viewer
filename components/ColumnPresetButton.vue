<template>
  <button @click="emit('click', preset)"
          :class="{
      'column-presets__button': true,
      'column-presets__button_active': isActive,
    }"
          v-html="preset.name"
          :title="'Columns:\n' + preset.columns.join('\n')"
  ></button>
</template>

<script setup>

const store = useStore();
const props = defineProps({
  preset: Object,
});
const emit = defineEmits(["click"]);

const isActive = computed(() => {
  const columns = store.fields.map(f => f.name);
  return arraysEqual(props.preset.columns, columns);
});

function arraysEqual(a, b) {
  return !!a && !!b && !(a < b || b < a);
}
</script>
