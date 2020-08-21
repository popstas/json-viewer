import createPersistedState from 'vuex-persistedstate';

export default ({ store }) => {
  createPersistedState({
    paths: ['itemsJsonUrl', 'openGroups']
  })(store);
};
