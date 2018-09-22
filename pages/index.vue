<template>
  <section class="container">
    <div>
      <div>total: {{ filteredSites.length }}</div>

      <div class="available-fields">
        <div :title="field.name + (field.comment ? ` \n${field.comment}` : '') + (field.command ? ` \n${field.command}` : '')" @click="toggleField(field)"
          :class="{ 'available-fields__field': true, active: fieldIndex(field) != -1 }"
          v-for="field in availableFields" :key="field.name"
        >
          <input type="checkbox" :checked="fieldIndex(field) != -1">
          <label>{{ field.title }}
          </label>
        </div>
      </div>

      <input class="filter__query" placeholder="query" v-model="q" autofocus title="Например:
      engine:bitrix prod:1"/>

      <div class="filter-presets">
        filters:
        <button
          v-for="preset in filterPresets" :key="preset.name"
          @click="q = preset.q" v-html="preset.name"></button>
      </div>

      <div class="column-presets">
        columns:
        <button
          v-for="preset in columnPresets" :key="preset.name"
          @click="setPreset(preset);" v-html="preset.name"></button>
      </div>

      <v-client-table v-if="filteredSites.length > 0"
        :columns="columns"
        :data="filteredSites"
        :options="tableOptions"
      >
        <template slot="child_row" slot-scope="props">
          <ul class="site-details">
            <li v-if="typeof value != 'object'" v-for="(value, key, index) in props.row" :key="index">
              <b>{{ key }}:</b> {{ value }}
            </li>
          </ul>
        </template>

        <!-- для каждой колонки создается слот, который получает класс и значение через функции, медленно -->
        <div v-for="colName in columns" :key="colName"
          :slot="colName" slot-scope="props"
          :class="[ 'cell', getColumnValidateClass(props, props.row.domain, colName) ]"
          v-html="getColumnValue(props.row, colName)"
        ></div>
      </v-client-table>

      <div>{{ $store.state.name }} {{ $store.state.version }}</div>
    </div>
  </section>
</template>

<style lang="scss">
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.filter {
  &__query {
    padding: 5px;
    width: 600px;
  }
}
.VuePagination {
  text-align: center;
}

.vue-title {
  text-align: center;
  margin-bottom: 10px;
}

.vue-pagination-ad {
  text-align: center;
}

.glyphicon.glyphicon-eye-open {
  width: 16px;
  display: block;
  margin: 0 auto;
}

.available-fields {
  margin: 0 auto;
  text-align: left;
  columns: 4;
  max-width: 1140px;
}
.available-fields__field {
  opacity: 0.7;
}
.available-fields__field.active {
  opacity: 1;
}
.available-fields__field label {
  font-weight: normal;
  margin-left: 5px;
}

th:nth-child(3) {
  text-align: center;
}
th.VueTables__sortable {
  cursor: pointer;
  user-select: none;
}
.VueTables__sort-icon {
}

.VueTables__child-row {
  text-align: left;
}

.VueTables__child-row-toggler {
  width: 16px;
  height: 16px;
  line-height: 16px;
  display: block;
  margin: auto;
  text-align: center;
  cursor: pointer;
}

.VueTables__child-row-toggler--closed::before {
  content: '+';
}

.VueTables__child-row-toggler--open::before {
  content: '-';
}

