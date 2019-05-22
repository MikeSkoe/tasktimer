const h = app.createElement;

const Button = (state, run) => 
	h('button', {onclick: () => {
		state.running
			? run('clear')
			: run('set', 
				setInterval(() => {
					if (!state.running) {
						run('plus')
					}
				}, 1000)
			);
	}}, state.running ? 'stop' : 'start')

export default Button;
