import createPersistedState from 'vuex-persistedstate';

export default ({ store }) => {
  createPersistedState({
    paths: ['sitesJsonUrl']
  })(store);
};
