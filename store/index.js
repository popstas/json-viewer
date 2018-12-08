import pjson from '~/package.json';
import jsonQuery from 'json-query';
import dateformat from 'dateformat';

export const state = () => ({
  // data
  sites: [],
  tests: [], // объявления тестов
  filteredSites: [],

  // constants
  sitesJsonUrl: 'https://dev.viasite.ru/viasite-projects/site-info/sites.json',
  // sitesJsonUrl: 'https://dev.viasite.ru/viasite-projects/sites.json',
  // sitesJsonUrl: 'https://test.home.popstas.ru/sites.json',
  name: pjson.name,
  version: pjson.version,
  description: pjson.description,
  homepage: pjson.homepage,

  // app state
  fields: [],

  // filters
  filter: {
    q: ''
  }
});

export const getters = {
  /* lastUpdated(state) {
    let date = Math.max.apply(Math, state.songs.map(song => new Date(song.created)));
    return dateformat(new Date(date), 'dd.mm.yyyy');
  } */
  fieldIndex(state) {
    return field => {
      return state.fields.findIndex(column => {
        return field && column.name == field.name;
      });
    };
  },
  fieldExists(state, getters) {
    return field => {
      // return getters.fieldIndex(field) != -1;
      // console.log('getters.fieldIndex(field): ', getters.fieldIndex(field));
      return getters.fieldIndex(field) != -1;
    };
  }
};

export const mutations = {
  fields(state, newValue) {
    state.fields = newValue;
  },
  sites(state, newValue) {
    state.sites = newValue;
    state.filteredSites = newValue;
  },
  tests(state, newValue) {
    state.tests = newValue;
  },
  filteredSites(state, newValue) {
    state.filteredSites = newValue;
  },
  // q, withChords, withTexts, sortByDate
  changeFilter(state, options) {
    state.filter[options.name] = options.value;
  },

  addField(state, field) {
    state.fields.push(field);
  },

  removeFieldByIndex(state, index) {
    state.fields.splice(index, 1);
  }
};

export const actions = {
  // фильтрует sites на основе filter
  filterSites({ commit, state }, payload) {
    const q = state.filter.q.toLowerCase();
    let filteredSites = [];

    // empty query
    if (q == '') filteredSites = state.sites;

    // json-query
    // регулярка отсекает значения, которые могут быть именами полей
    // запросы с ':' фильтруются, т.к. json-query выдает фигню и для совместимости с custom format
    if (filteredSites.length == 0 && !q.match(/^[a-z0-9_]+$/) && q.indexOf(':') === -1) {
      try {
        const res = jsonQuery('data[*' + q + ']', {
          data: { data: state.sites },
          allowRegexp: true
        });
        filteredSites = res.value;

        // normalize to array
        if (!filteredSites) filteredSites = [];
        /* if (typeof filteredSites === 'object' && !obj instanceof Array){ // for single result
          filteredSites = [filteredSites];
        } */
      } catch (e) {
        // console.log(`failed to filter json-query data${q}`, e);
      }
      // console.log('filteredSites after json-query: ', filteredSites);
    }

    // custom format:
    // site_info.engine:bitrix cron:0
    if (filteredSites.length == 0) {
      // console.log('custom search');
      let filters = q.split(' ');
      filteredSites = state.sites;
      let errors = 0;
      for (let fid in filters) {
        const [name, value] = filters[fid].split(':');
        if (!value) {
          errors++;
          // console.log('error: ', filters[fid] + ' not valid filter');
          break;
        }

        const [parent, child] = name.split('.');

        filteredSites = filteredSites.filter(site => {
          if (child) return site[parent] && site[parent][child] == value;
          else return site[name] == value;
          // console.log('site: ', site.domain, site[name], site[name] == value);
        });
        // console.log('filteredSites after ' + filters[fid] + ': ', filteredSites);
      }

      if (errors > 0) filteredSites = [];
    }

    commit('filteredSites', filteredSites);
  },

  // переключает поле в таблице, через нее проходят все изменения полей
  toggleField({ commit, getters }, { field, add }) {
    if (!field) return;
    let index = getters.fieldIndex(field);
    if (index != -1 && !add) {
      commit('removeFieldByIndex', index);
    } else {
      commit('addField', field);
    }
  }
};

export const strict = true;
