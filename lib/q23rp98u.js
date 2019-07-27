export const docFn = str => document[str].bind(document), q = docFn('querySelector'), c = docFn('createElement'), t = docFn('createTextNode');
const insertAfter = (oldEl, newEl) => oldEl.parentNode.insertBefore(newEl, oldEl.nextSibling);
const camelToDot = (str) => str.split('_');
const getArgs = (fn) => ('' + fn).match(/(\(|^)(?<a>.+?)[=\)]/).groups['a'].trim().split(', ');
const notIn = (arr) => (item) => !arr.some(i => i.key === item.key);
const getIn = (arr, key) => arr.find(i => i.key === key);
const options = {
    'object': (obj, el) => el.appendChild(obj),
    'string': (str, el) => options['object'](t(str), el),
};
const copyObject = (obj) => JSON.parse(JSON.stringify(obj));
export const mount = (el, selector) => q(selector).appendChild(el);
export const h = (name, attrs = {}, ...children) => {
    const { style, ...restAttrs } = attrs;
    const el = Object.assign(c(name), restAttrs);
    Object.assign(el.style, style);
    children.forEach(child => options[(typeof child)](child, el));
    return el;
};
const initPubSub = (callbacks, state) => ({
    sub: (keys, fn, unsub = false) => {
        fn.args = keys;
        const unsubscribe = () => keys.forEach(key => callbacks[key] = callbacks[key].filter(f => f !== fn));
        keys.forEach(key => {
            callbacks[key] = callbacks[key] || [];
            unsub
                ? unsubscribe()
                : callbacks[key].push(fn);
        });
        [...keys, 'ALL'].forEach(key => {
            (callbacks[key] || []).forEach(fn => {
                if (key === 'ALL') {
                    fn(state());
                }
                else {
                    fn(...(fn.args || [])
                        .map(arg => state(arg)));
                }
            });
        });
        return unsubscribe;
    },
    pub: (keys, fn) => () => {
        state(fn(state()));
        [...keys, 'ALL'].forEach(key => {
            (callbacks[key] || []).forEach(fn => {
                if (key === 'ALL') {
                    fn(state());
                }
                else {
                    fn(...(fn.args || [])
                        .map(arg => state(arg)));
                }
            });
        });
    }
});
const text = (state, sub) => (fn) => {
    const fnArgs = getArgs(fn);
    const textNode = t(fn(...fnArgs.map(arg => state(arg))));
    sub(fnArgs, (...stVals) => textNode.data = fn(...stVals));
    return textNode;
};
const defaultShouldUpdate = (pV, nV) => {
    const prev = JSON.stringify(pV);
    const n = JSON.stringify(nV);
    return JSON.stringify(pV) !== JSON.stringify(nV);
};
const el = (state, sub) => (fn, lifeCycle = { shouldUpdate: defaultShouldUpdate }) => {
    const fnArgs = getArgs(fn);
    lifeCycle.onCreate && lifeCycle.onCreate(...getArgs(lifeCycle.onCreate).map(arg => state(arg)));
    let currEl = fn(...fnArgs.map(arg => state(arg)));
    let prevVals = fnArgs.map(arg => state(arg));
    const subscription = (...stVals) => {
        if (!lifeCycle.shouldUpdate
            || lifeCycle.shouldUpdate && lifeCycle.shouldUpdate(prevVals, stVals)) {
            const newEl = fn(...stVals);
            currEl.replaceWith(newEl);
            currEl = newEl;
            lifeCycle.onUpdate && lifeCycle.onUpdate(...getArgs(lifeCycle.onUpdate).map(arg => state(arg)));
        }
        prevVals = [...stVals];
    };
    const unsub = sub(fnArgs, subscription);
    currEl.del = () => {
        lifeCycle.onRemove && lifeCycle.onRemove(...getArgs(lifeCycle.onRemove).map(arg => state(arg)));
        unsub();
        currEl.remove();
    };
    return currEl;
};
const getSetState = (initialState) => (value) => {
    return !value
        ? copyObject(initialState)
        : typeof value === 'string'
            ? camelToDot(value).reduce((acc, cur) => acc[cur], copyObject(initialState))
            : initialState = copyObject(value);
};
const map = (state, sub) => (fn, shouldUpdate = (pV, nV) => JSON.stringify(pV) !== JSON.stringify(nV)) => {
    const [fnArg] = getArgs(fn);
    let arr = state()[fnArg];
    const placeholder = c('div');
    console.log('placeholder', placeholder);
    let items = [placeholder].concat(...arr.map(fn));
    console.log('items', items);
    sub([fnArg], (...stVals) => {
        const newArr = state()[fnArg];
        const addedVals = newArr.filter(item => !!item && notIn(arr)(item));
        const removedVals = arr.filter(notIn(newArr));
        const oldWithoutRemoved = arr.filter(notIn(removedVals));
        const newWithoutAdded = newArr.filter(notIn(addedVals));
        const newItems = [];
        removedVals.forEach(val => {
            const deleted = getIn(items, val.key);
            deleted.del ? deleted.del() : deleted.remove();
        });
        newWithoutAdded.forEach((newVal, index) => {
            if (newVal.key === oldWithoutRemoved[index].key
                && !shouldUpdate(oldWithoutRemoved[index], newVal)) {
                newItems.push(getIn(items, newVal.key));
            }
            else {
                const newItem = fn(newVal);
                const oldItem = getIn(items, oldWithoutRemoved[index].key);
                insertAfter(oldItem, newItem);
                newItems.push(newItem);
                oldItem.del ? oldItem.del() : oldItem.remove();
            }
        });
        addedVals.forEach(newVal => {
            const newItem = fn(newVal);
            const indexOfAfter = newArr.findIndex(item => item.key === newVal.key) - 1;
            const prevVal = newArr[indexOfAfter];
            insertAfter(prevVal ? getIn(newItems, prevVal.key) : placeholder, newItem);
            newItems.push(newItem);
        });
        items = newItems.length > 0 ? newItems : [placeholder];
        arr = newArr;
    });
    console.log('items', items);
    return items;
};
const init = (initialState) => {
    const state = getSetState(initialState);
    const callbacks = {};
    const { pub, sub } = initPubSub(callbacks, state);
    return {
        sub,
        pub,
        text: text(state, sub),
        el: el(state, sub),
        map: map(state, sub),
        h,
    };
};
export default init;
//# sourceMappingURL=q23rp98u.js.map