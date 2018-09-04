<template>
  <section class="container">
    <div>
      <div>total: {{ sites.length }}</div>

      <div class="available-fields">
        <div :title="field.name" @click="toggleField(field)" :class="{ 'available-fields__field': true, active: fieldIndex(field) != -1 }" v-for="field in availableFields" :key="field.name">
          <input type="checkbox" :checked="fieldIndex(field) != -1">
          <label>{{ field.title }}
          </label>
        </div>
      </div>

      <v-client-table
        :columns="columns"
        :data="sitesData"
        :options="tableOptions"
      >
        <template slot="child_row" slot-scope="props">
          <ul class="site-details">
            <li v-for="(value, key, index) in props.row.site_info" :key="index">
              <b>{{ key }}:</b> {{ value }}
            </li>
          </ul>
        </template>
      </v-client-table>
    </div>
  </section>
</template>

<style>
#app {
  width: 95%;
  margin: 0 auto;
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
</style>

<script>
import _ from 'lodash';

export default {
  components: {},
  data() {
    return {
      q: '',
      sites: [],
      fields: [
        { name: 'domain_idn', title: 'Domain' },
        { name: 'host' },
        { name: 'site_info.engine', title: 'Engine' },
        { name: 'meta.year', title: 'Year' },
        { name: 'meta.visitors', title: 'Visitors' },
        { name: 'site_info.yandex_tcy', title: 'ТИЦ' },
        { name: 'site_info.files_size', title: 'Size' },
        { name: 'prod' },
        { name: 'error' }
      ]
    };
  },
  computed: {
    sitesData() {
      if (this.sites.length == 0) return [];
      return this.sites.map(site => {
        site.prod = site.prod ? 1 : 0;
        site.error = site.site_info && site.site_info.error ? 1 : 0;
        site.id = site.domain;
        if (
          site.engine != 'default' &&
          (!site.site_info || (site.site_info && !site.site_info.engine))
        ) {
          if (!site.site_info) site.site_info = {};
          site.site_info.engine = site.engine;
        }
        if (site.site_info) {
          if (site.site_info.files_size)
            site.site_info.files_size = parseInt(site.site_info.files_size);
        }
        return site;
      });
      /* const data = this.sites.map(site => {
        return {
          ...site,
          ...{
            id: site.domain
          }
        };
      });

      return { data }; */
    },

    tableOptions() {
      return {
        headings: this.headings,
        filterable: ['domain_idn'],
        perPage: this.sitesData.length,
        rowClassCallback(row) {
          if (!row.site_info) return 'warning';
          if (row.site_info && row.site_info.error) return 'danger';
          // return 'success';
        },
        templates: {
          'site_info.files_size'(h, row, index) {
            if (!row.site_info || !row.site_info.files_size) return '';
            return Math.round(row.site_info.files_size / 1024) || '';
          }
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

    availableFields() {
      const site = this.sites[0];
      let excludedFields = [
        // objects
        'site_info',
        'tests',
        'meta',
        // duplicates
        'engine',
        'meta.engine',
        'site_root',
        'server',
        'site_info.user',
        'site_info.domain',
        // not working
        'site_info.total_pages_load_time'
      ];
      let fields = [];

      for (let fieldName in site) {
        if (excludedFields.includes(fieldName)) continue;
        fields.push({
          name: fieldName,
          title: fieldName
        });
      }

      // site_info
      for (let fieldName in site.site_info) {
        let fieldPath = `site_info.${fieldName}`;
        if (excludedFields.includes(fieldPath)) continue;
        fields.push({
          name: fieldPath,
          title: fieldName
        });
      }

      // meta
      for (let fieldName in site.meta) {
        let fieldPath = `meta.${fieldName}`;
        console.log('fieldPath: ', fieldPath);
        if (excludedFields.includes(fieldPath)) continue;
        fields.push({
          name: fieldPath,
          title: fieldName
        });
      }

      return fields;
    }
  },

  async asyncData({ app }) {
    const sites = await app.$axios.$get(
      'https://dev.viasite.ru/viasite-projects/site-info/sites.json'
    );
    return { sites };
  },

  methods: {
    fieldIndex(field) {
      return this.fields.findIndex(column => {
        return column.name == field.name;
      });
    },

    toggleField(field) {
      let index = this.fieldIndex(field);
      if (index != -1) this.fields.splice(index, 1);
      else this.fields.push(field);
    }
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>

