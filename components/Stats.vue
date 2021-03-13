<template>
  <div class="table-stats item-details">
    <ul>
      <li v-for="fStat in stats" :key="fStat.name" :class="['table-stats__field', fStat.class]">
        <span class="table-stats__field-name item-details__label" v-html="fStat.title"></span>

        <span v-if="fStat.subvalues.length === 0"
          class="table-stats__field-value item-details__value"
          v-html="fStat.value"></span>

        <span v-else class="table-stats__field-value item-details__value">
          <div v-for="subval of fStat.subvalues" :key="subval.value"
            :class="{'item-details__subvalue': true, [subval.validateClass]: true}"
          >
            <span class="item-details__subvalue-text">{{ subval.value }}: {{ subval.count }}</span>

            <FilterPresetButton class="field-preset" :preset="{ q: fStat.name + '=' + subval.value }" toggle no-count>
              <icon name="filter" scale="0.6"></icon>
            </FilterPresetButton>
          </div>
        </span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.table-stats {
  padding: 15px 0;
  text-align: left;

  ul {
    padding-left: 0;
  }

  &__field {
    margin-bottom: 5px;
    @media (max-width: 640px) {
      margin-bottom: 30px;
    }
  }

  /* &__field-name {
    display: inline-block;
    min-width: 200px;
  } */

  .success {
    color: #407927;
  }
  .warning {
    color: #a09600;
  }
  .danger {
    color: #94070a;
  }

  .item-details__subvalue {
    &:hover {
      background: #eee;
    }

    &.warning {
      &::after {
        content: "⚠";
        margin-left: 15px;
        float: right;
      }
    }
    &.danger {
      &::after {
        content: "❌";
        margin-left: 15px;
        float: right;
      }
    }

    &-text {
      display: inline-block;
      min-width: 100px;
    }
  }
}
</style>

