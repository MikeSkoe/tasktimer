export const secsToTime = secs => {
	const seconds = secs % 60;
	const minutes = Math.floor((secs % (60 * 60)) / 60);
	const hours = Math.floor((secs % (60 * 60 * 12)) / (60 * 60));
	return `${hours}:${minutes}:${seconds}`;
}

