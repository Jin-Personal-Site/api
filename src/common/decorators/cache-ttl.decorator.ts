import { CacheTTL } from '@nestjs/cache-manager'
import parse from 'parse-duration'
import { dayjs } from '../helpers'

export const DayCacheTTL = (
	_ttl: number | string = '1 day',
): ReturnType<typeof CacheTTL> => {
	const maxTtl = dayjs.tz().endOf('D').diff(new Date())
	const ttl = typeof _ttl === 'string' ? parse(_ttl, 'ms') : Math.max(0, _ttl)

	return CacheTTL(Math.min(maxTtl, ttl))
}
