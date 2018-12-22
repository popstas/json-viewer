<template>
  <div
    class="available-fields__field"
    ref="component"
    :title="field.name + (field.comment ? ` \n${field.comment}` : '') + (field.command ? ` \n${field.command}` : '')"
  >
    <input type="checkbox" :checked="checked" @click="click">
    <label @click="click">{{ field.comment || field.title }}</label>
    <FilterPresetButton class="field-preset" :preset="{ q: field.name + '=' }" append>
      <icon name="filter" scale="0.6"></icon>
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
  font-size: 10px;
  color: #999;

  &.filter-presets__button_active {
    color: #ff0000;
    border: none;
  }
}
</style>

<script>
import FilterPresetButton from "~/components/FilterPresetButton";
import "vue-awesome/icons/filter";

export default {
  components: { FilterPresetButton },
  props: ["field", "checked"],
  methods: {
    click() {
      this.$refs.component.classList.add("clicked");
      this.$emit("click", this.field);
    }
  }
};
</script>
