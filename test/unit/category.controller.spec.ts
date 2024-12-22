// Unit tests for: getAll

import { AllCategoriesOutputDTO, CategoryController } from '@/shared'
import { plainToInstance } from 'class-transformer'

class MockCategoryService {
	public getAllCategories = jest.fn()
}

describe('CategoryController.getAll() getAll method', () => {
	let categoryController: CategoryController
	let mockCategoryService: MockCategoryService

	beforeEach(() => {
		mockCategoryService = new MockCategoryService()
		categoryController = new CategoryController(mockCategoryService as any)
	})

	describe('Happy Paths', () => {
		it('should return all categories successfully', async () => {
			// Arrange
			const mockCategories = [
				{ id: 1, name: 'Category 1' },
				{ id: 2, name: 'Category 2' },
			]
			mockCategoryService.getAllCategories.mockResolvedValue(
				mockCategories as any as never,
			)

			// Act
			const result = await categoryController.getAll()

			// Assert
			expect(mockCategoryService.getAllCategories).toHaveBeenCalled()
			expect(result).toEqual(
				plainToInstance(AllCategoriesOutputDTO, { categories: mockCategories }),
			)
		})
	})

	describe('Edge Cases', () => {
		it('should handle empty categories list', async () => {
			// Arrange
			const mockCategories: any[] = []
			mockCategoryService.getAllCategories.mockResolvedValue(
				mockCategories as any as never,
			)

			// Act
			const result = await categoryController.getAll()

			// Assert
			expect(mockCategoryService.getAllCategories).toHaveBeenCalled()
			expect(result).toEqual(
				plainToInstance(AllCategoriesOutputDTO, { categories: mockCategories }),
			)
		})

		it('should handle service throwing an error', async () => {
			// Arrange
			const errorMessage = 'Service error'
			mockCategoryService.getAllCategories.mockRejectedValue(
				new Error(errorMessage) as never,
			)

			// Act & Assert
			await expect(categoryController.getAll()).rejects.toThrowError(
				errorMessage,
			)
			expect(mockCategoryService.getAllCategories).toHaveBeenCalled()
		})
	})
})

// End of unit tests for: getAll
