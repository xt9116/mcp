import { describe, it, expect } from '@jest/globals';
import { generateCompleteApiHU } from '../src/generators/complete-api.generator';
import type { ApiHURequest } from '../src/generators/types';

describe('Integration Test - API HU Generation with Proper Class Names', () => {
  
  it('should generate API HU with GET method using PascalCase (GetRequest, not GETRequest)', () => {
    const request: ApiHURequest = {
      huId: 'API-HU-001',
      nombre: 'Obtener Usuario',
      urlBase: 'https://api.example.com',
      endpoint: '/users/{id}',
      metodo: 'GET',
      parametros: [
        { name: 'id', type: 'String', description: 'User ID' }
      ],
      esquemaRespuesta: {
        id: 'string',
        nombre: 'string',
        email: 'string'
      },
      codigosRespuesta: [
        { codigo: 200, descripcion: 'Success' }
      ],
      validaciones: ['El código de respuesta debe ser 200']
    };

    const result = generateCompleteApiHU(request);
    
    // Verify the filename is GetRequest.java (not GETRequest.java)
    expect(result.summary.files.some(f => f.name === 'GetRequest.java')).toBe(true);
    expect(result.summary.files.some(f => f.name === 'GETRequest.java')).toBe(false);
    
    // Verify the generated code uses GetRequest class name
    expect(result.output).toContain('public class GetRequest implements Interaction');
    expect(result.output).not.toContain('public class GETRequest');
    
    // Verify import statement uses GetRequest
    expect(result.output).toContain('import com.screenplay.api.interactions.GetRequest;');
    expect(result.output).not.toContain('import com.screenplay.api.interactions.GETRequest;');
    
    // Verify usage in Task uses GetRequest
    expect(result.output).toContain('GetRequest.to(');
    expect(result.output).not.toContain('GETRequest.to(');
  });

  it('should generate API HU with POST method using PascalCase (PostRequest, not POSTRequest)', () => {
    const request: ApiHURequest = {
      huId: 'API-HU-002',
      nombre: 'Crear Usuario',
      urlBase: 'https://api.example.com',
      endpoint: '/users',
      metodo: 'POST',
      parametros: [
        { name: 'nombre', type: 'String', description: 'User name' },
        { name: 'email', type: 'String', description: 'User email' }
      ],
      esquemaRespuesta: {
        id: 'string',
        nombre: 'string',
        email: 'string'
      },
      codigosRespuesta: [
        { codigo: 201, descripcion: 'Created' }
      ],
      validaciones: ['El código de respuesta debe ser 201']
    };

    const result = generateCompleteApiHU(request);
    
    // Verify the filename is PostRequest.java (not POSTRequest.java)
    expect(result.summary.files.some(f => f.name === 'PostRequest.java')).toBe(true);
    expect(result.summary.files.some(f => f.name === 'POSTRequest.java')).toBe(false);
    
    // Verify the generated code uses PostRequest class name
    expect(result.output).toContain('public class PostRequest implements Interaction');
    expect(result.output).not.toContain('public class POSTRequest');
    
    // Verify import statement uses PostRequest
    expect(result.output).toContain('import com.screenplay.api.interactions.PostRequest;');
    
    // Verify usage in Task uses PostRequest
    expect(result.output).toContain('PostRequest.to(');
  });

  it('should generate API HU with PUT method using PascalCase (PutRequest)', () => {
    const request: ApiHURequest = {
      huId: 'API-HU-003',
      nombre: 'Actualizar Usuario',
      urlBase: 'https://api.example.com',
      endpoint: '/users/{id}',
      metodo: 'PUT',
      parametros: [
        { name: 'id', type: 'String', description: 'User ID' }
      ],
      esquemaRespuesta: {},
      codigosRespuesta: [
        { codigo: 200, descripcion: 'Updated' }
      ],
      validaciones: []
    };

    const result = generateCompleteApiHU(request);
    
    expect(result.summary.files.some(f => f.name === 'PutRequest.java')).toBe(true);
    expect(result.output).toContain('public class PutRequest implements Interaction');
    expect(result.output).not.toContain('public class PUTRequest');
  });

  it('should generate API HU with DELETE method using PascalCase (DeleteRequest)', () => {
    const request: ApiHURequest = {
      huId: 'API-HU-004',
      nombre: 'Eliminar Usuario',
      urlBase: 'https://api.example.com',
      endpoint: '/users/{id}',
      metodo: 'DELETE',
      parametros: [],
      esquemaRespuesta: {},
      codigosRespuesta: [
        { codigo: 204, descripcion: 'No Content' }
      ],
      validaciones: []
    };

    const result = generateCompleteApiHU(request);
    
    expect(result.summary.files.some(f => f.name === 'DeleteRequest.java')).toBe(true);
    expect(result.output).toContain('public class DeleteRequest implements Interaction');
    expect(result.output).not.toContain('public class DELETERequest');
  });

  it('should generate API HU with PATCH method using PascalCase (PatchRequest)', () => {
    const request: ApiHURequest = {
      huId: 'API-HU-005',
      nombre: 'Actualizar Parcial Usuario',
      urlBase: 'https://api.example.com',
      endpoint: '/users/{id}',
      metodo: 'PATCH',
      parametros: [],
      esquemaRespuesta: {},
      codigosRespuesta: [
        { codigo: 200, descripcion: 'OK' }
      ],
      validaciones: []
    };

    const result = generateCompleteApiHU(request);
    
    expect(result.summary.files.some(f => f.name === 'PatchRequest.java')).toBe(true);
    expect(result.output).toContain('public class PatchRequest implements Interaction');
    expect(result.output).not.toContain('public class PATCHRequest');
  });

  it('should verify all generated class names follow Java naming conventions', () => {
    const request: ApiHURequest = {
      huId: 'API-HU-TEST',
      nombre: 'Test All Classes',
      urlBase: 'https://api.example.com',
      endpoint: '/test',
      metodo: 'POST',
      parametros: [],
      esquemaRespuesta: {},
      codigosRespuesta: [],
      validaciones: []
    };

    const result = generateCompleteApiHU(request);
    
    // Extract all class declarations from the generated output
    const classDeclarationRegex = /public class (\w+)/g;
    const matches = [...result.output.matchAll(classDeclarationRegex)];
    const classNames = matches.map(m => m[1]);
    
    // Verify all class names are PascalCase (start with uppercase, no all-caps except very short)
    classNames.forEach(className => {
      // Must start with uppercase
      expect(className[0]).toBe(className[0].toUpperCase());
      
      // Should not be all uppercase (unless very short like IO, UI)
      if (className.length > 3) {
        expect(className).not.toBe(className.toUpperCase());
      }
      
      // Should not contain underscores or hyphens
      expect(className).not.toMatch(/[_-]/);
    });
  });

});
