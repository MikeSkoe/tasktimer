export const secsToTime = secs => {
	const seconds = secs % 60;
	const minutes = Math.floor(secs / 60) % (60 * 60);
	return `${minutes}:${seconds}`;
}

