export default defineNuxtPlugin((nuxtApp) => {

  // if (process.env.NODE_ENV !== 'production') return;

  (function(m, e, t, r, i, k, a) {
    m[i] = m[i] || function() {
      (m[i].a = m[i].a || []).push(arguments);
    };
    m[i].l = 1 * new Date();
    k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
  })
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  const yandexMetrikaId = 66672205; // Extracted ID

  ym(yandexMetrikaId, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webVisor: true,
  });

  /* app.router.afterEach((to, from) => {
      ym(yandexMetrikaId, 'hit', to.fullPath);
  }) */

  // store.commit('setYandexMetrikaId', yandexMetrikaId); // Commit extracted ID to Vuex store
});
