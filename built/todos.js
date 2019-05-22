const h = app.createElement;
import { secsToTime } from './utils.js';

const Todos = (todos, toggleProcess, deleteTask) => h('div', null,
	todos.map(todo => h('div', null, [
		secsToTime(Math.floor(todo.time)), 
		todo.name,
		h('button', 
			{onclick: () => toggleProcess(todo.name)}, 
			[ todo.inProcess ? 'V' : 'X', ]
		),
		h('button', 
			{onclick: () => deleteTask(todo.name)}, 
			'X'
		),
	]))
);

export default Todos;
