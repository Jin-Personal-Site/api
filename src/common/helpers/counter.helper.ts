export const counter = (start = 0, step = 1) => {
	let count = start
	return {
		next: () => (count += step),
	}
}
