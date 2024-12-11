import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ErrorResponse, getErrorCode } from '../types'

export const ApiErrorResponse = <DataDTO extends Type<unknown>>(
	statusCode = 400,
	dataDTO?: DataDTO,
	isArray = false,
) =>
	applyDecorators(
		ApiExtraModels(ErrorResponse, ...(dataDTO ? [dataDTO] : [])),
		ApiResponse({
			status: statusCode,
			schema: {
				allOf: [
					{ $ref: getSchemaPath(ErrorResponse) },
					{
						properties: {
							error: {
								type: 'object',
								properties: {
									code: {
										type: 'string',
										example: getErrorCode(statusCode),
									},
									message: {
										type: 'string',
									},
									details: !dataDTO
										? {
												example: null,
												nullable: true,
											}
										: isArray
											? {
													type: 'array',
													items: { $ref: getSchemaPath(dataDTO) },
												}
											: { $ref: getSchemaPath(dataDTO) },
								},
							},
						},
					},
				],
			},
		}),
	)
