import init, { mount } from './lib/q23rp98u.js';
const storageState = localStorage.getItem('state');
const initialState = storageState
    ? JSON.parse(storageState)
    : {
        running: undefined,
        tasks: [],
        summary: 0,
    };
const { map, pub, sub, h, el, text } = init(initialState);
let counter = 0;
const INCR = pub(['tasks', 'summary'], (state) => {
    const active = state.tasks.filter(task => task.selected);
    const tasks = state.tasks.map(task => task.selected
        ? { ...task, time: task.time + 1 / active.length }
        : task);
    const newActive = state.tasks.filter(task => task.selected);
    return {
        ...state,
        tasks,
        summary: newActive.reduce((acc, task) => acc + task.time + 1 / newActive.length, 0),
    };
});
const SAVE = pub([], (state) => {
    localStorage.setItem('state', JSON.stringify(state));
    return state;
});
const STOP_START = pub(['running'], (state) => {
    const active = state.tasks.filter(t => t.selected);
    const running = active.length === 0
        ? state.running
        : state.running
            ? clearInterval(state.running)
            : setInterval(INCR, 1000);
    return { ...state, running };
});
const ADD_TASK = (title) => pub(['summary', 'tasks'], (state) => {
    const tasks = [
        {
            title,
            time: 0,
            active: false,
            key: Math.floor(Math.random() * 1000),
            editing: false,
            selected: false,
        },
        ...state.tasks,
    ];
    const active = tasks.filter(task => task.selected);
    localStorage.setItem('state', JSON.stringify({
        ...state,
        tasks,
        summary: active.reduce((acc, task) => acc + task.time, 0),
    }));
    return title !== ''
        ? ({
            ...state,
            tasks,
            summary: active.reduce((acc, task) => acc + task.time, 0),
        })
        : state;
});
const CHANGE_TITLE = (key, title) => pub(['tasks'], (state) => {
    return {
        ...state,
        tasks: state.tasks.map(t => t.key === key
            ? {
                ...t,
                title
            }
            : t)
    };
});
const TOGGLE_SELECT_ALL = pub(['tasks'], (state) => ({
    ...state,
    tasks: state.tasks.some(task => !task.selected)
        ? state.tasks.map(task => task.selected ? task : { ...task, selected: true })
        : state.tasks.map(task => !task.selected ? task : { ...task, selected: false }),
}));
const SET_SELECTED = (key) => pub(['tasks', 'summary', 'running'], (state) => {
    const tasks = state.tasks.map(task => task.key !== key ? task : { ...task, selected: !task.selected });
    const active = tasks.filter(task => task.selected);
    return {
        ...state,
        tasks,
        running: active.length === 0 ? clearInterval(state.running) : state.running,
        summary: active.reduce((acc, task) => acc + task.time, 0),
    };
});
const DELETE = pub(['tasks'], (state) => {
    return {
        ...state,
        running: clearInterval(state.running),
        tasks: state.tasks.filter(task => !task.selected),
    };
});
setInterval(SAVE, 1000 * 60);
const classNames = obj => Object.entries(obj)
    .filter(([key, value]) => value)
    .map(([key]) => key)
    .join(' ');
const secsToTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const zero = seconds % 60 < 10 ? '0' : '';
    return `${mins}:${zero}${secs}`;
};
const Summary = el((summary, running) => h('h1', {
    className: classNames({
        summary: true,
        running: running !== undefined,
    }),
}, secsToTimer(summary)));
const Head = h('div', {
    className: 'header',
    onclick: STOP_START,
}, Summary);
const EditableTitle = (task) => h('span', {
    className: 'title',
    contentEditable: task.editing,
    onblur: e => {
        e.preventDefault();
        e.stopPropagation();
        e.target.contentEditable = 'false';
        CHANGE_TITLE(task.key, e.target.innerHTML)();
    },
    onkeydown: e => {
        if (e.key === 'Enter') {
            console.log('enter');
            e.preventDefault();
            e.stopPropagation();
            e.target.contentEditable = 'false';
            CHANGE_TITLE(task.key, e.target.innerHTML)();
        }
        else if (e.key === 'Escape') {
            console.log('enter');
            e.preventDefault();
            e.stopPropagation();
            e.target.innerText = task.title;
            e.target.contentEditable = 'false';
        }
    }
}, `${task.title}`);
const Tsk = (task) => {
    const editing = EditableTitle(task);
    return h('div', {
        key: task.key,
        className: classNames({
            task: true,
            selected: task.selected,
        }),
        onclick: e => {
            e.stopPropagation();
            SET_SELECTED(task.key)();
        },
    }, h('div', {
        className: 'edit',
        onclick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            editing.contentEditable = 'true';
            editing.focus();
        }
    }, '...'), editing, h('b', { className: 'time' }, `${secsToTimer(task.time)}`));
};
const Tasks = h('div', { className: 'tasks' }, ...map((tasks) => Tsk(tasks)));
const Input = h('input', {
    className: 'input',
    onkeydown: e => {
        if (e.keyCode === 13) {
            ADD_TASK(e.target.value)();
            e.target.value = '';
        }
    }
});
const ToggleSelectAll = h('div', {
    className: 'unselect btn',
    onclick: TOGGLE_SELECT_ALL,
}, 'Toggle select all');
const DeleteSelected = h('div', {
    className: 'delete btn',
    onclick: DELETE,
}, 'Delete selected');
const Panel = h('div', { className: 'panel' }, Input, h('div', { className: 'btns' }, ToggleSelectAll, DeleteSelected));
const app = h('div', { id: 'app' }, Head, Tasks, Panel);
mount(app, '#root');
//# sourceMappingURL=index.js.map