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

  .field-preset {
    margin-left: 15px;
  }

  li {
    list-style: none;
    padding: 0;

    &:hover {
      background: #fbfbfb;
    }

    .item-details__value {
      min-width: 75px;
      display: inline-block;
    }

    &.success,
    &.warning,
    &.danger {
      .item-details__value::after {
        margin-left: 15px;
        float: right;
      }
    }

    &.success {
      .item-details__value {
        color: #407927;
        // &::after { content: '✔'; }
      }

    }
    &.warning {
      .item-details__value {
        color: #a09600;
        &::after { content: '⚠'; }
      }
    }
    &.danger {
      .item-details__value {
        color: #94070a;
        &::after { content: '❌'; }
      }
    }

    &:hover {
      &.success {
        background: #ccffcc;
      }
      &.warning {
        background: #ffffcc;
      }
      &.danger {
        background: #ffcccc;
      }
    }
  }

  &__title {
    font-size: 1.5rem;
  }

  &__group {
    margin-bottom: 15px;
    margin-top: 50px;

    &:target {
      padding: 75px 15px 15px;
      background: #feffba;
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

        for (let g in groupsList) {
          let groupName = groupsList[g];
          if (!(groupName in groups)) {
            groups[groupName] = { name: groupName, fields: [] };
          }

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
          groups[groupName].fields.push(field);
        }
      }
      console.log('groups: ', groups);
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
