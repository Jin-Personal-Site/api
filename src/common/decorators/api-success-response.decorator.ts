import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { SuccessResponse } from '../types'

/**
 * It creates a decorator that adds a successful response to the swagger docs
 * @param {DataDTO} dataDTO - The DTO that will be used to validate the response data.
 * @param [statusCode=200] - The HTTP status code of the response.
 * @param [isArray=false] - If the response is an array of dataDTO, set this to true.
 */
export const ApiSuccessResponse = <DataDTO extends Type<unknown>>(
	statusCode = 200,
	dataDTO: DataDTO,
	isArray = false,
) =>
	applyDecorators(
		ApiExtraModels(SuccessResponse, dataDTO),
		ApiResponse({
			status: statusCode,
			schema: {
				allOf: [
					{ $ref: getSchemaPath(SuccessResponse) },
					{
						properties: {
							data: isArray
								? {
										type: 'array',
										items: { $ref: getSchemaPath(dataDTO) },
									}
								: {
										$ref: getSchemaPath(dataDTO),
									},
						},
					},
				],
			},
		}),
	)
