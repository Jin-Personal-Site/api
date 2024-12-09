export const getCacheKey = {
	auth: {
		username: (username: string) => `auth:username:${username}`,
	},
	adminUser: {},
	category: {},
	post: {},
}
