(function (global) {
  'use strict';
  class EventCenter {
    constructor() {
      this.eventList = new Map();
    }
  }
 
  const proto = EventCenter.prototype; 

  class Listener {
    constructor(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
  }

  function addListener(eventCenter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new Error('fn must be a function');
    }

    let listener = new Listener(fn, context, once);
    if (!eventCenter.eventList.has(event)) {
      eventCenter.eventList.set(event, [listener]);
    } else {
      eventCenter.eventList.get(event).push(listener);
    }
    return eventCenter;
  }

  proto.on = function on(event, fn, context) {
    return addListener(this, event, fn, context);
  };

  proto.once = function on(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };

  proto.emit = function emit(event, ...arguments) {
    if (this.eventList.has(event)) {
      this.eventList.get(event).forEach((listener) => {
        listener.fn.apply(listener.context, arguments);
        if(listener.once) {
          this.removeListener(event, listener.fn, true);
        }
      });
    }
  };

  proto.getAllListeners = function getAllListeners(event) {
    if(this.eventList.has(event)) {
      return this.eventList.get(event).length !== 0 ? this.eventList.get(event) : [];
    } else {
      return [];
    }
  }

  proto.removeListener = function removeListener(event, fn, once = false) {
    if(!this.eventList.has(event)) return this;

    if(!fn) {
      if(this.eventList.has(event)) {
        this.eventList.delete(event);
      }
      return this;
    }

    let listeners = this.eventList.get(event);
    let len = listeners.length;
    if(len) {
      for(let i = 0; i< len; i++) {
        if(listeners[i].fn === fn && once) {
          listeners.splice(i, 1);
          if(listeners.length === 0) {
            this.eventList.delete(event);
          }
        }
      }
    }
    return this;
  }

  proto.removeAllListeners = function removeAllListeners(event) {
    if(!this.eventList.has(event)) return this;

    this.eventList.get(event).length = 0;
    this.eventList.delete(event);
    return this;
  }

  proto.getAllEventsNames = function getAllEventsNames() {
    return [...this.eventList.keys()];
  }

  proto.getEventsCount = function getEventsCount() {
    return this.eventList.size;
  }

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return EventCenter;
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = EventCenter;
  } else {
    exports.EventCenter = EventCenter;
  }
})(typeof window !== 'undefined' ? window : this || {});