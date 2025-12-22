import { validate } from 'class-validator';

import { CreatePostDto } from './create-post-draft.dto.js';

describe('CreatePostDto', () => {
  let dto: CreatePostDto;

  beforeEach(() => {
    dto = new CreatePostDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  it('should validate a valid DTO', async () => {
    // Arrange
    dto.title = 'Test Title';
    dto.content = 'Test Content';
    dto.authorEmail = 'test@example.com';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  describe('title validation', () => {
    it('should fail when title is empty', async () => {
      // Arrange
      dto.title = '';
      dto.content = 'Test Content';
      dto.authorEmail = 'test@example.com';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when title is not a string', async () => {
      // Arrange
      (dto.title as unknown) = 123;
      dto.content = 'Test Content';
      dto.authorEmail = 'test@example.com';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('content validation', () => {
    it('should fail when content is empty', async () => {
      // Arrange
      dto.title = 'Test Title';
      dto.content = '';
      dto.authorEmail = 'test@example.com';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when content is not a string', async () => {
      // Arrange
      dto.title = 'Test Title';
      (dto.content as unknown) = 123;
      dto.authorEmail = 'test@example.com';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('authorEmail validation', () => {
    it('should fail when authorEmail is empty', async () => {
      // Arrange
      dto.title = 'Test Title';
      dto.content = 'Test Content';
      dto.authorEmail = '';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('authorEmail');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when authorEmail is not a valid email', async () => {
      // Arrange
      dto.title = 'Test Title';
      dto.content = 'Test Content';
      dto.authorEmail = 'not-an-email';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('authorEmail');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });
});
