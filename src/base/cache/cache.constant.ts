export const getCacheKey = {
	auth: {
		username: (username: string) => `auth:username_${username}`,
	},
	adminUser: {},
	category: {},
	post: {
		total: `post:total`,
		all: (page: number, limit: number) =>
			`post:all:page_${page}:limit_${limit}`,
	},
}
