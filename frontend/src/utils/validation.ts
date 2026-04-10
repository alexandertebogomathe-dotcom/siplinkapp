/**
 * Validation utilities for form data
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate user name
 */
export const validateName = (name: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!name || name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required'
    });
  }

  if (name.length < 2) {
    errors.push({
      field: 'name',
      message: 'Name must be at least 2 characters'
    });
  }

  if (name.length > 50) {
    errors.push({
      field: 'name',
      message: 'Name must be less than 50 characters'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate fun fact
 */
export const validateFunFact = (fact: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!fact || fact.trim().length === 0) {
    errors.push({
      field: 'fun_fact',
      message: 'Fun fact is required'
    });
  }

  if (fact.length < 3) {
    errors.push({
      field: 'fun_fact',
      message: 'Fun fact must be at least 3 characters'
    });
  }

  if (fact.length > 200) {
    errors.push({
      field: 'fun_fact',
      message: 'Fun fact must be less than 200 characters'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number (optional but if provided should be valid)
 */
export const validatePhone = (phone: string): ValidationResult => {
  const errors: ValidationError[] = [];

  // If provided, must match basic phone format
  if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
    errors.push({
      field: 'phone',
      message: 'Invalid phone format'
    });
  }

  if (phone && phone.length > 20) {
    errors.push({
      field: 'phone',
      message: 'Phone number too long'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate number of spots
 */
export const validateSpots = (spots: number): ValidationResult => {
  const errors: ValidationError[] = [];

  if (spots < 1) {
    errors.push({
      field: 'spots',
      message: 'Must have at least 1 spot'
    });
  }

  if (spots > 100) {
    errors.push({
      field: 'spots',
      message: 'Cannot exceed 100 spots'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate message text
 */
export const validateMessage = (text: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!text || text.trim().length === 0) {
    errors.push({
      field: 'message',
      message: 'Message cannot be empty'
    });
  }

  if (text.length > 500) {
    errors.push({
      field: 'message',
      message: 'Message must be less than 500 characters'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate entire event form
 */
export const validateEventForm = (formData: {
  fun_fact: string;
  spots: number;
  phone?: string;
  additional_info?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  const funFactValidation = validateFunFact(formData.fun_fact);
  if (!funFactValidation.isValid) {
    errors.push(...funFactValidation.errors);
  }

  const spotsValidation = validateSpots(formData.spots);
  if (!spotsValidation.isValid) {
    errors.push(...spotsValidation.errors);
  }

  if (formData.phone) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    }
  }

  if (formData.additional_info && formData.additional_info.length > 500) {
    errors.push({
      field: 'additional_info',
      message: 'Additional info must be less than 500 characters'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find((e) => e.field === field);
  return error ? error.message : null;
};

/**
 * Check if field has errors
 */
export const hasFieldError = (errors: ValidationError[], field: string): boolean => {
  return errors.some((e) => e.field === field);
};
