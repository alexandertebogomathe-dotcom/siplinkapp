import {
  validateName,
  validateFunFact,
  validatePhone,
  validateSpots,
  validateMessage,
  validateEventForm,
  getFieldError,
  hasFieldError
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('validateName', () => {
    it('should reject empty names', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('name');
    });

    it('should reject names too short', () => {
      const result = validateName('a');
      expect(result.isValid).toBe(false);
    });

    it('should reject names too long', () => {
      const longName = 'a'.repeat(51);
      const result = validateName(longName);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid names', () => {
      const result = validateName('John Doe');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateFunFact', () => {
    it('should reject empty facts', () => {
      const result = validateFunFact('');
      expect(result.isValid).toBe(false);
    });

    it('should reject facts too short', () => {
      const result = validateFunFact('ab');
      expect(result.isValid).toBe(false);
    });

    it('should accept valid facts', () => {
      const result = validateFunFact('I love coffee');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('should accept empty phone numbers', () => {
      const result = validatePhone('');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      const result = validatePhone('invalid@phone#');
      expect(result.isValid).toBe(false);
    });

    it('should accept valid phone formats', () => {
      const result = validatePhone('+1 (555) 123-4567');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateSpots', () => {
    it('should reject zero or negative spots', () => {
      const result = validateSpots(0);
      expect(result.isValid).toBe(false);
    });

    it('should reject spots exceeding 100', () => {
      const result = validateSpots(101);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid spot counts', () => {
      const result = validateSpots(5);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateMessage', () => {
    it('should reject empty messages', () => {
      const result = validateMessage('');
      expect(result.isValid).toBe(false);
    });

    it('should reject messages too long', () => {
      const longMessage = 'a'.repeat(501);
      const result = validateMessage(longMessage);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid messages', () => {
      const result = validateMessage('Hello there!');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('should get field errors', () => {
      const errors = [{ field: 'name', message: 'Required' }];
      const error = getFieldError(errors, 'name');
      expect(error).toBe('Required');
    });

    it('should check if field has errors', () => {
      const errors = [{ field: 'name', message: 'Required' }];
      expect(hasFieldError(errors, 'name')).toBe(true);
      expect(hasFieldError(errors, 'email')).toBe(false);
    });
  });

  describe('validateEventForm', () => {
    it('should validate complete form', () => {
      const formData = {
        fun_fact: 'I love coffee',
        spots: 5,
        phone: '555-1234',
        additional_info: 'Bring your own cup'
      };
      const result = validateEventForm(formData);
      expect(result.isValid).toBe(true);
    });

    it('should collect multiple errors', () => {
      const formData = {
        fun_fact: '',
        spots: 150,
        phone: '',
        additional_info: ''
      };
      const result = validateEventForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
