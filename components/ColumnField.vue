<template>
  <div class="available-fields__field" ref="component"
    :title="field.name + (field.comment ? ` \n${field.comment}` : '') + (field.command ? ` \n${field.command}` : '')"
    @click="click"
  >
    <input type="checkbox" :checked="checked">
    <label>{{ field.comment || field.title }}</label>
  </div>
</template>

<style lang="scss">
.available-fields__field{
  &.clicked { background: #ffffaa;}
}
</style>

<script>
export default {
  props: ['field', 'checked'],
  methods: {
    click() {
      this.$refs.component.classList.add('clicked');
      this.$emit('click', this.field);
    }
  }
}
</script>
