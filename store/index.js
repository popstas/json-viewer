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
  name: pjson.name,
  version: pjson.version,
  description: pjson.description,
  homepage: pjson.homepage,

  // app state

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
};

export const mutations = {
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
  }
};

export const strict = true;
