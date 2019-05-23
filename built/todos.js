const h = app.createElement;
import { secsToTime } from './utils.js';

const Todos = (todos, toggleProcess, deleteTask) => h('div', null,
	todos.map(todo => h('div', 
		{
			onclick: () => toggleProcess(todo.id),
			className: 'todo',
		}, 
		[
			h('b', null,
				[ todo.inProcess ? '•' : ' ', ]
			),
			h('b', null, secsToTime(Math.floor(todo.time))),
			todo.name,
			h('button', 
				{onclick: e => {
					e.preventDefault();
					e.stopPropagation();
					deleteTask(todo.id);
				}}, 
				'X'
			),
		]
	))
);

export default Todos;
