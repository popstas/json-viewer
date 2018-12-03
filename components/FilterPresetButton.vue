<template>
  <button @click="$emit('click', preset)"
    class="filter-presets__button"
    v-html="preset.name"
    :title="'Отфильтровать:\n' + preset.q"
  ></button>
</template>

<script>
export default {
  props: ['preset']
}
</script>
