<template>
  <div class="item-details">
    <a v-if="item.url" class="item-details__title" :href="item.url" target="_blank">{{ item.url }}</a>

    <div class="item-details__groups">
      <a
        class="item-details__groups-link"
        :href="'#' + item[$store.state.defaultField] + '-' + group.name"
        v-for="group in groups"
        :key="group.name"
      >{{ group.name }}</a>
    </div>

    <div
      class="item-details__group"
      v-for="group in groups"
      :key="group.name"
      :id="item[$store.state.defaultField] + '-' + group.name"
    >
      <div class="item-details__group-name">{{ group.name }}</div>
      <ul class="item-details__group-fields">
        <li
          v-for="field in group.fields"
          :key="field.name"
          :title="field.name"
          :class="field.validateClass"
        >
          <span class="item-details__label">{{ field.comment || field.name }}</span>
          <span class="item-details__value" v-html="field.valueText || field.value"></span>

          <FilterPresetButton
            v-if="field.type == 'boolean' || true"
            class="field-preset"
            :preset="{ q: field.name + '=' + field.value }"
            append
          >
            <icon name="filter" scale="0.6"></icon>
          </FilterPresetButton>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.VueTables__child-row {
  background: none !important;
}
</style>

<script>
import FilterPresetButton from "~/components/FilterPresetButton";
import "vue-awesome/icons/filter";

export default {
  components: { FilterPresetButton },
  props: ["item"],
  computed: {
    tests() {
      return this.$store.state.tests;
    },

    groups() {
      let groups = { unnamed: { name: "", fields: [] } };
      for (let fieldName in this.item) {
        let val = this.item[fieldName];
        if (typeof val === "object") continue;
        if (val === "") continue;

        const field = this.tests[fieldName];
        if (!field || !field.groups) {
          // groups.unnamed.fields.push(val);
          continue;
        }
        field.value = val;

        const groupsList = Array.isArray(field.groups)
          ? field.groups
          : [field.groups];

        field.validateClass = this.getColumnValidateClass(field.value, field.validate);

        // console.log(fieldName + ' validateClass: ', field.validateClass);

        let valueText;

        if (field.type == "boolean") {
          valueText = parseInt(field.value) ? "yes" : "no"; // tolang
        }


        if (typeof val === 'string' && (field.type === 'image' || val.match(/^http.*\.(jpg|jpeg|png|gif)$/)) && val) {
          valueText = `<img alt="error loading image" style="width: 150px; height: auto;" src="${val}" title="${val}"/>`;
        }

        field.valueText = valueText;

        // add to groups
        for (let g in groupsList) {
          console.log('g: ', g);
          let groupName = groupsList[g];
          if (!(groupName in groups)) {
            groups[groupName] = { name: groupName, fields: [] };
          }

          const f = {...field};

          // hide field duplicates
          if (g != 0) f.validateClass += ' secondary group-'+ groupName;

          groups[groupName].fields.push(f);
        }
      }
      // console.log('groups: ', groups);
      return groups;
    }
  },
  methods: {
    // выдает класс валидации по значению и правилам валидации
    getColumnValidateClass(value, validateRules) {
      return this.$store.getters.getColumnValidateClass(value, validateRules);
    },
  }
};
</script>
