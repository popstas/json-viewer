<template>
  <section class="container">
    <div>total: {{ filteredSites.length }}</div>

    <Toolbar
      :fields="fields"
      :availableFields="availableFields"
      @toggleField="toggleField"
      @setFields="setFields"
      @changeFilter="queryChangeAction">
    </Toolbar>

    <v-client-table
      v-if="filteredSites.length > 0"
      :columns="columns"
      :data="filteredSites"
      :options="tableOptions"
    >
      <template slot="child_row" slot-scope="props">
        <ul class="site-details">
          <li v-if="typeof value != 'object'" v-for="(value, key, index) in props.row" :key="index">
            <b>{{ key }}:</b>
            {{ value }}
          </li>
        </ul>
      </template>

      <!-- для каждой колонки создается слот, который получает класс и значение через функции, медленно -->
      <div
        v-for="colName in columns"
        :key="colName"
        :slot="colName"
        slot-scope="props"
        :class="[ 'cell', getColumnValidateClass(props, props.row.domain, colName) ]"
        v-html="getColumnValue(props.row, colName)"
      ></div>
    </v-client-table>

    <div>{{ $store.state.name }} {{ $store.state.version }}</div>
  </section>
</template>

<style lang="scss" src="./index.scss"></style>

<script>
import moment from "moment";
import Toolbar from '~/components/Toolbar';
import validateMap from "~/assets/js/validate.conf";
import columnPresets from "~/assets/js/presets/columns.conf";

