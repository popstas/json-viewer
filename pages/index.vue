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
  position: relative;

  .cell {
    padding: 8px;

    &.colored {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

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
</style>

<script>
import _ from 'lodash';
import moment from 'moment';

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
        },
        pagespeed_performance: {
          name: 'pagespeed_performance',
          columns: [
            'domain_idn',
            'host',
            'prod',
            'engine',
            'errors',
            'lighthouse_performance',
            'lighthouse_interactive',
            'lighthouse_speed_index',
            'lighthouse_first_contentful_paint',
            'lighthouse_first_cpu_idle',
            'lighthouse_first_meaningful_paint',
            'lighthouse_input_latency'
          ]
        },
        pagespeed_score: {
          name: 'pagespeed_score',
          columns: [
            'domain_idn',
            'host',
            'prod',
            'engine',
            'errors',
            'lighthouse_performance',
            'lighthouse_pwa',
            'lighthouse_accessibility',
            'lighthouse_best_practices',
            'lighthouse_seo'
          ]
        },
        https: {
          name: 'https',
          columns: ['domain_idn', 'https', 'email']
        }
      },
      filterPresets: [
        {
          name: 'bitrix',
          q: 'engine=bitrix&prod=1'
        },
        {
          name: 'drupal',
          q: 'engine=drupal&prod=1'
        },
        {
          name: 'without cron',
          q: 'engine=drupal&prod=1&cron=0'
        },
        {
          name: 'without git',
          q: 'prod=1&git=0'
        },
        {
          name: 'dirty git',
          q: 'prod=1&git=1&git_clean=0'
        },
        {
          name: 'h1 > 1',
          q: 'h1_count>1&prod=1'
        },
        {
          name: 'without https',
          q: 'https=0&prod=1'
        },
        {
          name: 'drupal without cache',
          q: 'engine=drupal&prod=1&cache=0&boost=0'
        },
        {
          name: 'drupal without js min',
          q: 'engine=drupal&prod=1&preprocess_js=0'
        }
      ],
      routerProcess: false
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
    },

    pageTitle() {
      let title = ['viasite-projects'];
      if (this.q) title.push('q: ' + this.q);
      if (this.fields.length > 0) title.push('fields: ' + this.columns);
      return title.join(', ');
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
    _toggleField(field) {
      if (!field) return;
      let index = this.fieldIndex(field);
      if (index != -1) this.fields.splice(index, 1);
      else this.fields.push(field);
    },

    // переключает поле в таблице по клику
    toggleField(field) {
      this._toggleField(field);
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
      query.fields = this.columns.join(',');
      this.$router.push({ query });
    },

    // переключить поле по имени
    toggleFieldByName(name) {
      const field = this.availableFields.find(field => field.name == name);
      this._toggleField(field);
    },

    // устанавливает поля по массиву имен, сбрасывает предыдущие выбранные поля
    setFields(columnNames) {
      this.fields = [];
      columnNames.forEach(name => {
        this.toggleFieldByName(name);
      });
      this.updateUrlQuery();
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
      const sitesData = sites.map(s => {
        let site = { ...s };
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
          if (i == 'updated_time') site[i] = moment.unix(site[i]).format('YYYY-MM-DD HH:mm:ss');
        }
        delete site.site_info;

        // flatten meta
        for (let i in site.meta) {
          site['meta_' + i] = site.meta[i];
        }
        delete site.meta;

        // flatten lighthouse
        if (site.lighthouse) {
          // console.log(site.lighthouse);
          for (let i in site.lighthouse) {
            // вложенный объект
            if(i == 'scores'){
              for (let s in site.lighthouse.scores){
                const ln = 'lighthouse_' + s.split('-').join('_');
                site[ln] = site.lighthouse.scores[s];
              }
            } else {
              const ln = 'lighthouse_' + i.split('-').join('_');
              site[ln] = site.lighthouse[i];
            }
          }
          delete site.lighthouse;
        }

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
      let result;
      if (!site || !site.tests) return '';

      // пустые не валидируются
      if([undefined, ''].indexOf(site[column]) !== -1) return '';

      // проверяет, попадает ли значение под лимиты
      const isFits = (value, rules) => {
        let valid = true;
        if('max' in rules && value > rules.max) return false;
        if('min' in rules && value < rules.min) return false;
        return true;
      };

      // validate map
      const validateMap = {
        lighthouse_interactive: {
          warn: { min: 3000, max: 8000 }, // ps: 3900 warn
          error: { min: 8001 }
        },
        lighthouse_speed_index: {
          warn: { min: 3500, max: 8000 }, // ps: 3200 ok, 3900 warn, 8500 fail
          error: { min: 8001 }
        },
        lighthouse_first_contentful_paint: {
          warn: { min: 3000, max: 5000 }, // ps: 2400 warn, lh: 2700 ok
          error: { min: 5001 }
        },
        lighthouse_first_cpu_idle: {
          warn: { min: 3000, max: 5000 },
          error: { min: 5001 }
        },
        lighthouse_first_meaningful_paint: {
          warn: { min: 2000, max: 4999 }, // ps: 5000 fail
          error: { min: 5000 }
        },
        lighthouse_input_latency: {
          warn: { min: 50, max: 100 },
          error: { min: 101 }
        },
        lighthouse_performance: {
          warn: { min: 50, max: 79 },
          error: { max: 50 }
        },
        lighthouse_pwa: {
          warn: { min: 50, max: 79 },
          error: { max: 50 }
        },
        lighthouse_accessibility: {
          warn: { min: 50, max: 79 },
          error: { max: 50 }
        },
        lighthouse_best_practices: {
          warn: { min: 50, max: 79 },
          error: { max: 50 }
        },
        lighthouse_seo: {
          warn: { min: 50, max: 79 },
          error: { max: 50 }
        }
      };

      if (column in validateMap) {
        const r = validateMap[column];
        if ('error' in r && isFits(site[column], r.error)) result = 'fail';
        else if ('warn' in r && isFits(site[column], r.warn)) result = 'warn';
        else result = 'pass';
      }

      if (!result) {
        const test = site.tests.find(test => test.name == column);
        if (!test || !test.valid) return '';
        result = test.valid;
      }

      if (!result) return;

      // console.log('props: ', props);
      // console.log('domain: ', domain);
      // console.log('column: ', column);

      const validClassesMap = {
        pass: 'success',
        warn: 'warning',
        fail: 'danger'
      };
      return 'colored ' + validClassesMap[result] + ' ' + result || 'noclass-' + result;
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
    // filter init
    if (this.$route.query['q']) this.q = this.$route.query['q'];

    // data init
    const sitesJson = await this.$axios.$get(this.$store.state.sitesJsonUrl);
    const sitesData = this.sitesProcessing(sitesJson.sites);
    this.$store.commit('tests', sitesJson.tests);
    this.$store.commit('sites', sitesData);
    this.$store.dispatch('filterSites');

    // fields init
    if (this.$route.query['fields']) {
      this.setFields(this.$route.query['fields'].split(','));
    } else {
      this.setPreset(this.columnPresets.default);
    }

    // router change event
    this.$router.afterEach((to, from) => {
      if (!this.routerProcess) {
        if (this.$route.query['q']) this.q = this.$route.query['q'];
        else this.q = '';

        if (this.$route.query['fields']) {
          this.setFields(this.$route.query['fields'].split(','));
        } else {
          this.setPreset(this.columnPresets.default);
        }
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
