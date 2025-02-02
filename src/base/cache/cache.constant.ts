export const getCacheKey = {
	auth: {
		username: (username: string) => `auth:username_${username}`,
	},
	adminUser: {},
	category: {
		all: 'category:all',
		detail: (categoryId) => `category:id_${categoryId}`,
		countPost: (categoryId) => `category:id_${categoryId}:post`,
	},
	series: {
		all: 'series:all',
		detail: (seriesId) => `series:id_${seriesId}`,
	},
	post: {
		detail: (id: number) => `post:id_${id}`,
		total: 'post:total',
		all: (page: number, limit: number) =>
			`post:all:page_${page}:limit_${limit}`,
		allSlugs: 'post:all-slug',
	},
}
