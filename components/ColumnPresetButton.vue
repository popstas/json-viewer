<template>
  <button @click="$emit('click', preset)"
    :class="{
      'column-presets__button': true,
      'column-presets__button_active': isActive(),
    }"
    v-html="preset.name"
    :title="'Columns:\n' + preset.columns.join('\n')"
  ></button>
</template>

<script>
export default {
  props: ['preset'],
  methods: {
    arraysEqual(a,b) { return !!a && !!b && !(a<b || b<a); },
    isActive() {
      const columns = this.$store.state.fields.map(f => f.name);
      return this.arraysEqual(this.preset.columns, columns)
    }
  }
}
</script>
