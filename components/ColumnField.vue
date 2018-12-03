<template>
  <div class="available-fields__field"
    :title="field.name + (field.comment ? ` \n${field.comment}` : '') + (field.command ? ` \n${field.command}` : '')"
    @click="$emit('click', field)"
  >
    <input type="checkbox" :checked="checked">
    <label>{{ field.comment || field.title }}</label>
  </div>
</template>

<script>
export default {
  props: ['field', 'checked']
}
</script>
