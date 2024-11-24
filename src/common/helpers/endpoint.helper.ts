import { RequestMethod } from '@nestjs/common'

export function getControllerEndpoint(controller: any, functionName: string) {
	// Get controller metadata
	const controllerPath = Reflect.getMetadata('path', controller)

	// Get method metadata
	const targetCallback = controller.prototype[functionName]
	const path = Reflect.getMetadata('path', targetCallback)
	const method = Reflect.getMetadata('method', targetCallback)

	// Combine paths and format
	const endpoint = `${controllerPath}/${path}`.replace(/\/+/g, '/')

	// Get HTTP method name
	const methodName = RequestMethod[method]

	return {
		methodName,
		endpoint,
	}
}
