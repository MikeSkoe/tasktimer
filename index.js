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
            key: Math.floor(Math.random() * 1000),
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
const EDIT = pub(['editing'], (state) => {
    const task = state.tasks.find(task => task.selected);
    return {
        ...state,
        editing: task ? task.key : undefined,
    };
});
const SUBMIT_EDIT = (title) => pub(['editing', 'tasks'], (state) => {
    const tasks = title.length > 0
        ? state.tasks.map(task => task.key === state.editing
            ? { ...task, title }
            : task)
        : state.tasks;
    return {
        ...state,
        tasks,
        editing: undefined,
    };
});
const DELETE = pub(['tasks', 'running', 'summary'], (state) => {
    return {
        ...state,
        running: clearInterval(state.running),
        tasks: state.tasks.filter(task => !task.selected),
        summary: 0,
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
const EditableTitle = (task) => h('span', { className: 'title' }, `${task.title}`);
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
    }, editing, h('span', { className: 'time' }, `${secsToTimer(task.time)}`));
};
const Tasks = h('div', { className: 'tasks' }, ...map((tasks) => Tsk(tasks)));
const Input = el((editing, tasks) => h('input', {
    className: 'input',
    onkeydown: e => {
        if (e.key === 'Enter') {
            const newTitle = e.target.value;
            e.target.value = '';
            if (editing) {
                SUBMIT_EDIT(newTitle)();
            }
            else {
                ADD_TASK(newTitle)();
            }
        }
        else if (e.key === 'Escape') {
            e.target.value = '';
            SUBMIT_EDIT('')();
        }
    },
    value: editing ? tasks.find(task => task.key === editing).title : '',
}), { shouldUpdate: ([prevEditing], [newEditing]) => {
        return prevEditing !== newEditing;
    } });
const ToggleSelectAll = h('div', {
    className: 'toggle-select btn',
    onclick: TOGGLE_SELECT_ALL,
    innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="459px" height="459px" viewBox="0 0 459 459" style="enable-background:new 0 0 459 459;" xml:space="preserve"> <g> <g id="select-all"> <path d="M0,51h51V0C22.95,0,0,22.95,0,51z M0,255h51v-51H0V255z M102,459h51v-51h-51V459z M0,153h51v-51H0V153z M255,0h-51v51h51    V0z M408,0v51h51C459,22.95,436.05,0,408,0z M51,459v-51H0C0,436.05,22.95,459,51,459z M0,357h51v-51H0V357z M153,0h-51v51h51V0z     M204,459h51v-51h-51V459z M408,255h51v-51h-51V255z M408,459c28.05,0,51-22.95,51-51h-51V459z M408,153h51v-51h-51V153z M408,357    h51v-51h-51V357z M306,459h51v-51h-51V459z M306,51h51V0h-51V51z M102,357h255V102H102V357z M153,153h153v153H153V153z"/> </g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg>'
});
const DeleteSelected = h('div', {
    className: 'delete btn',
    onclick: DELETE,
    innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"> <g> <g> <g> <polygon points="353.574,176.526 313.496,175.056 304.807,412.34 344.885,413.804    "/> <rect x="235.948" y="175.791" width="40.104" height="237.285"/> <polygon points="207.186,412.334 198.497,175.049 158.419,176.52 167.109,413.804    "/> <path d="M17.379,76.867v40.104h41.789L92.32,493.706C93.229,504.059,101.899,512,112.292,512h286.74     c10.394,0,19.07-7.947,19.972-18.301l33.153-376.728h42.464V76.867H17.379z M380.665,471.896H130.654L99.426,116.971h312.474     L380.665,471.896z"/> </g> </g> </g> <g> <g> <path d="M321.504,0H190.496c-18.428,0-33.42,14.992-33.42,33.42v63.499h40.104V40.104h117.64v56.815h40.104V33.42    C354.924,14.992,339.932,0,321.504,0z"/> </g> </g> </svg>',
});
const EditTask = h('div', {
    className: 'edit btn',
    onclick: () => {
        EDIT();
        document.querySelector('.input').focus();
    },
    innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 129 129" enable-background="new 0 0 129 129"> <g> <g> <path d="m119.2,114.3h-109.4c-2.3,0-4.1,1.9-4.1,4.1s1.9,4.1 4.1,4.1h109.5c2.3,0 4.1-1.9 4.1-4.1s-1.9-4.1-4.2-4.1z"/> <path d="m5.7,78l-.1,19.5c0,1.1 0.4,2.2 1.2,3 0.8,0.8 1.8,1.2 2.9,1.2l19.4-.1c1.1,0 2.1-0.4 2.9-1.2l67-67c1.6-1.6 1.6-4.2 0-5.9l-19.2-19.4c-1.6-1.6-4.2-1.6-5.9-1.77636e-15l-13.4,13.5-53.6,53.5c-0.7,0.8-1.2,1.8-1.2,2.9zm71.2-61.1l13.5,13.5-7.6,7.6-13.5-13.5 7.6-7.6zm-62.9,62.9l49.4-49.4 13.5,13.5-49.4,49.3-13.6,.1 .1-13.5z"/> </g> </g> </svg>',
});
const Panel = h('div', {
    className: classNames({
        panel: true,
        backdrop: navigator.platform.toLowerCase() === 'darwin'
            || navigator.platform.toLowerCase() === 'iphone',
    })
}, Input, h('div', { className: 'btns' }, EditTask, ToggleSelectAll, DeleteSelected));
const app = h('div', { id: 'app' }, Head, Tasks, Panel);
mount(app, '#root');
//# sourceMappingURL=index.js.map