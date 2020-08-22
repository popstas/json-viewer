import createPersistedState from 'vuex-persistedstate';

export default ({ store }) => {
  createPersistedState({
    paths: ['itemsJsonUrl', 'jsonUrlHistory', 'openGroups']
  })(store);
};