export default {
  components: {Toolbar},
  data() {
    return {
      q: "",
      routerProcess: false,
      tests: this.$store.state.tests,
    };
  },

  computed: {
    fields() {
      return this.$store.state.fields;
    },

    filteredSites() {
      return this.$store.state.filteredSites;
    },

    filter() {
      return this.$store.state.filter;
    },

    tableOptions() {
      return {
        headings: this.headings,
        headingsTooltips: this.headingsTooltips,
        filterable: ["domain_idn"],
        perPage: this.filteredSites.length,
        perPageValues: [100, 250, 500],
        // columnsDropdown: true,
        rowClassCallback(row) {
          if (row.error) return "danger";
          // return 'success';
        },
        templates: {
          /* 'files_size'(h, row, index) { // работал, но перестал вызываться после убирания site.site_info
            console.log('row: ', row);
            if (!row.files_size) return '';
            return Math.round(row.files_size / 1024) || '';
          } */
        }
      };
    },

    columns() {
      return this.fields.map(field => field.name);
    },

    // заголовки колонок таблиц
    headings() {
      let h = {};
      this.fields.forEach(field => {
        h[field.name] = field.title.split("_").join(" ") || field.name;
      });
      return h;
    },

    // подсказки к колонкам
    headingsTooltips() {
      let h = {};
      this.fields.forEach(field => {
        h[field.name] = field.name;
        if (field.comment) h[field.name] = `${field.name} (${field.comment})`;
      });
      return h;
    },

    availableFields() {
      let excludedFields = [
        // objects
        "id",
        "tests",
        // duplicates
        "meta_engine",
        "meta_screenshots",
        "meta_prod",
        "site_root",
        // not working
        "total_pages_load_time",
        "result",
        "max_result",
        "result_percent"
      ];

      let fields = [];
      let fieldPaths = [];

      for (let siteInd in this.filteredSites) {
        let site = this.filteredSites[siteInd];

        // раньше из некоторых вложенных объектов доставались поля,
        // теперь они прессуются в одномерный объект
        let objs = {
          "": site
          // 'site_info.': site.site_info,
          // 'meta.': site.meta
        };

        for (let prefix in objs) {
          const obj = objs[prefix];
          for (let fieldName in obj) {
            let fieldPath = prefix + fieldName;
            if (excludedFields.includes(fieldPath)) continue;
            if (fieldPaths.includes(fieldPath)) continue;

            let field = {
              name: fieldPath,
              title: fieldName
            };

            // info from /etc/site-info.yml
            const info = this.$store.state.tests.find(test => test.name == fieldName);
            if (info) {
              if (info.comment) field.comment = info.comment;
              field.command = info.command;
            }

            fields.push(field);
            fieldPaths.push(fieldPath);
          }
        }
      }

      return fields;
    },

    pageTitle() {
      let title = ["viasite-projects"];
      if (this.q) title.push("q: " + this.q);
      if (this.fields.length > 0) title.push("fields: " + this.columns);
      return title.join(", ");
    }
  },

  methods: {
    queryChangeAction(q) {
      this.q = q;
      this.updateUrlQuery();
      this.changeFilter("q", q);

      // добавление колонок, которые есть в фильтре
      const parts = q.split("&");
      parts.forEach(part => {
        const match = part.match(/^[a-zA-Z0-9_]+/);
        if (match) this.addFieldByName(match[0]);
      });
    },

    // фильтр всегда меняется через эту функцию
    changeFilter(name, value) {
      this.$store.commit("changeFilter", { name, value });
      this.$store.dispatch("filterSites");
      // this.$emit('changeFilter', { name, value });
    },

    // переключает поле в таблице по клику
    toggleField(field, add) {
      this.$store.dispatch('toggleField', {field, add});
      this.updateUrlQuery();
    },

    // обновляет выбранные фильтры и колонки в урле
    updateUrlQuery() {
      if (this.routerProcess) return;
      this.routerProcess = true;
      setTimeout(() => {
        this.routerProcess = false;
      }, 100);

      let query = {};
      if (this.q) query.q = this.q;
      query.fields = this.columns.join(",");
      this.$router.push({ query });
    },

    // переключить поле по имени
    toggleFieldByName(name) {
      const field = this.availableFields.find(field => field.name == name);
      this.toggleField(field);
    },

    // включить поле по имени
    addFieldByName(name) {
      const field = this.availableFields.find(field => field.name == name);
      if (!field) return;
      this.toggleField(field, true);
    },

    // устанавливает поля по массиву имен, сбрасывает предыдущие выбранные поля
    setFields(columnNames) {
      const fields = [];
      columnNames.forEach(name => {
        const field = this.availableFields.find(field => field.name == name);
        fields.push(field);
      });
      this.$store.commit('fields', fields);
      this.updateUrlQuery();
    },

    // поставить из пресета полей
    setPreset(preset) {
      this.setFields(preset.columns);
    },

    // индекс поля в массиве по объекту
    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return field && column.name == field.name;
      });
    },

    // дополняет колонки sites.json
    sitesProcessing(sites) {
      if (!sites) return [];

      const sitesData = sites.map(s => {
        let site = { ...s };
        // should be before site_info flatten
        if (
          site.engine != "default" &&
          (!site.site_info || (site.site_info && !site.site_info.engine))
        ) {
          if (!site.site_info) site.site_info = {};
          site.site_info.engine = site.engine;
        }

        // flatten site_info
        for (let i in site.site_info) {
          site[i] = site.site_info[i];
          if (i == "files_size") site[i] = Math.round(site[i] / 1024);
          if (i == "git_size") site[i] = Math.round(site[i] / 1024);
          if (i == "updated_time")
            site[i] = moment.unix(site[i]).format("YYYY-MM-DD HH:mm:ss");
        }
        delete site.site_info;

        // flatten meta
        if (site.meta) {
          for (let i in site.meta) {
            const ln = "meta_" + i;
            site[ln] = site.meta[i];
          }
          delete site.meta;
        }

        // flatten lighthouse
        if (site.lighthouse) {
          // console.log(site.lighthouse);
          for (let i in site.lighthouse) {
            // вложенный объект
            if (i == "scores") {
              for (let s in site.lighthouse.scores) {
                const ln = "lighthouse_" + s.split("-").join("_");
                site[ln] = site.lighthouse.scores[s];
              }
            } else {
              const ln = "lighthouse_" + i.split("-").join("_");
              if (ln == "lighthouse_total_byte_weight") site.lighthouse[i] = Math.round(site.lighthouse[i] / 1024);
              site[ln] = site.lighthouse[i];
            }
          }
          delete site.lighthouse;
        }

        site.prod = site.prod ? 1 : 0;
        site.https = site.https ? 1 : 0;
        site.errors = site.error ? 1 : 0;
        site.id = site.domain;
        site.time = parseInt(site.time);
        return site;
      });
      return sitesData;
    },

    // выдает класс валидации по домену сайта и имени колонки
    getColumnValidateClass(props, domain, column) {
      const site = this.filteredSites.find(site => site.domain == domain);
      let result;
      if (!site) return "";

      // пустые не валидируются
      if ([undefined, ""].indexOf(site[column]) !== -1) return "";

      // проверяет, попадает ли значение под лимиты
      const isFits = (value, rules) => {
        let valid = true;
        if ("max" in rules && value > rules.max) return false;
        if ("min" in rules && value < rules.min) return false;
        return true;
      };

      // validate map
      // проверка на соответствие из массива
      if (column in validateMap) {
        const r = validateMap[column];
        if ("error" in r && isFits(site[column], r.error)) result = "fail";
        else if ("warn" in r && isFits(site[column], r.warn)) result = "warn";
        else result = "pass";
      }

      if (!result && site.tests) {
        const test = site.tests.find(test => test.name == column);
        if (!test || !test.valid) return "";
        result = test.valid;
      }

      if (!result) return;

      // console.log('props: ', props);
      // console.log('domain: ', domain);
      // console.log('column: ', column);

      const validClassesMap = {
        pass: "success",
        warn: "warning",
        fail: "danger"
      };
      return (
        "colored " + validClassesMap[result] + " " + result ||
        "noclass-" + result
      );
      return "success";
    },

    // достает значение colName из row, со вложенностью
    // https://stackoverflow.com/a/6394168/1716010
    getColumnValue(row, colName) {
      return colName.split(".").reduce((o, i) => (o ? o[i] : ""), row);
    },

    fieldsInit() {
      // fields init
      if (this.$route.query["fields"]) {
        this.setFields(this.$route.query["fields"].split(","));
      } else {
        this.setFields(columnPresets.default.columns);
      }
    }
  },

  async mounted() {

    // data init
    const sitesJson = await this.$axios.$get(this.$store.state.sitesJsonUrl);
    this.$store.commit("tests", sitesJson.tests);
    const sitesData = this.sitesProcessing(sitesJson.sites);
    this.$store.commit("sites", sitesData);
    this.$store.dispatch("filterSites");

    this.fieldsInit();

    // router change event
    this.$router.afterEach((to, from) => {
      if (!this.routerProcess) {
        if (this.$route.query["q"]) this.q = this.$route.query["q"];
        else this.q = "";

        this.fieldsInit();
      }
    });
  },

  head() {
    return {
      title: this.pageTitle
    };
  }
};
</script>
