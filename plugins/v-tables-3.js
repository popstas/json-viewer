import { ServerTable, ClientTable, EventBus } from "v-tables-3";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ClientTable);
});
