import createPersistedState from 'vuex-persistedstate';

export default ({store}) => {
  createPersistedState({
    paths: [
      'itemsJsonUrl',
      'jsonUrlHistory',
      'visitCount',
      'openGroups',
      'showHumanColumns',
      'currentJsonSort',
      'uid',
      'url',
      'args',
      'serverUrl'],
  })(store);
};
