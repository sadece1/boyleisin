import {
  generateId,
  parseDate,
  parseJson,
  sanitizeString,
  isEmpty,
  formatPagination,
  getPaginationParams,
  calculateReservationPrice,
  isValidEmail,
  generateSlug,
} from '../utils/helpers';

describe('Helper Functions', () => {
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('parseDate', () => {
    it('should parse date to ISO string', () => {
      const date = new Date('2024-01-01');
      const result = parseDate(date);
      expect(result).toBe(date.toISOString());
    });

    it('should return null for null input', () => {
      expect(parseDate(null)).toBeNull();
    });
  });

  describe('parseJson', () => {
    it('should parse JSON string', () => {
      const json = '{"test": "value"}';
      const result = parseJson(json);
      expect(result).toEqual({ test: 'value' });
    });

    it('should return object as-is', () => {
      const obj = { test: 'value' };
      expect(parseJson(obj)).toEqual(obj);
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should return false for non-empty array', () => {
      expect(isEmpty([{ id: 1 }])).toBe(false);
    });
  });

  describe('formatPagination', () => {
    it('should format pagination correctly', () => {
      const result = formatPagination({ page: 2, limit: 10, total: 25 });
      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('getPaginationParams', () => {
    it('should extract pagination params', () => {
      const result = getPaginationParams({ page: '2', limit: '20' });
      expect(result).toEqual({ page: 2, limit: 20, offset: 20 });
    });
  });

  describe('calculateReservationPrice', () => {
    it('should calculate price correctly', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-05');
      const price = calculateReservationPrice(100, start, end, [50]);
      expect(price).toBe(600); // 4 nights * (100 + 50) = 600
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from text', () => {
      expect(generateSlug('Test String')).toBe('test-string');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Test & String!')).toBe('test-string');
    });
  });
});












