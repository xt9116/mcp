import { generateCompleteApiHU } from '../src/generators/complete-api.generator';
import { generateCompleteWebHU } from '../src/generators/complete-web.generator';
import type { ApiHURequest, WebHURequest } from '../src/generators/types';

describe('seeThat() validation generation tests', () => {
  
  describe('API step definitions', () => {
    it('should generate seeThat with description parameter for better type inference', () => {
      const request: ApiHURequest = {
        huId: 'API-HU-001',
        nombre: 'Obtener Usuario',
        urlBase: 'https://api.example.com',
        endpoint: '/api/users',
        metodo: 'GET',
        headers: [],
        parametros: [],
        esquemaRespuesta: { id: 'int', name: 'string' },
        codigosRespuesta: [{ codigo: 200, descripcion: 'OK' }],
        validaciones: ['El código de respuesta es 200'],
        flujoTask: ['Enviar request GET'],
        escenarioPrueba: {
          nombre: 'Obtener usuario',
          steps: ['Given servicio disponible', 'When obtener usuario', 'Then respuesta 200'],
          examples: []
        }
      };

      const result = generateCompleteApiHU(request);
      
      // Should use 3-parameter seeThat with description
      expect(result.output).toContain('seeThat("El código de respuesta",');
      expect(result.output).toContain('.valor(), equalTo(200)');
      
      // Should NOT use lambda expressions
      expect(result.output).not.toContain('() ->');
      expect(result.output).not.toContain('lambda');
      
      // Should have proper imports
      expect(result.output).toContain('import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;');
      expect(result.output).toContain('import static org.hamcrest.Matchers.*;');
    });

    it('should generate Question implementation that returns wrapper type', () => {
      const request: ApiHURequest = {
        huId: 'API-HU-002',
        nombre: 'Crear Producto',
        urlBase: 'https://api.example.com',
        endpoint: '/api/products',
        metodo: 'POST',
        headers: [],
        parametros: [],
        esquemaRespuesta: { id: 'int' },
        codigosRespuesta: [{ codigo: 201, descripcion: 'Created' }],
        validaciones: [],
        flujoTask: [],
        escenarioPrueba: {
          nombre: 'Crear producto',
          steps: [],
          examples: []
        }
      };

      const result = generateCompleteApiHU(request);
      
      // Question should implement Question<Integer>, not Question<int>
      expect(result.output).toContain('implements Question<Integer>');
      
      // answeredBy should return Integer (autoboxed from int)
      expect(result.output).toContain('public Integer answeredBy(Actor actor)');
      expect(result.output).toContain('return SerenityRest.lastResponse().statusCode();');
    });

    it('should work with all HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      methods.forEach(method => {
        const request: ApiHURequest = {
          huId: `API-HU-${method}`,
          nombre: `Test ${method}`,
          urlBase: 'https://api.example.com',
          endpoint: '/api/test',
          metodo: method,
          headers: [],
          parametros: [],
          esquemaRespuesta: {},
          codigosRespuesta: [{ codigo: 200, descripcion: 'OK' }],
          validaciones: [],
          flujoTask: [],
          escenarioPrueba: { nombre: 'Test', steps: [], examples: [] }
        };

        const result = generateCompleteApiHU(request);
        
        // All should use the 3-parameter seeThat
        expect(result.output).toContain('seeThat("El código de respuesta",');
        expect(result.output).not.toContain('() ->');
      });
    });
  });

  describe('Web step definitions', () => {
    it('should generate seeThat with description parameter for Boolean questions', () => {
      const request: WebHURequest = {
        huId: 'WEB-HU-001',
        nombre: 'Buscar Producto',
        baseUrl: 'https://www.example.com',
        paginas: [
          {
            name: 'Búsqueda',
            uiName: 'UIBusqueda',
            elements: [
              { prefix: 'TXT', name: 'BUSCAR', selector: '#search' },
              { prefix: 'BTN', name: 'SUBMIT', selector: '#submit' },
              { prefix: 'LBL', name: 'RESULTADOS', selector: '.results' }
            ]
          }
        ],
        pasosFlujo: ['Buscar producto'],
        validaciones: ['Los resultados se muestran'],
        gherkinScenario: 'Feature: Buscar'
      };

      const result = generateCompleteWebHU(request);
      
      // Should use 3-parameter seeThat with description for Boolean
      expect(result.output).toContain('seeThat("Los resultados de búsqueda",');
      // Question class name is now generated from validation text: "Los resultados se muestran" -> "VerificarLosResultadosSeMuestran"
      expect(result.output).toContain('VerificarLosResultadosSeMuestran.en(');
      expect(result.output).toContain(', is(true))');
      
      // Should NOT use lambda expressions
      expect(result.output).not.toContain('() ->');
      expect(result.output).not.toContain('lambda');
      
      // Should have proper imports
      expect(result.output).toContain('import static net.serenitybdd.screenplay.GivenWhenThen.seeThat;');
      expect(result.output).toContain('import static org.hamcrest.Matchers.*;');
    });

    it('should generate Boolean Question implementation correctly', () => {
      const request: WebHURequest = {
        huId: 'WEB-HU-002',
        nombre: 'Login',
        baseUrl: 'https://www.example.com',
        paginas: [
          {
            name: 'Login',
            uiName: 'UILogin',
            elements: [
              { prefix: 'BTN', name: 'LOGIN', selector: '#login' }
            ]
          }
        ],
        pasosFlujo: [],
        validaciones: ['Login exitoso'],
        gherkinScenario: 'Feature: Login'
      };

      const result = generateCompleteWebHU(request);
      
      // Question should implement Question<Boolean>
      expect(result.output).toContain('implements Question<Boolean>');
      
      // answeredBy should return Boolean
      expect(result.output).toContain('public Boolean answeredBy(Actor actor)');
      
      // Should use isDisplayed() or similar check
      expect(result.output).toContain('isDisplayed()');
    });
  });

  describe('Type safety', () => {
    it('API: should use Question<Integer> with equalTo() matcher', () => {
      const request: ApiHURequest = {
        huId: 'API-HU-TYPE',
        nombre: 'Type Test',
        urlBase: 'https://api.example.com',
        endpoint: '/test',
        metodo: 'GET',
        headers: [],
        parametros: [],
        esquemaRespuesta: {},
        codigosRespuesta: [{ codigo: 200, descripcion: 'OK' }],
        validaciones: [],
        flujoTask: [],
        escenarioPrueba: { nombre: 'Test', steps: [], examples: [] }
      };

      const result = generateCompleteApiHU(request);
      
      // Type-safe pattern: Question<Integer> with equalTo(Integer)
      expect(result.output).toContain('implements Question<Integer>');
      expect(result.output).toContain('equalTo(200)');
      
      // NOT using is() for Integer (which is less type-safe)
      expect(result.output).not.toContain('is(200)');
    });

    it('Web: should use Question<Boolean> with is() matcher', () => {
      const request: WebHURequest = {
        huId: 'WEB-HU-TYPE',
        nombre: 'Type Test',
        baseUrl: 'https://www.example.com',
        paginas: [
          {
            name: 'Test',
            uiName: 'UITest',
            elements: [{ prefix: 'BTN', name: 'TEST', selector: '#test' }]
          }
        ],
        pasosFlujo: [],
        validaciones: ['Test valido'],
        gherkinScenario: 'Feature: Test'
      };

      const result = generateCompleteWebHU(request);
      
      // Type-safe pattern: Question<Boolean> with is(Boolean)
      expect(result.output).toContain('implements Question<Boolean>');
      expect(result.output).toContain('is(true)');
      
      // NOT using equalTo() for Boolean (which is less idiomatic)
      expect(result.output).not.toContain('equalTo(true)');
    });
  });

  describe('No lambda expressions', () => {
    it('should never generate lambda expressions with seeThat', () => {
      const apiRequest: ApiHURequest = {
        huId: 'API-HU-LAMBDA',
        nombre: 'Lambda Test',
        urlBase: 'https://api.example.com',
        endpoint: '/test',
        metodo: 'GET',
        headers: [],
        parametros: [],
        esquemaRespuesta: {},
        codigosRespuesta: [],
        validaciones: [],
        flujoTask: [],
        escenarioPrueba: { nombre: 'Test', steps: [], examples: [] }
      };

      const apiResult = generateCompleteApiHU(apiRequest);
      
      // Patterns that should NEVER appear
      expect(apiResult.output).not.toContain('() -> SerenityRest');
      expect(apiResult.output).not.toContain('() -> ');
      expect(apiResult.output).not.toContain('lambda');
      
      const webRequest: WebHURequest = {
        huId: 'WEB-HU-LAMBDA',
        nombre: 'Lambda Test',
        baseUrl: 'https://www.example.com',
        paginas: [
          {
            name: 'Test',
            uiName: 'UITest',
            elements: [{ prefix: 'BTN', name: 'TEST', selector: '#test' }]
          }
        ],
        pasosFlujo: [],
        validaciones: ['Test'],
        gherkinScenario: 'Feature: Test'
      };

      const webResult = generateCompleteWebHU(webRequest);
      
      // Same checks for web
      expect(webResult.output).not.toContain('() ->');
      expect(webResult.output).not.toContain('lambda');
    });
  });
});
