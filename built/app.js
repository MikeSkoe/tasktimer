const h = app.createElement;

import Button from './button.js';
import Todos from './todos.js';
import { secsToTime } from './utils.js';

class App extends Component {
  constructor() {
	super();
	this.run = this.run.bind(this);
	this.toggleProcess = name => this.run('toggleProcess', name);
	this.deleteTask = name => this.run('deleteTask', name);

	this.state = {
		time: 0,
		running: undefined,
		todos: [
			{name: 'one', time: 0, inProcess: false, id: 0},
			{name: 'two', time: 0, inProcess: true, id: 1},
			{name: 'three', time: 0, inProcess: true, id: 2},
		],
	};

	this.view = state => h('div', null, [
		h('h1', null, [
			secsToTime(state.time),
			Button(state, this.run),
		]),
		h('input', {onkeydown: e => {
			if (e.keyCode === 13) {
				this.run('addTodo', e.target.value);
				e.target.value = '';
			}
		}}),
		Todos(state.todos, this.toggleProcess, this.deleteTask),
	]);

	this.update = {
		set: (state, running) => ({...state, running}),
		clear: state => ({...state, running: clearInterval(state.running)}),
		plus: state => {
			const active = state.todos
				.filter(todo => !!todo.inProcess)
				.map(todo => todo.id);

			const todos = state.todos
				.map(todo => active.includes(todo.id) 
					? {...todo, time: todo.time + 1/active.length} 
					: todo
				)
			
			return {...state, time: state.time + 1, todos}
		},
		toggleProcess: (state, id) => {
			const todos = state.todos.map(todo => todo.id === id 
				? {...todo, inProcess: !todo.inProcess}
				: todo
			);
			return {...state, todos}
		},
		addTodo: (state, name) => ({
			...state, 
			todos: [
				{
					name, 
					inProcess: true, 
					time: 0, 
					id: Math.floor(Math.random() * 1000)
				},
				...state.todos, 
			],
		}),
		deleteTask: (state, id) => ({
			...state,
			todos: state.todos.filter(todo => todo.id !== id),
		}),
	};
  }
}

app.webComponent('my-app', App);
