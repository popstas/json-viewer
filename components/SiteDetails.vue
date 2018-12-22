<template>
  <div class="site-details">
    <a class="site-details__title" :href="site.url" target="_blank">{{ site.url }}</a>

    <div class="site-details__groups">
      <a
        class="site-details__groups-link"
        :href="'#' + site.domain + '-' + group.name"
        v-for="group in groups" :key="group.name"
      >
      {{ group.name }}</a>
    </div>

    <div class="site-details__group" v-for="group in groups" :key="group.name" :id="site.domain + '-' + group.name">
      <div class="site-details__group-name">{{ group.name }}</div>
      <ul class="site-details__group-fields">
        <li
          v-for="field in group.fields"
          :key="field.name"
          :title="field.name"
          :class="field.validateClass"
        >
          <span class="site-details__label">{{ field.comment }}</span>
          <span class="site-details__value">{{ field.valueText || field.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
.VueTables__child-row {
  background: none !important;
}

.site-details {
  padding: 15px;
  max-width: 100vw;
  overflow-x: auto;

  &__groups {
    padding: 0;
  }

  li {
    list-style: none;
    padding: 0;

    &:hover {
      background: #fbfbfb;
    }

    &.colored {
      &.success .site-details__value {
        color: #407927;
      }
      &.warning .site-details__value {
        color: #a09600;
      }
      &.danger .site-details__value {
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
export default {
  props: ["site"],
  computed: {
    tests() {
      return this.$store.state.tests;
    },

    groups() {
      let groups = { unnamed: { name: "", fields: [] } };
      for (let fieldName in this.site) {
        const fieldValue = this.site[fieldName];
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
            this.site.domain,
            fieldName
          );
          // console.log(fieldName + ' validateClass: ', info.validateClass);
          if (info.type == "boolean") {
            info.valueText = parseInt(info.value) ? "да" : "нет";
          }
          groups[groupName].fields.push(info);
        }
      }
      return groups;
    }
  }
};
</script>
