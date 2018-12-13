<template>
  <div class="query-input">
    <el-autocomplete
      class="filter__query"
      ref="input"
      placeholder="query"
      v-model="q"
      autofocus
      title="Например:
  engine=bitrix&prod=1"
      v-bind:style="{width: filterWidth + 'px'}"
      :fetch-suggestions="queryComplete"
      valueKey="name"
      :clearable="true"
      @select="querySelect"
      @keyup.enter.native="queryChangeAction"
    >
      <template slot-scope="slotProps">
        <span class="query-input__field-name">{{ slotProps.item.name }}</span>
        <span class="query-input__field-label">{{ slotProps.item.comment }}</span>
      </template>
    </el-autocomplete>

    <div class="filter__query-tags">
      <el-tag
        v-for="tag in queryParts"
        :key="tag"
        v-if="tag != ''"
        closable
        :disable-transitions="true"
        @close="handleTagClose(tag)"
      >{{ tag.replace(/=1$/, '').replace('=', ' = ') }}</el-tag>
    </div>
  </div>
</template>

<style lang="scss">
.query-input {
  input {
    min-width: 85px;
    font-family: monospace;
  }

  // автодополнение
  &__field-name {
    font-weight: bold;
    font-size: 12px;
  }
  &__field-label {
    margin-left: 10px;
    color: #999;
  }
}

.el-autocomplete-suggestion {
  min-width: 360px;

  &__wrap {
    padding: 0;
    max-height: 60vh;
  }

  li {
    padding: 0 5px;
    font-size: 10px;
    line-height: 1.5rem;
  }
}
.el-tag {
  margin: 0 5px;
}
</style>

<script>
import _ from "lodash";
export default {
  props: ["availableFields"],
  data() {
    return {
      q: "",
      lastQ: "",
      currentPart: "",
      completionProcess: false
    };
  },

  computed: {
    globalQ() {
      return this.$store.state.q;
    },

    queryParts() {
      return this.$store.state.q.split("&");
    },

    filterWidth() {
      const padding = 45; // paddings and close button
      return (this.q.length + 1) * 8 + padding;
    }
  },

  watch: {
    q(val) {
      this.lastQ = this.q;
      // this.debouncedQueryChangeAction(); // задержка после ввода фильтра
    },
    globalQ() {
      // update local data when store value changes
      this.q = this.globalQ;
    }
  },

  created() {
    // this.debouncedQueryChangeAction = _.debounce(this.queryChangeAction, 500);
  },

  methods: {
    queryChangeAction() {
      if (this.completionProcess) {
        this.completionProcess = false;
        return;
      }

      // this.q = this.normalizeQuery(this.q);
      this.$store.dispatch("q", this.q);
    },

    /* normalizeQuery(q) {
      const parts = q.split("&");
      const normalizedParts = parts.map(part => {
        return part.replace(/^([a-z_0-9]+)$/, "$1=1"); // prod => prod=1
      });
      return normalizedParts.join("&");
    }, */

    // сворачивает/разворачивает одну группу
    changeGroupOpened(group) {
      this.fieldGroupsOpened[group.name] =
        group.name in this.fieldGroupsOpened
          ? !this.fieldGroupsOpened[group.name]
          : true;
      this.$forceUpdate();
    },

    // сворачивает/разворачивает все группы
    changeGroupOpenedAll() {
      let to = true;
      if ("main" in this.fieldGroupsOpened && this.fieldGroupsOpened.main)
        to = false;

      Object.keys(this.fieldGroups).forEach(groupName => {
        this.fieldGroupsOpened[groupName] = to;
      });
      this.$forceUpdate();
    },

    // поставить из пресета полей
    setPreset(preset) {
      this.$emit("setFields", preset.columns);
    },

    toggleField(field) {
      this.$emit("toggleField", field);
    },

    // индекс поля в массиве по объекту
    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return field && column.name == field.name;
      });
    },

    // autocomplete of query
    queryComplete(q, cb) {
      if (!q || this.completionProcess) return cb([]);
      const parts = q.split("&");
      const lastPart = parts[parts.length - 1];

      this.completionProcess = true;
      setTimeout(() => {
        this.completionProcess = false;
      }, 500);

      if (lastPart.match(/=/)) {
        // field value completion
        this.currentPart = "value";
        const fieldMatch = lastPart.match(/(.*?)=/);
        const fieldName = fieldMatch[1];
        const matchFields = this.availableFields.filter(
          filter => filter.name == fieldName
        );
        const valueMatch = lastPart.match(/=(.*)/);
        const qValue = valueMatch ? valueMatch[1] : '';
        const qRegex = new RegExp(qValue, 'i');

        const filteredSites = this.$store.state.filteredSites;
        const values = filteredSites.map(site => {
          console.log('site: ', site);
          console.log('fieldName: ', fieldName);
          if(!qValue || site[fieldName] && site[fieldName].includes(qValue)){
            return site[fieldName];
          }
        });
        console.log('values: ', values);
        const uniqueValues = values.filter((v, i, a) => a.indexOf(v) === i);
        const sortedValues = uniqueValues.sort();
        cb(
          sortedValues.map(name => {
            return { name };
          })
        );
      } else {
        // field name completion
        this.currentPart = "name";
        const matchFields = this.availableFields.filter(filter =>
          filter.name.includes(lastPart)
        );
        const sortedFields = matchFields.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );
        cb(sortedFields);
      }
    },

    // выбор автодополнения
    querySelect(q) {
      this.$refs.input.focus();
      let parts = this.lastQ.split("&");

      if (this.currentPart == "name") {
        parts[parts.length - 1] = q.name; // + "=";
        // this.$refs.input.$el.querySelector('input').dispatchEvent(new Event('change'));
      }

      if (this.currentPart == "value") {
        parts[parts.length - 1] = parts[parts.length - 1].replace(/=.*/, '') + '=' + q.name;
      }

      this.q = parts.join("&");

      // без этого сразу фильтрует при вводе имени
      setTimeout(() => {
        this.completionProcess = false;
      }, 500);

      if (this.currentPart == "value") this.queryChangeAction();
    },

    handleTagClose(tag) {
      this.q = this.q
        .replace(tag + "&", "")
        .replace("&" + tag, "")
        .replace(tag, "");
      this.queryChangeAction();
    }
  },

  mounted() {
    // filter init
    this.q = this.$store.state.q;
  }
};
</script>
