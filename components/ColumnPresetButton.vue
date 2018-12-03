<template>
  <button @click="$emit('click', preset)"
    class="column-presets__button"
    v-html="preset.name"
    :title="'Вывести колонки:\n' + preset.columns.join('\n')"
  ></button>
</template>

<script>
export default {
  props: ['preset']
}
</script>
