import type { UserConfig } from '@commitlint/types'
import { RuleConfigSeverity } from '@commitlint/types'

const Configuration: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'header-max-length': [RuleConfigSeverity.Error, 'always', 10000],
	},
	settings: {
		enableMultipleScopes: true,
	},
}

export default Configuration
