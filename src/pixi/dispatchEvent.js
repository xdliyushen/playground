/* eslint-disable */
InteractionManager.prototype.dispatchEvent = function (displayObject, eventString, eventData) {
    // todo stopPropagationHint stopsPropagatingAt 这两个属性是何时被创建的？？
    if (!eventData.stopPropagationHint || displayObject === eventData.stopsPropagatingAt) {
        eventData.currentTarget = displayObject;
        eventData.type = eventString;

        // 触发所有通过 on 绑定的同名事件
        // 详解见下
        displayObject.emit(eventString, eventData);

        // 触发直接通过属性绑定的事件
        if (displayObject[eventString]) {
            displayObject[eventString](eventData);
        }
    }
};

// 触发所有通过 on 绑定的同名事件
// 要手动触发 sprite 上的事件，可以通过 sprite.emit 触发，sprite.emit 最终指向的就是这个函数。a1-a5 都是可以传入的额外参数。
// 在不手动触发事件的情况下，a1 为 event，a2-a5 无数据。
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt]
        , len = arguments.length
        , args
        , i;

    // 只绑定了一个同名事件处理函数
    if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

        switch (len) {
            case 1: return listeners.fn.call(listeners.context), true;
            case 2: return listeners.fn.call(listeners.context, a1), true;
            case 3: return listeners.fn.call(listeners.context, a1, a2), true;
            case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
        }

        listeners.fn.apply(listeners.context, args);
    } else {
    // 绑定了多个同名事件处理函数
        var length = listeners.length
            , j;

        for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

            switch (len) {
                case 1: listeners[i].fn.call(listeners[i].context); break;
                case 2: listeners[i].fn.call(listeners[i].context, a1); break;
                case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
                case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
                default:
                    if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                        args[j - 1] = arguments[j];
                    }

                    listeners[i].fn.apply(listeners[i].context, args);
            }
        }
    }

    return true;
};