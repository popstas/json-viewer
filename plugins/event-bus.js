// https://dev.to/israelortuno/event-bus-pattern-in-nuxt-3-with-full-typescript-support-1okp
import mitt from "mitt";

export default defineNuxtPlugin(() => {
  const emitter = mitt();

  return {
    provide: {
      event: emitter.emit, // Will emit an event
      listen: emitter.on, // Will register a listener for an event
    },
  };
});