<script>
import FilterPresetButton from "~/components/FilterPresetButton";
export default {
  components: {FilterPresetButton},
  data() {
    return {
      fieldGroupsOpened: {},
      completionProcess: false,
      fieldQuery: "",
    };
  },

  computed: {
    stats() {
      const stats = [];

      const rangeFields = [];
      for (let field of this.availableFields) {
        if (field.stat && field.stat.type === 'ranges') rangeFields.push(field.name);
      }

      for (let field of this.availableFields) {
        field = this.tests[field.name];
        if (!field) continue;

        let val = "";
        let subvalues = [];
        let valueText = "";
        let validateClass = "";

        // average
        // TODO: field.stat = 'average'
        const averageFields = [
          // 'lighthouse_scores_performance',
          'lighthouse_scores_pwa',
          'lighthouse_scores_accessibility',
          'lighthouse_scores_best-practices',
          'lighthouse_scores_seo',
          'lighthouse_first-contentful-paint',
          'lighthouse_speed-index',
          'lighthouse_largest-contentful-paint',
          'lighthouse_interactive',
          'lighthouse_total-blocking-time',
          'lighthouse_cumulative-layout-shift',
          // "request_time",
          // "dom_size",
          // "html_size",
          "text_ratio_percent",
        ];
        if (averageFields.includes(field.name)) {
          let sum = 0;
          for (let item of this.filteredItems) {
            sum += parseInt(item[field.name]);
          }
          val = Math.round(sum / this.filteredItems.length);
          validateClass = this.getColumnValidateClass(val, field.validate);
          valueText = val + " (average)"; // tolang
        }

        // ranges
        if (rangeFields.includes(field.name)) {
          const rangesCount = {};
          const msg = [];

          // count ranges
          for (let item of this.filteredItems) {
            let val = parseInt(item[field.name]);
            // TODO:L universe with validate.js
            let ranges = field.stat.ranges;
            if (!Array.isArray(ranges)) ranges = Object.keys(ranges); // object to array
            for (let range of ranges) {
              if (rangesCount[range] === undefined) rangesCount[range] = 0; // for correct order
              let isMatchValue;
              let minMax, fromTo, exact;

              // minMax
              if (minMax = range.match(/^(<|>)\s*(\d+)$/)) {
                const operator = minMax[1];
                const needValue = parseInt(minMax[2]);
                if (operator == '<' && val < needValue) isMatchValue = true;
                if (operator == '>' && val > needValue) isMatchValue = true;
              }

              // fromTo
              else if (fromTo = range.match(/^(\d+)-(\d+)$/)) {
                const from = fromTo[1];
                const to = fromTo[2];
                isMatchValue = val >= from && val <= to;
              }

              // exact
              else if (exact = range.match(/^(\d+)$/)) {
                const needValue = exact[1];
                isMatchValue = val == needValue;
              }

              if (isMatchValue) rangesCount[range]++;
            }
          }

          // build value string
          // console.log('rangesCount: ', rangesCount);
          for (let range in rangesCount) {
            const valName = range;
            const count = rangesCount[range];
            if (count === 0) continue;
            msg.push(
              `<span class="item-details__subvalue">${valName}: ${count}</span>`
            )
          }
          validateClass = 'item-details__value_has-subvalues ' + validateClass;
          val = msg.join("<br>");
        }

        // enum
        const enumFields = [
          "canonical_count",
          "is_canonical",
          "h1_count",
          "engine",
          "site_template",
        ];
        if (enumFields.includes(field.name)) {
          let vals = {};
          for (let item of this.filteredItems) {
            const iVal = item[field.name];
            if ([null, undefined, ''].includes(iVal)) continue;

            if (vals[iVal]) vals[iVal] += 1;
            else vals[iVal] = 1;
          }
          const msg = [];
          for (let valName in vals) {
            const count = vals[valName];
            let valClass = this.getColumnValidateClass(valName, field.validate);
            if (valClass === 'danger') validateClass = valClass;
            else if (valClass === 'warning' && validateClass !== 'danger') validateClass = valClass;
            else if (!validateClass) validateClass = valClass;

            // TODO: universal renderItemValue, getColumnValue
            if (field.type === 'boolean') {
              valName = parseInt(valName) ? 'yes' : 'no'; // tolang
            }

            subvalues.push({
              validateClass: valClass,
              value: valName,
              count: count,
            });

            // if (valClass === 'success') valClass = '';
            // TODO: remove, not used, subvalues
            msg.push(
              `<span class="item-details__subvalue ${valClass}">${valName}: ${count}</span>`
            );

            validateClass = 'item-details__value_has-subvalues ' + validateClass;
          }
          val = msg.join("<br>");
        }

        // non-unique values
        const uniqueFields = ["title", "description", "h1", "keywords"];
        if (uniqueFields.includes(field.name)) {
          const findDuplicates = (arr) => {
            let sorted_arr = arr.slice().sort(); // You can define the comparing function here.
            let results = [];
            for (let i = 0; i < sorted_arr.length - 1; i++) {
              if (sorted_arr[i + 1] == sorted_arr[i]) {
                results.push(sorted_arr[i]);
              }
            }
            return results;
          };

          const dupls = findDuplicates(
            this.filteredItems.map((item) => item[field.name])
          );
          // console.log('dupls: ', dupls);

          val = dupls.length;
          validateClass = dupls.length > 0 ? "warning" : "success"; // tolang
          if (dupls.length > 0) {
            valueText = `${dupls.length} non-unique values`; // tolang
          } else {
            valueText = `all unique`; // tolang
          }
        }

        // add stat if val
        if (val) {
          stats.push({
            name: field.name,
            title: field.comment || field.name,
            class: validateClass,
            value: '<span class="item-details__subvalue-text">' + (valueText || val) + '</span>',
            subvalues: subvalues,
          });
        }
      }
      // console.log("stats: ", stats);
      return stats;
    },

    availableFields() {
      return this.$store.state.availableFields;
    },

    tests() {
      return this.$store.state.tests;
    },

    filteredItems() {
      return this.$store.state.filteredItems;
    },

    fields() {
      return this.$store.state.fields;
    },
  },
  methods: {
    // выдает класс валидации по значению и правилам валидации
    getColumnValidateClass(value, validateRules) {
      return this.$store.getters.getColumnValidateClass(value, validateRules);
    },
  },
};
</script>
