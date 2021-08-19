/* eslint-disable */

EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
};

function addListener(emitter, event, fn, context, once) {
    // ...

    const listener = new EE(fn, context || emitter, once);
    const evt = prefix ? prefix + event : event;

    // sprite 上还没有绑定同类事件
    if (!emitter._events[evt]) {
        emitter._events[evt] = listener;
        emitter._eventsCount++;
    } else if (!emitter._events[evt].fn) {
    // 第三次及以后绑定同名事件
        emitter._events[evt].push(listener);
    } else {
    // 第二次绑定同名事件
        emitter._events[evt] = [emitter._events[evt], listener];
    }

    return emitter;
}

function EE(fn, context, once) {
    // 事件处理函数
    this.fn = fn;
    // 上下文
    this.context = context;
    // 是否只触发一次
    this.once = once || false;
}

