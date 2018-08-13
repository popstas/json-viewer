<template>
  <section class="container">
    <div>
        <!-- :api-mode="false"
        :data="sitesData" -->
      <div>total: {{ sites.length }}</div>
      <vuetable ref="vuetable"
        :api-mode="false"
        :data="sitesData"
        :fields="columns"
        :data-manager="dataManager"
        pagination-path=""
      >

      </vuetable>
    </div>
  </section>
</template>

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
      return { data: this.sites };
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

    columns() {
      return [
        { name: 'domain_idn', sortField: 'domain_idn', title: 'Domain' },
        { name: 'host', sortField: 'host' },
        { name: 'site_root', sortField: 'site_root', title: 'Root path' },
        { name: 'site_info.engine', sortField: 'site_info.engine', title: 'Engine' },
        { name: 'prod', sortField: 'prod' }
        // { name: 'site_info', title: 'site-info' }
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

