import createPersistedState from 'vuex-persistedstate';

export default ({store}) => {
  createPersistedState({
    paths: [
      'itemsJsonUrl',
      'jsonUrlHistory',
      'scanHistory',
      'scanUrlHistory',
      'visitCount',
      'openGroups',
      'showHumanColumns',
      'currentJsonSort',
      'displayMode',
      'uid',
      'lastConnectionId',
      'url',
      'urls',
      'args',
      'serverUrl',
      'log',
      'scanPresets',
    ],
  })(store);
};