.VueTables__table td {
  padding: 0 !important;

  .cell {
    padding: 8px;

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
</style>

<script>
import _ from 'lodash';

export default {
  components: {},
  data() {
    return {
      q: '',
      fields: [],
      columnPresets: {
        default: {
          name: 'default',
          columns: [
            'domain_idn',
            'host',
            'prod',
            'engine',
            'meta_year',
            'meta_visitors',
            'yandex_tcy',
            'files_size',
            'errors'
          ]
        },
        cron: {
          name: 'cron',
          columns: ['domain_idn', 'host', 'prod', 'cron']
        },
        bitrix: {
          name: 'bitrix',
          columns: [
            'domain_idn',
            'host',
            'prod',
            'email',
            'engine_version',
            'bitrix_image_quality',
            'bitrix_total_mark_value',
            'files_count',
            'files_size',
            'git_clean',
            'yandex_tcy',
            'h1_count'
          ]
        }
      },
      filterPresets: [
        {
          name: 'bitrix',
          q: 'engine:bitrix prod:1'
        },
        {
          name: 'without cron',
          q: 'engine:drupal prod:1 cron:0'
        },
        {
          name: 'without git',
          q: 'prod:1 git:0'
        },
        {
          name: 'h1 > 1',
          q: 'h1_count>1'
        }
      ]
    };
  },

  computed: {
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
        filterable: ['domain_idn'],
        perPage: this.filteredSites.length,
        rowClassCallback(row) {
          if (row.error) return 'danger';
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

    headings() {
      let h = {};
      this.fields.forEach(field => {
        h[field.name] = field.title || field.name;
      });
      return h;
    },

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
        'id',
        'tests',
        // duplicates
        'meta_engine',
        'meta_screenshots',
        'meta_prod',
        'site_root',
        // not working
        'total_pages_load_time',
        'result',
        'max_result',
        'result_percent'
      ];

      let fields = [];
      let fieldPaths = [];

      for (let siteInd in this.filteredSites) {
        let site = this.filteredSites[siteInd];

        // раньше из некоторых вложенных объектов доставались поля,
        // теперь они прессуются в одномерный объект
        let objs = {
          '': site
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
    }
  },

  watch: {
    q(val) {
      this.debouncedQueryChangeAction();
    }
  },

  methods: {
    queryChangeAction() {
      this.updateUrlQuery();
      this.changeFilter('q', this.q);
    },

    // переключает поле в таблице, через нее проходят все изменения полей
    toggleField(field) {
      if (!field) return;
      let index = this.fieldIndex(field);
      if (index != -1) this.fields.splice(index, 1);
      else this.fields.push(field);
      this.updateUrlQuery();
    },

    // обновляет выбранные фильтры и колонки в урле
    updateUrlQuery() {
      let query = {};
      if (this.q) query.q = this.q;
      query.fields = this.columns.join(',');
      this.$router.push({ query });
    },

    // переключить поле по имени
    toggleFieldByName(name) {
      const field = this.availableFields.find(field => field.name == name);
      this.toggleField(field);
    },

    // устанавливает поля по массиву имен, сбрасывает предыдущие выбранные поля
    setFields(columnNames) {
      this.fields = [];
      columnNames.forEach(name => {
        this.toggleFieldByName(name);
      });
    },

    // поставить из пресета полей
    setPreset(preset) {
      this.setFields(preset.columns);
    },

    changeFilter(name, value) {
      this.$store.commit('changeFilter', { name, value });
      this.$store.dispatch('filterSites');
      // this.$emit('changeFilter', { name, value });
    },

    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return field && column.name == field.name;
      });
    },

    // дополняет колонки sites.json
    sitesProcessing(sites) {
      if (!sites) return [];
      const sitesData = sites.map(site => {
        // should be before site_info flatten
        if (
          site.engine != 'default' &&
          (!site.site_info || (site.site_info && !site.site_info.engine))
        ) {
          if (!site.site_info) site.site_info = {};
          site.site_info.engine = site.engine;
        }

        // flatten site_info
        for (let i in site.site_info) {
          site[i] = site.site_info[i];
          if (i == 'files_size') site[i] = Math.round(site[i] / 1024);
        }
        delete site.site_info;

        // flatten meta
        for (let i in site.meta) {
          site['meta_' + i] = site.meta[i];
        }
        delete site.meta;

        site.prod = site.prod ? 1 : 0;
        site.https = site.https ? 1 : 0;
        site.errors = site.error ? 1 : 0;
        site.id = site.domain;
        return site;
      });
      return sitesData;
    },

    // выдает класс валидации по домену сайта и имени колонки
    getColumnValidateClass(props, domain, column) {
      const site = this.filteredSites.find(site => site.domain == domain);
      if (!site || !site.tests) return '';

      const test = site.tests.find(test => test.name == column);
      if (!test) return '';

      // console.log('props: ', props);
      // console.log('domain: ', domain);
      // console.log('column: ', column);

      const validClassesMap = {
        pass: 'success',
        warn: 'warning',
        fail: 'danger'
      };
      return validClassesMap[test.valid] + ' ' + test.valid || 'noclass-' + test.valid;
      return 'success';
    },

    // достает значение colName из row, со вложенностью
    // https://stackoverflow.com/a/6394168/1716010
    getColumnValue(row, colName) {
      return colName.split('.').reduce((o, i) => (o ? o[i] : ''), row);
    }
  },

  created() {
    this.debouncedQueryChangeAction = _.debounce(this.queryChangeAction, 500);
  },

  async mounted() {
    if (this.$route.query['q']) this.q = this.$route.query['q'];

    const sitesJson = await this.$axios.$get(this.$store.state.sitesJsonUrl);
    const sitesData = this.sitesProcessing(sitesJson.sites);
    this.$store.commit('tests', sitesJson.tests);
    this.$store.commit('sites', sitesData);
    this.$store.dispatch('filterSites');
    if (this.$route.query['fields']) {
      this.setFields(this.$route.query['fields'].split(','));
    } else {
      this.setPreset(this.columnPresets.default);
    }
  }
};
</script>
