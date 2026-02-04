// Naming Helper - Utilities for consistent Java naming conventions

// Constants for naming validation
const MAX_ACRONYM_LENGTH = 3; // Max length for acronyms like IO, UI
const MAX_RECOMMENDED_CLASS_NAME_LENGTH = 25; // Recommended max length for class names

/**
 * Converts an HTTP method to PascalCase for Java class names
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @returns PascalCase version (Get, Post, Put, Delete, Patch)
 */
export function httpMethodToPascalCase(method: string): string {
  if (!method) {
    return '';
  }

  // Convert to lowercase first, then capitalize first letter
  const normalized = method.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Validates that a class name follows Java PascalCase naming conventions
 * @param className - The class name to validate
 * @returns true if valid, false otherwise
 */
export function isValidJavaClassName(className: string): boolean {
  if (!className) {
    return false;
  }

  // Must start with uppercase letter, followed by letters/numbers
  // No underscores, no all caps (except acronyms of 2 letters max)
  const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;

  if (!pascalCaseRegex.test(className)) {
    return false;
  }

  // Check that it's not all uppercase (except very short names like IO, UI)
  if (className.length > MAX_ACRONYM_LENGTH && className === className.toUpperCase()) {
    return false;
  }

  return true;
}

/**
 * Validates that a filename matches the expected class name
 * @param filename - The Java filename (e.g., "GetRequest.java")
 * @param className - The class name (e.g., "GetRequest")
 * @returns true if they match, false otherwise
 */
export function validateFilenameMatchesClassName(filename: string, className: string): boolean {
  if (!filename || !className) {
    return false;
  }

  // Remove .java extension if present and compare with class name
  return filename.replace(/\.java$/, '') === className;
}

/**
 * Gets validation errors for a Java class name
 * @param className - The class name to validate
 * @returns Array of error messages, empty if valid
 */
export function getClassNameValidationErrors(className: string): string[] {
  const errors: string[] = [];

  if (!className) {
    errors.push('❌ CLASS NAME: Class name cannot be empty');
    return errors;
  }

  if (!isValidJavaClassName(className)) {
    if (!/^[A-Z]/.test(className)) {
      errors.push(`❌ CLASS NAME: '${className}' must start with an uppercase letter (PascalCase)`);
    }

    if (!/^[A-Za-z0-9]+$/.test(className)) {
      errors.push(`❌ CLASS NAME: '${className}' contains invalid characters (only letters and numbers allowed)`);
    }

    if (className.length > MAX_ACRONYM_LENGTH && className === className.toUpperCase()) {
      errors.push(`❌ CLASS NAME: '${className}' is all uppercase - use PascalCase instead (e.g., '${httpMethodToPascalCase(className)}Request')`);
    }
  }

  if (className.length > MAX_RECOMMENDED_CLASS_NAME_LENGTH) {
    errors.push(`⚠️ CLASS NAME: '${className}' is too long (${className.length} characters, recommended max ${MAX_RECOMMENDED_CLASS_NAME_LENGTH})`);
  }

  return errors;
}

/**
 * Gets validation errors for filename-class name mismatch
 * @param filename - The Java filename
 * @param className - The class name
 * @returns Array of error messages, empty if valid
 */
export function getFilenameValidationErrors(filename: string, className: string): string[] {
  const errors: string[] = [];

  if (!validateFilenameMatchesClassName(filename, className)) {
    errors.push(
      `❌ FILENAME MISMATCH: File '${filename}' must match class name '${className}' (expected '${className}.java')`
    );
  }

  return errors;
}
