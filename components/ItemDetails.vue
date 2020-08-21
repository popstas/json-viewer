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
          <span class="item-details__value">{{ field.valueText || field.value }}</span>

          <FilterPresetButton
            v-if="field.type == 'boolean'"
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

.item-details {
  padding: 15px;
  max-width: 100vw;
  overflow-x: auto;

  &__groups {
    padding: 0;

    &-link {
      display: inline-block;
      padding: 10px;
    }
  }

  li {
    list-style: none;
    padding: 0;

    &:hover {
      background: #fbfbfb;
    }

    &.colored {
      &.success .item-details__value {
        color: #407927;
      }
      &.warning .item-details__value {
        color: #a09600;
      }
      &.danger .item-details__value {
        color: #94070a;
      }

      &:hover {
        &.success {
          background: #aaffaa;
        }
        &.warning {
          background: #ffffaa;
        }
        &.danger {
          background: #ffaaaa;
        }
      }
    }
  }

  &__title {
    font-size: 1.5rem;
  }

  &__group {
    margin-bottom: 15px;

    &:target {
      margin-top: 30px;
      padding: 15px;
      background: #fbfbfb;
    }
    &-name {
      font-size: 1.2rem;
      font-weight: bold;
    }

    &-fields {
      padding: 0;
    }
  }

  &__label {
    display: inline-block;
    width: 290px;

    @media (max-width: 400px) {
      width: auto;
      margin-right: 0.5em;
      color: #999;
      &:after {
        content: ":";
      }
    }
  }
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
        const fieldValue = this.item[fieldName];
        if (typeof fieldValue === "object") continue;
        if (fieldValue === "") continue;
        const info = this.tests[fieldName];
        if (!info || !info.groups) {
          // groups.unnamed.fields.push(fieldValue);
          continue;
        }

        const groupsList = Array.isArray(info.groups)
          ? info.groups
          : [info.groups];

        for (let g in groupsList) {
          let groupName = groupsList[g];
          if (!(groupName in groups)) {
            groups[groupName] = { name: groupName, fields: [] };
          }
          info.value = fieldValue;
          info.validateClass = this.$store.getters.getColumnValidateClass(
            null,
            this.item[this.$store.state.defaultField],
            fieldName
          );
          // console.log(fieldName + ' validateClass: ', info.validateClass);
          if (info.type == "boolean") {
            info.valueText = parseInt(info.value) ? "да" : "нет";
          }
          groups[groupName].fields.push(info);
        }
      }
      console.log('groups: ', groups);
      return groups;
    }
  }
};
</script>
