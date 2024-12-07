import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.setDefault('Asia/Ho_Chi_Minh')

export { dayjs }
