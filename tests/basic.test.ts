import { validateJavaStandards } from '../src/validators/java.validator.js';

describe('Java Validator', () => {
  describe('validateJavaStandards', () => {
    it('should validate a simple Java class', () => {
      const code = `
package com.example.app;

public class UserService {
    private String name;
    
    public UserService(String name) {
        this.name = name;
    }
    
    public String getName() {
        return this.name;
    }
}
      `.trim();

      const result = validateJavaStandards(code, 'class');
      
      expect(result).toBeDefined();
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.warnings).toBeInstanceOf(Array);
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should detect invalid package name', () => {
      const code = `
package invalid_package;

public class TestClass {}
      `.trim();

      const result = validateJavaStandards(code, 'class');
      
      expect(result.errors).toContainEqual(
        expect.stringContaining('PACKAGE')
      );
    });

    it('should detect invalid class naming', () => {
      const code = `
package com.example.app;

public class invalidClass {}
      `.trim();

      const result = validateJavaStandards(code, 'class');
      
      expect(result.errors).toContainEqual(
        expect.stringContaining('CLASS NAME')
      );
    });

    it('should provide validation result for simple code', () => {
      const code = `
package com.example.app.service;

public class UserService {
    private static final String DEFAULT_NAME = "Unknown";
    private String name;
    
    public UserService(String name) {
        this.name = name;
    }
    
    public String getName() {
        return this.name;
    }
}
      `.trim();

      const result = validateJavaStandards(code, 'class');
      
      // Should have structure but may have SOLID warnings
      expect(result).toBeDefined();
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.warnings).toBeInstanceOf(Array);
      // Class structure is correct even if SOLID principles are not fully followed
      expect(result.validations.basic.naming).toBe(true);
      expect(result.validations.intermediate.structure).toBe(true);
    });
  });
});

describe('Java Generator', () => {
  describe('generateJavaClass', () => {
    it('should generate a basic Java class', () => {
      const { generateJavaClass } = require('../src/generators/java.generator.js');
      
      const config = {
        className: 'UserService',
        packageName: 'com.example.app.service',
        type: 'class' as const
      };
      
      const result = generateJavaClass(config);
      
      expect(result).toContain('package com.example.app.service;');
      expect(result).toContain('public class UserService');
    });
  });
});