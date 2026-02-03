import { describe, it, expect } from '@jest/globals';
import { generateAPIComponent, type APIComponentConfig } from '../src/generators/serenity-api.generator';

describe('API Generator - Class Name Validation', () => {
  
  describe('generateAPIInteraction', () => {
    it('should generate GetRequest class for GET method', () => {
      const config: APIComponentConfig = {
        componentType: 'Interaction',
        className: 'GetRequest',
        packageName: 'com.screenplay.api.interactions',
        httpMethod: 'GET'
      };
      
      const code = generateAPIComponent(config);
      
      // Should contain the correct class declaration with PascalCase
      expect(code).toContain('public class GetRequest implements Interaction');
      expect(code).not.toContain('public class GETRequest');
      
      // Should have correct constructor
      expect(code).toContain('public GetRequest(String endpoint, Object body)');
      
      // Should have correct factory method
      expect(code).toContain('public static GetRequest to(String endpoint, Object body)');
      expect(code).toContain('return instrumented(GetRequest.class, endpoint, body)');
    });

    it('should generate PostRequest class for POST method', () => {
      const config: APIComponentConfig = {
        componentType: 'Interaction',
        className: 'PostRequest',
        packageName: 'com.screenplay.api.interactions',
        httpMethod: 'POST'
      };
      
      const code = generateAPIComponent(config);
      
      expect(code).toContain('public class PostRequest implements Interaction');
      expect(code).not.toContain('public class POSTRequest');
      expect(code).toContain('public PostRequest(String endpoint, Object body)');
    });

    it('should generate PutRequest class for PUT method', () => {
      const config: APIComponentConfig = {
        componentType: 'Interaction',
        className: 'PutRequest',
        packageName: 'com.screenplay.api.interactions',
        httpMethod: 'PUT'
      };
      
      const code = generateAPIComponent(config);
      
      expect(code).toContain('public class PutRequest implements Interaction');
      expect(code).not.toContain('public class PUTRequest');
    });

    it('should generate DeleteRequest class for DELETE method', () => {
      const config: APIComponentConfig = {
        componentType: 'Interaction',
        className: 'DeleteRequest',
        packageName: 'com.screenplay.api.interactions',
        httpMethod: 'DELETE'
      };
      
      const code = generateAPIComponent(config);
      
      expect(code).toContain('public class DeleteRequest implements Interaction');
      expect(code).not.toContain('public class DELETERequest');
    });

    it('should generate PatchRequest class for PATCH method', () => {
      const config: APIComponentConfig = {
        componentType: 'Interaction',
        className: 'PatchRequest',
        packageName: 'com.screenplay.api.interactions',
        httpMethod: 'PATCH'
      };
      
      const code = generateAPIComponent(config);
      
      expect(code).toContain('public class PatchRequest implements Interaction');
      expect(code).not.toContain('public class PATCHRequest');
    });

    it('should use provided className if given', () => {
      const config: APIComponentConfig = {
        componentType: 'Interaction',
        className: 'CustomGetRequest',
        packageName: 'com.screenplay.api.interactions',
        httpMethod: 'GET'
      };
      
      const code = generateAPIComponent(config);
      
      expect(code).toContain('public class CustomGetRequest implements Interaction');
    });

    it('should throw error for invalid class name', () => {
      const config: APIComponentConfig = {
        componentType: 'Interaction',
        className: 'INVALID_CLASS_NAME',
        packageName: 'com.screenplay.api.interactions',
        httpMethod: 'GET'
      };
      
      expect(() => generateAPIComponent(config)).toThrow(/Invalid class name/);
    });

    it('should auto-generate valid class name when className not provided', () => {
      const config: APIComponentConfig = {
        componentType: 'Interaction',
        className: undefined as any,
        packageName: 'com.screenplay.api.interactions',
        httpMethod: 'POST'
      };
      
      const code = generateAPIComponent(config);
      
      // Should auto-generate PostRequest (not POSTRequest)
      expect(code).toContain('public class PostRequest implements Interaction');
    });
  });

  describe('generateAPITask', () => {
    it('should generate Task with valid class name', () => {
      const config: APIComponentConfig = {
        componentType: 'Task',
        className: 'CrearUsuario',
        packageName: 'com.screenplay.api.tasks',
        httpMethod: 'POST',
        endpoint: '/users'
      };
      
      const code = generateAPIComponent(config);
      
      expect(code).toContain('public class CrearUsuario implements Task');
      expect(code).toContain('public CrearUsuario(');
    });
  });

  describe('generateAPIQuestion', () => {
    it('should generate Question with valid class name', () => {
      const config: APIComponentConfig = {
        componentType: 'Question',
        className: 'ValidarRespuesta',
        packageName: 'com.screenplay.api.questions'
      };
      
      const code = generateAPIComponent(config);
      
      expect(code).toContain('public class ValidarRespuesta implements Question<Integer>');
    });
  });

  describe('generateAPIModel', () => {
    it('should generate Model with valid class name', () => {
      const config: APIComponentConfig = {
        componentType: 'Model',
        className: 'UsuarioResponse',
        packageName: 'com.screenplay.api.models',
        responseFields: [
          { name: 'id', type: 'String' },
          { name: 'nombre', type: 'String' }
        ]
      };
      
      const code = generateAPIComponent(config);
      
      expect(code).toContain('public class UsuarioResponse');
      expect(code).toContain('public UsuarioResponse()');
    });
  });

});
