import { describe, it, expect } from '@jest/globals';
import { generateProjectStructure } from '../src/generators/project-structure.generator.js';
import { generateCompleteApiHU } from '../src/generators/complete-api.generator.js';

describe('Serenity BDD 4.3.4 Imports Validation', () => {
  
  describe('Project Structure Generator - API Hooks', () => {
    it('should generate Hooks with correct Serenity 4.3.4 imports for Maven API project', () => {
      const config = {
        buildTool: 'maven' as const,
        companyPackage: 'com.test.api',
        projectName: 'test-api-project',
        type: 'api' as const
      };
      
      const result = generateProjectStructure(config);
      
      // Should use new Serenity BDD 4.x package for EnvironmentVariables
      expect(result).toContain('import net.serenitybdd.model.environment.EnvironmentVariables;');
      expect(result).toContain('import net.serenitybdd.model.environment.SystemEnvironmentVariables;');
      
      // Should NOT use old Thucydides package
      expect(result).not.toContain('import net.thucydides.core.util.EnvironmentVariables;');
      expect(result).not.toContain('import net.thucydides.core.util.SystemEnvironmentVariables;');
    });

    it('should generate Hooks with correct Serenity 4.3.4 imports for Gradle API project', () => {
      const config = {
        buildTool: 'gradle' as const,
        companyPackage: 'com.test.api',
        projectName: 'test-api-project',
        type: 'api' as const
      };
      
      const result = generateProjectStructure(config);
      
      // Should use new Serenity BDD 4.x package
      expect(result).toContain('import net.serenitybdd.model.environment.EnvironmentVariables;');
      expect(result).toContain('import net.serenitybdd.model.environment.SystemEnvironmentVariables;');
      
      // Should NOT use old Thucydides package
      expect(result).not.toContain('import net.thucydides.core.util.EnvironmentVariables;');
      expect(result).not.toContain('import net.thucydides.core.util.SystemEnvironmentVariables;');
    });

    it('should generate Hooks with correct Serenity 4.3.4 imports for Maven "both" project', () => {
      const config = {
        buildTool: 'maven' as const,
        companyPackage: 'com.test',
        projectName: 'test-project',
        type: 'both' as const
      };
      
      const result = generateProjectStructure(config);
      
      // Should use new Serenity BDD 4.x package
      expect(result).toContain('import net.serenitybdd.model.environment.EnvironmentVariables;');
      expect(result).toContain('import net.serenitybdd.model.environment.SystemEnvironmentVariables;');
    });

    it('should NOT include EnvironmentVariables imports for Web-only project', () => {
      const config = {
        buildTool: 'maven' as const,
        companyPackage: 'com.test.web',
        projectName: 'test-web-project',
        type: 'web' as const
      };
      
      const result = generateProjectStructure(config);
      
      // Web-only projects don't need environment variables for API base URL
      // so they should not have these imports
      expect(result).not.toContain('import net.serenitybdd.model.environment.EnvironmentVariables;');
      expect(result).not.toContain('import net.thucydides.core.util.EnvironmentVariables;');
    });
  });

  describe('Complete API Generator - Hooks', () => {
    it('should generate API Hooks with correct Serenity 4.3.4 imports', () => {
      const request = {
        huId: 'API-HU-001',
        nombre: 'Crear Usuario',
        metodo: 'POST' as const,
        endpoint: '/users',
        urlBase: 'https://api.example.com',
        esquemaRespuesta: {},
        escenarioPrueba: {}
      };
      
      const result = generateCompleteApiHU(request);
      
      // Should use new Serenity BDD 4.x package
      expect(result.output).toContain('import net.serenitybdd.model.environment.EnvironmentVariables;');
      expect(result.output).toContain('import net.serenitybdd.model.environment.SystemEnvironmentVariables;');
      
      // Should NOT use old Thucydides package
      expect(result.output).not.toContain('import net.thucydides.core.util.EnvironmentVariables;');
      expect(result.output).not.toContain('import net.thucydides.core.util.SystemEnvironmentVariables;');
    });
  });

  describe('Dependency Configuration', () => {
    it('should configure correct Serenity version 4.3.4 in Maven pom.xml', () => {
      const config = {
        buildTool: 'maven' as const,
        companyPackage: 'com.test.api',
        projectName: 'test-project',
        type: 'api' as const
      };
      
      const result = generateProjectStructure(config);
      
      // Should have correct version
      expect(result).toContain('<serenity.version>4.3.4</serenity.version>');
      
      // Should have serenity-core which transitively includes serenity-model
      expect(result).toContain('<artifactId>serenity-core</artifactId>');
    });

    it('should configure correct Serenity version 4.3.4 in Gradle build.gradle', () => {
      const config = {
        buildTool: 'gradle' as const,
        companyPackage: 'com.test.api',
        projectName: 'test-project',
        type: 'api' as const
      };
      
      const result = generateProjectStructure(config);
      
      // Should have correct version
      expect(result).toContain("serenityVersion = '4.3.4'");
      
      // Should have serenity-core which transitively includes serenity-model
      expect(result).toContain('net.serenity-bdd:serenity-core');
    });
  });

  describe('Usage of EnvironmentVariables', () => {
    it('should correctly use SystemEnvironmentVariables in API Hooks', () => {
      const config = {
        buildTool: 'maven' as const,
        companyPackage: 'com.test.api',
        projectName: 'test-project',
        type: 'api' as const
      };
      
      const result = generateProjectStructure(config);
      
      // Check proper usage of SystemEnvironmentVariables
      expect(result).toContain('EnvironmentVariables environmentVariables = SystemEnvironmentVariables.currentEnvironmentVariables();');
      expect(result).toContain('environmentVariables.optionalProperty("URL_QA")');
    });
  });
});
