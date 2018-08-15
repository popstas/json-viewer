<template>
  <section class="container">
    <div>
      <div>total: {{ sites.length }}</div>
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

th:nth-child(3) {
  text-align: center;
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
  content: "+";
}

.VueTables__child-row-toggler--open::before {
  content: "-";
}
</style>

<script>
import _ from 'lodash';

export default {
  components: {},
  data() {
    return {
      q: ''
    };
  },
  computed: {
    sitesData() {
      return this.sites.map(site => {
        site.prod = site.prod ? 1 : 0;
        site.id = site.domain;
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
        perPage: this.sitesData.length
      }
    },

    columns() {
      return this._fields.map(field => field.name);
    },

    headings() {
      let h = {};
      this._fields.forEach(field => {
        h[field.name] = field.title || field.name
      });
      return h;
    },

    _fields() {
      return [
        { name: 'domain_idn', title: 'Domain' },
        { name: 'host' },
        { name: 'site_info.engine', title: 'Engine' },
        { name: 'meta.year', title: 'Year' },
        { name: 'prod' }
      ];
    }
  },

  async asyncData({ app }) {
    const sites = await app.$axios.$get(
      'https://dev.viasite.ru/viasite-projects/site-info/sites.json'
    );
    return { sites };
  },

  methods: {
    dataManager(sortOrder, pagination) {
      console.log('dataManager: ', sortOrder, pagination);

      let data = this.sites;

      // account for search filter
      if (this.q) {
        // the text should be case insensitive
        let txt = new RegExp(this.q, 'i');

        // search on name, email, and nickname
        data = _.filter(data, function(item) {
          return (
            item.domain_idn.search(txt) >= 0 ||
            item.host.search(txt) >= 0 ||
            item.site_root.search(txt) >= 0
          );
        });
      }

      // sortOrder can be empty, so we have to check for that as well
      if (sortOrder.length > 0) {
        console.log('orderBy:', sortOrder[0].sortField, sortOrder[0].direction);
        data = _.orderBy(data, sortOrder[0].sortField, sortOrder[0].direction);
      }

      // since the filter might affect the total number of records
      // we can ask Vuetable to recalculate the pagination for us
      // by calling makePagination(). this will make VuetablePagination
      // work just like in API mode
      // pagination = this.$refs.vuetable.makePagination(data.length);

      // if you don't want to use pagination component, you can just
      // return the data array
      return {
        // pagination: pagination,
        // data: _.slice(data, pagination.from - 1, pagination.to)
        data
      };
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

