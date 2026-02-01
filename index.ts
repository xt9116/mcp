#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { validateTool, ValidateToolRequest } from './tools/validate-tool.js';
import { generateTool, GenerateToolRequest } from './tools/generate-tool.js';
import { analyzeTool, AnalyzeToolRequest } from './tools/analyze-tool.js';

// Definir las herramientas disponibles
const TOOLS: Tool[] = [
  {
    name: 'validate-code',
    description: 'Valida código Java contra estándares (Java, API, Web, OOP/SOLID)',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Código Java a validar'
        },
        type: {
          type: 'string',
          enum: ['java', 'api', 'web', 'oop-solid'],
          description: 'Tipo de validación a aplicar'
        },
        className: {
          type: 'string',
          description: 'Nombre de la clase (opcional)'
        },
        classType: {
          type: 'string',
          enum: ['Task', 'Interaction', 'Question', 'StepDefinition', 'Model', 'Builder', 'Endpoint', 'UI', 'Page'],
          description: 'Tipo de clase para validación específica'
        }
      },
      required: ['code', 'type']
    }
  },
  {
    name: 'generate-code',
    description: 'Genera código según estándares (estructura de proyecto o HU)',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['api-hu', 'web-hu', 'init-api', 'init-web'],
          description: 'Tipo de generación'
        },
        projectName: {
          type: 'string',
          description: 'Nombre del proyecto (para init)'
        },
        huId: {
          type: 'string',
          description: 'ID de la Historia de Usuario'
        },
        huName: {
          type: 'string',
          description: 'Nombre de la Historia de Usuario'
        },
        baseUrl: {
          type: 'string',
          description: 'URL base de la API o aplicación web'
        },
        endpoint: {
          type: 'string',
          description: 'Endpoint de la API'
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          description: 'Método HTTP'
        },
        responseStructure: {
          type: 'object',
          description: 'Estructura del response esperado'
        },
        validaciones: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de validaciones a implementar'
        },
        paginas: {
          type: 'array',
          items: { type: 'object' },
          description: 'Páginas web con selectores (para Web HU)'
        },
        selectores: {
          type: 'array',
          items: { type: 'object' },
          description: 'Selectores de elementos web'
        }
      },
      required: ['type']
    }
  },
  {
    name: 'analyze-code',
    description: 'Analiza código Java (estructura, calidad, métricas)',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Código Java a analizar'
        },
        analysisType: {
          type: 'string',
          enum: ['structure', 'quality', 'metrics', 'full'],
          description: 'Tipo de análisis',
          default: 'full'
        },
        suggestions: {
          type: 'boolean',
          description: 'Incluir sugerencias de mejora',
          default: true
        }
      },
      required: ['code']
    }
  }
];

// Crear servidor MCP
const server = new Server(
  {
    name: 'java-serenity-standards-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler para listar herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS
  };
});

// Handler para ejecutar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'validate-code':
        const validateResult = await validateTool(args as ValidateToolRequest);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(validateResult, null, 2)
            }
          ]
        };

      case 'generate-code':
        const generateResult = await generateTool(args as GenerateToolRequest);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(generateResult, null, 2)
            }
          ]
        };

      case 'analyze-code':
        const analyzeResult = await analyzeTool(args as AnalyzeToolRequest);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analyzeResult, null, 2)
            }
          ]
        };

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error)
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('🚀 Java Serenity Standards MCP Server iniciado');
  console.error('📋 Herramientas disponibles:');
  TOOLS.forEach(tool => {
    console.error(`   - ${tool.name}: ${tool.description}`);
  });
}

main().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});