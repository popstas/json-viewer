<template>
  <div
    :class="{'available-fields__field': true, clicked }"
    :title="title"
  >
    <input type="checkbox" :checked="checked" @click="click">
    <label @click="click">{{ field.comment || field.title }}</label>
    <FilterPresetButton class="field-preset" :preset="{ q: field.name + '=' }" append>
      <el-icon :size="10">
        <el-icon-filter />
      </el-icon>
    </FilterPresetButton>
  </div>
</template>

<style lang="scss">
.available-fields__field {
  &.clicked {
    background: #ffffaa;
  }
}

.field-preset {
  &.filter-presets__button {
    font-size: 10px;
    color: #999;

    &_active {
      color: #ff0000;
      border: none;
    }
  }
}
</style>

<script setup>
const props = defineProps({
  field: Object,
  checked: Boolean,
});
const emit = defineEmits(["click"]);

const clicked = ref(false);

const title = computed(() => {
  return props.field.name
    + (props.field.comment ? ` \n\n${props.field.comment}` : "")
    + (props.field.command ? ` \n\n${props.field.command}` : "")
    + (props.field.description ? ` \n\n${props.field.description}` : "");
});

function click() {
  // clicked.value = true;
  emit("click", props.field);
}

</script>
