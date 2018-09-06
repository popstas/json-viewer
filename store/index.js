import pjson from '~/package.json';
import dateformat from 'dateformat';

export const state = () => ({
  // data
  sites: [],
  tests: [], // объявления тестов
  filteredSites: [],

  // constants
  sitesJsonUrl: 'https://dev.viasite.ru/viasite-projects/site-info/sites.json',
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
  // site_info.engine:bitrix cron:0
  filterSites({ commit, state }, payload) {
    const q = state.filter.q.toLowerCase();
    let filters = q.split(' ');
    let filteredSites = state.sites;

    for (let fid in filters) {
      const [name, value] = filters[fid].split(':');

      filteredSites = filteredSites.filter(site => {
        const [parent, child] = name.split('.');
        if (child) return site[parent] && site[parent][child] == value;
        else return site[name] == value;
        // console.log('site: ', site.domain, site[name], site[name] == value);
      });
    }
    commit('filteredSites', filteredSites);
  }
};

export const strict = true;
