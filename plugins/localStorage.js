import createPersistedState from 'vuex-persistedstate';

export default ({store}) => {
  createPersistedState({
    paths: [
      'itemsJsonUrl',
      'jsonUrlHistory',
      'scanUrlHistory',
      'visitCount',
      'openGroups',
      'showHumanColumns',
      'currentJsonSort',
      'displayMode',
      'uid',
      'url',
      'urls',
      'args',
      'serverUrl',
      'log'],
  })(store);
};
