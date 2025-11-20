/**
 * Input Length Limits
 * Prevents buffer overflow and DoS attacks
 */

export const INPUT_LIMITS = {
  // User inputs
  USERNAME_MIN: 2,
  USERNAME_MAX: 50,
  EMAIL_MAX: 255,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  NAME_MIN: 2,
  NAME_MAX: 100,
  
  // Content inputs
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 5000,
  CONTENT_MAX: 50000,
  
  // Search and queries
  SEARCH_QUERY_MAX: 200,
  
  // File names
  FILENAME_MAX: 255,
  
  // URLs
  URL_MAX: 2048,
  
  // Comments and reviews
  COMMENT_MIN: 1,
  COMMENT_MAX: 1000,
  REVIEW_TITLE_MAX: 200,
  REVIEW_CONTENT_MAX: 2000,
  
  // Contact
  CONTACT_SUBJECT_MAX: 200,
  CONTACT_MESSAGE_MAX: 2000,
  PHONE_MAX: 20,
  
  // Address
  ADDRESS_MAX: 500,
  CITY_MAX: 100,
  COUNTRY_MAX: 100,
} as const;

/**
 * Validate input length
 */
export const validateInputLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string
): { valid: boolean; error?: string } => {
  if (value.length < min) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min} characters long`,
    };
  }
  
  if (value.length > max) {
    return {
      valid: false,
      error: `${fieldName} must not exceed ${max} characters`,
    };
  }
  
  return { valid: true };
};

/**
 * Truncate string to max length
 */
export const truncateToMaxLength = (value: string, max: number): string => {
  if (value.length <= max) return value;
  return value.substring(0, max - 3) + '...';
};












