<template>
  <div class="table-stats item-details">
    <ul>
      <li v-for="fStat in stats" :key="fStat.name" :class="['table-stats__field', fStat.class]">
        <span class="table-stats__field-name item-details__label" v-html="fStat.title"></span>

        <span v-if="fStat.subvalues.length === 0"
              class="table-stats__field-value item-details__value"
              v-html="fStat.value"></span>

        <div v-else class="table-stats__field-value item-details__value">
          <div v-for="subval of fStat.subvalues" :key="subval.value"
               :class="{'item-details__subvalue': true, [subval.validateClass]: true}"
          >
            <span class="item-details__subvalue-text">{{ subval.value }}: {{ subval.count }}</span>

            <!-- TODO2: ranges filter -->
            <FilterPresetButton class="field-preset" :preset="{ q: fStat.name + '=' + subval.value }" toggle no-count>
              <el-icon :size="10">
                <el-icon-filter />
              </el-icon>
            </FilterPresetButton>
          </div>
        </div>
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

<script setup>
const store = useStore();

const stats = computed(() => {
  const stats = [];

  // TODO2: to store/config
  const statFields = {
    average: [
      "lighthouse_scores_performance",
      "lighthouse_scores_pwa",
      "lighthouse_scores_accessibility",
      "lighthouse_scores_best-practices",
      "lighthouse_scores_seo",
      "lighthouse_first-contentful-paint",
      "lighthouse_speed-index",
      "lighthouse_largest-contentful-paint",
      "lighthouse_interactive",
      "lighthouse_total-blocking-time",
      "lighthouse_cumulative-layout-shift",
    ],

    sum: [],

    enum: [
      // site-discovery fields
      "engine",
      "site_template",
    ],

    range: [],
    unique: [],
  };

  for (let field of store.availableFields) {
    let stat = field.stat;
    if (!stat) continue;

    if (typeof stat === "string") stat = { type: stat };

    if (statFields[stat.type]) {
      statFields[stat.type].push(field.name);
    }
  }

  for (let field of store.availableFields) {
    field = store.tests[field.name];
    if (!field) continue;
    let fieldStat = field.stat;

    let val = "";
    let subvalues = [];
    let valueText = "";
    let validateClass = "";

    // average
    if (statFields["average"].includes(field.name)) {
      let sum = 0;
      for (let item of store.filteredItems) {
        sum += parseInt(item[field.name]);
      }
      val = Math.round(sum / store.filteredItems.length);
      validateClass = store.getColumnValidateClass(val, field.validate);
      valueText = val + " (average)"; // tolang
    }

    // sum
    if (statFields["sum"].includes(field.name)) {
      let sum = 0;
      for (let item of store.filteredItems) {
        sum += parseInt(item[field.name]);
      }
      val = sum;
      validateClass = store.getColumnValidateClass(val, field.validate);
      valueText = val + " (sum)"; // tolang
    }

    // ranges
    if (statFields["range"].includes(field.name)) {
      const rangesCount = {};
      const msg = [];

      // count ranges
      for (let item of store.filteredItems) {
        let val = parseInt(item[field.name]);
        // TODO2: universe with validate.js
        let ranges = fieldStat.ranges;
        if (!Array.isArray(ranges)) ranges = Object.keys(ranges); // object to array
        for (let range of ranges) {
          if (rangesCount[range] === undefined) rangesCount[range] = 0; // for correct order
          let isMatchValue;
          const minMax = range.match(/^(<|>)\s*(\d+)$/);
          const fromTo = minMax ? false : range.match(/^(\d+)-(\d+)$/);
          const exact = fromTo ? false : range.match(/^(\d+)$/);

          // minMax
          if (minMax) {
            const operator = minMax[1];
            const needValue = parseInt(minMax[2]);
            if (operator === "<" && val < needValue) isMatchValue = true;
            if (operator === ">" && val > needValue) isMatchValue = true;
          }

          // fromTo
          else if (fromTo) {
            const from = fromTo[1];
            const to = fromTo[2];
            isMatchValue = val >= from && val <= to;
          }

          // exact
          else if (exact) {
            const needValue = exact[1];
            isMatchValue = val === needValue;
          }

          if (isMatchValue) rangesCount[range]++;
        }
      }

      // build value string
      for (let range in rangesCount) {
        const valName = range;
        const count = rangesCount[range];
        if (count === 0) continue;
        msg.push(
          `<span class="item-details__subvalue">${valName}: ${count}</span>`,
        );
      }
      validateClass = "item-details__value_has-subvalues " + validateClass;
      val = msg.join("<br>");
    }

    // enum
    if (statFields["enum"].includes(field.name)) {
      let vals = {};
      for (let item of store.filteredItems) {
        const iVal = item[field.name];
        if ([null, undefined, ""].includes(iVal)) continue;

        if (vals[iVal]) vals[iVal] += 1;
        else vals[iVal] = 1;
      }
      const msg = [];
      for (let valName in vals) {
        const count = vals[valName];
        let valClass = store.getColumnValidateClass(valName, field.validate);
        if (valClass === "danger") validateClass = valClass;
        else if (valClass === "warning" && validateClass !== "danger") validateClass = valClass;
        else if (!validateClass) validateClass = valClass;

        // TODO2: universal renderItemValue, getColumnValue
        if (field.type === "boolean") {
          valName = parseInt(valName) ? "yes" : "no"; // tolang
        }

        subvalues.push({
          validateClass: valClass,
          value: valName,
          count: count,
        });

        // if (valClass === 'success') valClass = '';
        // TODO2: remove, not used, subvalues
        msg.push(
          `<span class="item-details__subvalue ${valClass}">${valName}: ${count}</span>`,
        );

        validateClass = "item-details__value_has-subvalues " + validateClass;
      }
      val = msg.join("<br>");
    }

    // non-unique values
    if (statFields["unique"].includes(field.name)) {
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
        store.filteredItems.map((item) => item[field.name]),
      );

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
        value: "<span class=\"item-details__subvalue-text\">" + (valueText || val) + "</span>",
        subvalues: subvalues,
      });
    }
  }
  return stats;
});
</script>
