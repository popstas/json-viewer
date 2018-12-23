<template>
  <div class="query-input">
    <el-autocomplete
      class="filter__query"
      ref="input"
      placeholder="query"
      v-model="q"
      title="Например:
  engine=bitrix&prod=1"
      v-bind:style="{width: filterWidth + 'px'}"
      :fetch-suggestions="queryComplete"
      valueKey="name"
      :clearable="true"
      @select="querySelect"
      @clear="queryChangeAction"
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
      >{{ tagName(tag) }}</el-tag>
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
  data() {
    return {
      q: "",
      lastQ: "",
      currentPart: "",
      completionProcess: false
    };
  },

  computed: {
    tests() {
      return this.$store.state.tests;
    },

    allFields() {
      return this.$store.state.allFields;
    },

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
      // console.log('this.q: ', this.q);
      // console.log('this.globalQ: ', this.globalQ);
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
    // подсказывает из доступных полей и значений
    // если кол-во полей или значений равно нулю, тогда подсказки берутся из всех полей и сайтов,
    // это нужно, чтобы выбраться из сломанного запроса
    queryComplete(q, cb) {
      // в q старое значение, надо брать this.q
      if (!this.q || this.completionProcess) return cb([]);
      const parts = this.q.split("&");
      const lastPart = parts[parts.length - 1];

      this.completionProcess = true;
      setTimeout(() => {
        this.completionProcess = false;
      }, 500);

      if (lastPart.match(/[<=>]/)) {
        // field value completion
        this.currentPart = "value";
        const fieldMatch = lastPart.match(/(.*?)[<=>]/);
        const fieldName = fieldMatch[1];
        const matchFields = this.allFields.filter(
          filter => filter.name == fieldName
        );
        const valueMatch = lastPart.match(/=(.*)/);
        const fieldValue = valueMatch ? valueMatch[1] : "";
        const qRegex = new RegExp(fieldValue, "i");

        const sites =
          this.$store.state.filteredSites.length > 0
            ? this.$store.state.filteredSites
            : this.$store.state.sites;
        const values = sites.map(site => {
          if (
            !fieldValue ||
            (site[fieldName] && site[fieldName].toString().includes(fieldValue))
          ) {
            return site[fieldName];
          }
        });
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
        const fields =
          this.$store.state.availableFields.length > 0
            ? this.$store.state.availableFields
            : this.allFields;
        const matchFields = fields.filter(filter =>
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
        parts[parts.length - 1] =
          parts[parts.length - 1].replace(/=.*/, "") + "=" + q.name;
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
    },

    // название тега в выбранных фильтрах
    tagName(tag) {
      let tagName = tag.replace(/=1$/, "").replace(/([<=>])/, " $1 ");
      const match = tag.match(/^([a-z0-9_]+)(.*)/);
      if (match) {
        let fieldName = match[1];
        let fieldValue = match[2].replace(/([<=>])/, " $1 ");
        const info = this.tests[fieldName];
        if (info) {
          if (info.comment) fieldName = info.comment;
          if (info.type == "boolean") {
            fieldValue = fieldValue
              .replace("0", "нет")
              .replace("1", "да")
              .replace(" = ", ": ");
          }
          tagName = fieldName + fieldValue;
        }
      }
      return tagName;
    }
  },

  created() {
    // приходит из FilterPresetButton
    this.$nuxt.$on("inputFocus", () => this.$refs.input.focus());
  },

  mounted() {
    // filter init
    this.q = this.$store.state.q;
  }
};
</script>
