<template>
  <div
    class="available-fields__field"
    ref="component"
    :title="title"
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

<script>
import FilterPresetButton from "~/components/FilterPresetButton";
import "vue-awesome/icons/filter";

export default {
  components: { FilterPresetButton },
  props: ["field", "checked"],
  methods: {
    click() {
      this.$refs.component.classList.add("clicked");
      // timeout for instant redraw
      setTimeout(() => {
        this.$emit("click", this.field);
      }, 10);
    }
  },
  computed: {
    title() {
      return this.field.name
      + (this.field.comment ? ` \n\n${this.field.comment}` : '')
      + (this.field.command ? ` \n\n${this.field.command}` : '')
      + (this.field.description ? ` \n\n${this.field.description}` : '')
    }
  }
};
</script>
