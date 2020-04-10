<template>
  <section class="container">
    <div>total: {{ filteredSites.length }}</div>

    <Toolbar @toggleField="toggleField" @setFields="setFields"></Toolbar>

    <v-client-table
      v-if="filteredSites.length > 0"
      :columns="columns"
      :data="filteredSites"
      :options="tableOptions"
    >
      <template slot="child_row" slot-scope="props">
        <SiteDetails :site="$store.getters.getSiteByDomain(props.row.domain)"></SiteDetails>
      </template>

      <!-- для каждой колонки создается слот, который получает класс и значение через функции, медленно -->
      <div
        v-for="colName in columns"
        :key="colName"
        :slot="colName"
        slot-scope="props"
        :class="[ 'cell', `col-${colName}`, getColumnValidateClass(props, props.row.domain, colName) ]"
        v-html="getColumnValue(props.row, colName)"
      ></div>
    </v-client-table>
  </section>
</template>

<style lang="scss" src="./index.scss"></style>

<script>
import Toolbar from "~/components/Toolbar";
import SiteDetails from "~/components/SiteDetails";
import columnPresets from "~/assets/js/presets/columns.conf";
import _ from "lodash";

export default {
  components: { Toolbar, SiteDetails },
  data() {
    return {
      routerProcess: false,
      tests: this.$store.state.tests
    };
  },

  computed: {
    q() {
      return this.$store.state.q;
    },

    fields() {
      return this.$store.state.fields;
    },

    availableFields() {
      return this.$store.state.availableFields;
    },

    filteredSites() {
      return this.$store.state.filteredSites;
    },

    tableOptions() {
      console.log('perPage: ', this.filteredSites.length);
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

    pageTitle() {
      let title = ["viasite-projects"];
      if (this.q) title.push("q: " + this.q);
      if (this.fields.length > 0) title.push("fields: " + this.columns);
      return title.join(", ");
    }
  },

  watch: {
    q() {
      this.updateUrlQuery();

      // добавление колонок, которые есть в фильтре
      const parts = this.q.split("&");
      parts.forEach(part => {
        const match = part.match(/^[a-zA-Z0-9_]+/);
        if (match) this.addFieldByName(match[0]);
      });
    }
  },

  methods: {
    // переключает поле в таблице по клику
    toggleField(field, add) {
      this.$store.dispatch("toggleField", { field, add });
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
      columnNames = _.uniq(columnNames);
      columnNames.forEach(name => {
        const field = this.availableFields.find(field => field.name == name);
        fields.push(field);
      });
      this.$store.commit("fields", fields);
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

    // выдает класс валидации по домену сайта и имени колонки
    getColumnValidateClass(props, domain, column) {
      return this.$store.getters.getColumnValidateClass(props, domain, column);
    },

    getColumnValue(row, colName) {
      // достает значение colName из row, со вложенностью
      // https://stackoverflow.com/a/6394168/1716010
      let val = colName.split(".").reduce((o, i) => (o ? o[i] : ""), row);

      // шаблоны полей задаются здесь
      if (colName == "url") val = `<a href="${val}" target="_blank">${val}</a>`;
      if (colName == "favicon" && val) {
        val = val.replace(/^\//, row.url);
        // console.log('val: ', val);
        val = `<img style="width:16px;height:16px" src="${val}"/>`;
      }
      if (colName == "domain_idn") {
        let icon = row.favicon ? row.favicon.replace(/^\//, row.url) : "";
        val = '<a href="' + row.url + '" target="_blank">' +
          (icon ? `<img style="width:16px;height:16px" src="${icon}"/>` : "") +
          " " +
          val + '</a>'
          + '<a href="ssh://' + row.ssh_command.replace('ssh ', '') + '" class="ssh-link" title="Open SSH">&nbsp;</a>'
      }

      // TODO: draft
      if (colName == "vscode_link") {
        val = '<a href="' + val + '" target="_blank">Open in VS Code</a>';
      }

      // in domain_idn
      /* if (colName == "ssh_command") {
        val = '<a href="ssh://' + val.replace('ssh ', '') + '" target="_blank">Open SSH</a>';
      } */

      return val;
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
    this.$store.dispatch("sites", sitesJson.sites);
    if(!this.$route.query["q"]){
      this.$route.query["q"] = 'prod=1';
    }
    this.$store.dispatch("q", this.$route.query["q"]);

    this.fieldsInit();

    // router change event
    this.$router.afterEach((to, from) => {
      if (!this.routerProcess) {
        if (this.$route.query["q"]) {
          this.$store.dispatch("q", this.$route.query["q"]);
        } else this.$store.dispatch("q", "");

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
