// Test for package name feature in HU generators
import { generateCompleteApiHU } from '../src/generators/complete-api.generator.js';
import { generateCompleteWebHU } from '../src/generators/complete-web.generator.js';
import type { ApiHURequest, WebHURequest } from '../src/generators/types.js';

describe('Package Name Structure Fix', () => {
  describe('API User Story Generator', () => {
    it('should use provided packageName for all components', () => {
      const request: ApiHURequest = {
        huId: 'API-HU-001',
        nombre: 'ObtenerPersonaje',
        urlBase: 'https://rickandmortyapi.com/api',
        endpoint: '/character/1',
        metodo: 'GET',
        headers: [],
        parametros: [],
        esquemaRespuesta: {},
        codigosRespuesta: [{ codigo: 200, descripcion: 'OK' }],
        validaciones: [],
        flujoTask: [],
        escenarioPrueba: {
          nombre: 'Test',
          steps: [],
          examples: []
        },
        packageName: 'co.com.rickandmorty'
      };

      const result = generateCompleteApiHU(request);

      // Verify step definitions use the correct package
      expect(result.output).toContain('package co.com.rickandmorty.stepdefinitions;');
      
      // Verify other components also use the correct package
      expect(result.output).toContain('package co.com.rickandmorty.tasks;');
      expect(result.output).toContain('package co.com.rickandmorty.questions;');
      expect(result.output).toContain('package co.com.rickandmorty.models;');
      expect(result.output).toContain('package co.com.rickandmorty.endpoints;');
      expect(result.output).toContain('package co.com.rickandmorty.interactions;');
      expect(result.output).toContain('package co.com.rickandmorty.builders;');
      expect(result.output).toContain('package co.com.rickandmorty.hooks;');
      expect(result.output).toContain('package co.com.rickandmorty.runners;');

      // Verify imports also use the correct package
      expect(result.output).toContain('import co.com.rickandmorty.tasks.*');
      expect(result.output).toContain('import co.com.rickandmorty.questions.*');
      expect(result.output).toContain('import co.com.rickandmorty.builders.*');
      expect(result.output).toContain('import co.com.rickandmorty.models.*');

      // Verify Runner glue configuration uses correct package
      expect(result.output).toContain('glue = {"co.com.rickandmorty.stepdefinitions", "co.com.rickandmorty.hooks"}');
    });

    it('should use default package when packageName is not provided', () => {
      const request: ApiHURequest = {
        huId: 'API-HU-001',
        nombre: 'ObtenerPersonaje',
        urlBase: 'https://rickandmortyapi.com/api',
        endpoint: '/character/1',
        metodo: 'GET',
        headers: [],
        parametros: [],
        esquemaRespuesta: {},
        codigosRespuesta: [{ codigo: 200, descripcion: 'OK' }],
        validaciones: [],
        flujoTask: [],
        escenarioPrueba: {
          nombre: 'Test',
          steps: [],
          examples: []
        }
        // No packageName provided
      };

      const result = generateCompleteApiHU(request);

      // Verify it uses default package
      expect(result.output).toContain('package com.screenplay.api.stepdefinitions;');
      expect(result.output).toContain('package com.screenplay.api.tasks;');
      expect(result.output).toContain('package com.screenplay.api.questions;');
    });

    it('should NOT add extra path segments like /api/ to stepdefinitions', () => {
      const request: ApiHURequest = {
        huId: 'API-HU-001',
        nombre: 'ObtenerPersonaje',
        urlBase: 'https://rickandmortyapi.com/api',
        endpoint: '/character/1',
        metodo: 'GET',
        headers: [],
        parametros: [],
        esquemaRespuesta: {},
        codigosRespuesta: [{ codigo: 200, descripcion: 'OK' }],
        validaciones: [],
        flujoTask: [],
        escenarioPrueba: {
          nombre: 'Test',
          steps: [],
          examples: []
        },
        packageName: 'co.com.rickandmorty'
      };

      const result = generateCompleteApiHU(request);

      // Verify it does NOT contain the wrong package path
      expect(result.output).not.toContain('package co.com.rickandmorty.api.stepdefinitions');
      expect(result.output).not.toContain('package com.sistecredito.api.stepdefinitions');
      
      // Verify it DOES contain the correct package path
      expect(result.output).toContain('package co.com.rickandmorty.stepdefinitions;');
    });
  });

  describe('Web User Story Generator', () => {
    it('should use provided packageName for all components', () => {
      const request: WebHURequest = {
        huId: 'WEB-HU-001',
        nombre: 'BuscarProductos',
        baseUrl: 'https://example.com',
        paginas: [
          {
            name: 'Home',
            uiName: 'UIHome',
            elements: [
              { prefix: 'TXT', name: 'BUSCAR', selector: '#search' }
            ]
          }
        ],
        pasosFlujo: ['Abrir navegador', 'Buscar producto'],
        validaciones: ['Resultados visibles'],
        gherkinScenario: 'Scenario: Buscar productos',
        packageName: 'co.com.rickandmorty'
      };

      const result = generateCompleteWebHU(request);

      // Verify step definitions use the correct package
      expect(result.output).toContain('package co.com.rickandmorty.stepdefinitions;');
      
      // Verify other components also use the correct package
      expect(result.output).toContain('package co.com.rickandmorty.userinterfaces;');
      expect(result.output).toContain('package co.com.rickandmorty.tasks;');
      expect(result.output).toContain('package co.com.rickandmorty.questions;');
      expect(result.output).toContain('package co.com.rickandmorty.hooks;');
      expect(result.output).toContain('package co.com.rickandmorty.runners;');

      // Verify imports also use the correct package
      expect(result.output).toContain('import co.com.rickandmorty.tasks.*');
      expect(result.output).toContain('import co.com.rickandmorty.questions.*');

      // Verify Runner glue configuration uses correct package
      expect(result.output).toContain('glue = {"co.com.rickandmorty.stepdefinitions", "co.com.rickandmorty.hooks"}');
    });

    it('should use default package when packageName is not provided', () => {
      const request: WebHURequest = {
        huId: 'WEB-HU-001',
        nombre: 'BuscarProductos',
        baseUrl: 'https://example.com',
        paginas: [
          {
            name: 'Home',
            uiName: 'UIHome',
            elements: [
              { prefix: 'TXT', name: 'BUSCAR', selector: '#search' }
            ]
          }
        ],
        pasosFlujo: ['Abrir navegador'],
        validaciones: ['Resultados'],
        gherkinScenario: 'Scenario: Buscar'
        // No packageName provided
      };

      const result = generateCompleteWebHU(request);

      // Verify it uses default package
      expect(result.output).toContain('package com.screenplay.web.stepdefinitions;');
      expect(result.output).toContain('package com.screenplay.web.tasks;');
      expect(result.output).toContain('package com.screenplay.web.questions;');
    });

    it('should NOT add extra path segments to stepdefinitions', () => {
      const request: WebHURequest = {
        huId: 'WEB-HU-001',
        nombre: 'BuscarProductos',
        baseUrl: 'https://example.com',
        paginas: [
          {
            name: 'Home',
            uiName: 'UIHome',
            elements: [
              { prefix: 'TXT', name: 'BUSCAR', selector: '#search' }
            ]
          }
        ],
        pasosFlujo: [],
        validaciones: [],
        gherkinScenario: '',
        packageName: 'co.com.rickandmorty'
      };

      const result = generateCompleteWebHU(request);

      // Verify it does NOT contain the wrong package path
      expect(result.output).not.toContain('package co.com.rickandmorty.web.stepdefinitions');
      expect(result.output).not.toContain('package com.sistecredito.web.stepdefinitions');
      
      // Verify it DOES contain the correct package path
      expect(result.output).toContain('package co.com.rickandmorty.stepdefinitions;');
    });
  });

  describe('Package naming conventions', () => {
    it('should support different package naming styles', () => {
      const testCases = [
        'com.company',
        'co.com.company',
        'org.example',
        'io.github.project',
        'com.company.subdomain.project'
      ];

      testCases.forEach(packageName => {
        const request: ApiHURequest = {
          huId: 'API-HU-001',
          nombre: 'Test',
          urlBase: 'http://api.test',
          endpoint: '/test',
          metodo: 'GET',
          headers: [],
          parametros: [],
          esquemaRespuesta: {},
          codigosRespuesta: [],
          validaciones: [],
          flujoTask: [],
          escenarioPrueba: { nombre: '', steps: [], examples: [] },
          packageName
        };

        const result = generateCompleteApiHU(request);
        expect(result.output).toContain(`package ${packageName}.stepdefinitions;`);
        expect(result.output).toContain(`package ${packageName}.tasks;`);
      });
    });
  });
});
