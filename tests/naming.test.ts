import { describe, it, expect } from '@jest/globals';
import { 
  httpMethodToPascalCase, 
  isValidJavaClassName, 
  validateFilenameMatchesClassName,
  getClassNameValidationErrors,
  getFilenameValidationErrors
} from '../src/generators/naming.helper';

// Test constants
const LONG_CLASS_NAME_LENGTH = 30;

describe('Naming Helper', () => {
  
  describe('httpMethodToPascalCase', () => {
    it('should convert GET to Get', () => {
      expect(httpMethodToPascalCase('GET')).toBe('Get');
    });

    it('should convert POST to Post', () => {
      expect(httpMethodToPascalCase('POST')).toBe('Post');
    });

    it('should convert PUT to Put', () => {
      expect(httpMethodToPascalCase('PUT')).toBe('Put');
    });

    it('should convert DELETE to Delete', () => {
      expect(httpMethodToPascalCase('DELETE')).toBe('Delete');
    });

    it('should convert PATCH to Patch', () => {
      expect(httpMethodToPascalCase('PATCH')).toBe('Patch');
    });

    it('should handle lowercase input', () => {
      expect(httpMethodToPascalCase('get')).toBe('Get');
    });

    it('should handle mixed case input', () => {
      expect(httpMethodToPascalCase('GeT')).toBe('Get');
    });

    it('should return empty string for empty input', () => {
      expect(httpMethodToPascalCase('')).toBe('');
    });
  });

  describe('isValidJavaClassName', () => {
    it('should validate correct PascalCase names', () => {
      expect(isValidJavaClassName('GetRequest')).toBe(true);
      expect(isValidJavaClassName('PostRequest')).toBe(true);
      expect(isValidJavaClassName('MyClassName')).toBe(true);
    });

    it('should reject all uppercase names (except short ones)', () => {
      expect(isValidJavaClassName('GETREQUEST')).toBe(false);
      expect(isValidJavaClassName('POSTREQUEST')).toBe(false);
    });

    it('should accept short uppercase acronyms', () => {
      expect(isValidJavaClassName('IO')).toBe(true);
      expect(isValidJavaClassName('UI')).toBe(true);
    });

    it('should reject names starting with lowercase', () => {
      expect(isValidJavaClassName('getRequest')).toBe(false);
      expect(isValidJavaClassName('myClass')).toBe(false);
    });

    it('should reject names with underscores', () => {
      expect(isValidJavaClassName('Get_Request')).toBe(false);
      expect(isValidJavaClassName('MY_CLASS')).toBe(false);
    });

    it('should reject empty names', () => {
      expect(isValidJavaClassName('')).toBe(false);
    });

    it('should reject names with special characters', () => {
      expect(isValidJavaClassName('Get-Request')).toBe(false);
      expect(isValidJavaClassName('Get.Request')).toBe(false);
    });
  });

  describe('validateFilenameMatchesClassName', () => {
    it('should validate matching filename and class name', () => {
      expect(validateFilenameMatchesClassName('GetRequest.java', 'GetRequest')).toBe(true);
      expect(validateFilenameMatchesClassName('MyClass.java', 'MyClass')).toBe(true);
    });

    it('should handle filenames without .java extension', () => {
      expect(validateFilenameMatchesClassName('GetRequest', 'GetRequest')).toBe(true);
    });

    it('should reject mismatched names', () => {
      expect(validateFilenameMatchesClassName('GETRequest.java', 'GetRequest')).toBe(false);
      expect(validateFilenameMatchesClassName('GetRequest.java', 'GETRequest')).toBe(false);
    });

    it('should reject empty inputs', () => {
      expect(validateFilenameMatchesClassName('', 'GetRequest')).toBe(false);
      expect(validateFilenameMatchesClassName('GetRequest.java', '')).toBe(false);
    });
  });

  describe('getClassNameValidationErrors', () => {
    it('should return no errors for valid class names', () => {
      expect(getClassNameValidationErrors('GetRequest')).toEqual([]);
      expect(getClassNameValidationErrors('MyClass')).toEqual([]);
    });

    it('should return error for all uppercase names', () => {
      const errors = getClassNameValidationErrors('GETREQUEST');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('all uppercase'))).toBe(true);
    });

    it('should return error for lowercase start', () => {
      const errors = getClassNameValidationErrors('getRequest');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('uppercase letter'))).toBe(true);
    });

    it('should return error for empty class name', () => {
      const errors = getClassNameValidationErrors('');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('cannot be empty'))).toBe(true);
    });

    it('should return warning for very long names', () => {
      const longName = 'A'.repeat(LONG_CLASS_NAME_LENGTH);
      const errors = getClassNameValidationErrors(longName);
      expect(errors.some(e => e.includes('too long'))).toBe(true);
    });
  });

  describe('getFilenameValidationErrors', () => {
    it('should return no errors for matching filename and class name', () => {
      expect(getFilenameValidationErrors('GetRequest.java', 'GetRequest')).toEqual([]);
    });

    it('should return error for mismatched filename and class name', () => {
      const errors = getFilenameValidationErrors('GETRequest.java', 'GetRequest');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('FILENAME MISMATCH'))).toBe(true);
    });

    it('should suggest correct filename in error message', () => {
      const errors = getFilenameValidationErrors('GETRequest.java', 'GetRequest');
      expect(errors.some(e => e.includes('GetRequest.java'))).toBe(true);
    });
  });

});
