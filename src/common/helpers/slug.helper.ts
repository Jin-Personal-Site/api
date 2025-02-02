import slugify from 'slugify'

const slugCounter = (start = 1, step = 1) => {
	let count = start
	return {
		next: () => (count += step),
	}
}

export const getSlug = (allSlugs: string[], text: string) => {
	const slugText = slugify(text, { lower: true })
	const count = slugCounter()
	let slug = slugText

	while (allSlugs.includes(slug)) {
		slug = `${slugText}-${String(count.next()).padStart(2, '0')}`
	}

	return slug
}
