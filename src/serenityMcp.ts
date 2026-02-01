#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Importar validators
import { validateJavaStandards } from './validators/java.validator.js';
import { validateOOPAndSOLID } from './validators/oop-solid.validator.js';
import { validateSerenityClass as validateAPIClass } from './validators/serenity-api.validator.js';
import { validateSerenityWebClass } from './validators/serenity-web.validator.js';

// Importar generators
import { generateJavaClass, generatePOJO, generateBuilder } from './generators/java.generator.js';
import { generateAPIComponent } from './generators/serenity-api.generator.js';
import { generateWebComponent, generateSetTheStage } from './generators/serenity-web.generator.js';

// Importar estándares
import * as javaStandard from './standards/java.standard.json';
import * as oopSolidStandard from './standards/oop-solid.standard.json';
import * as apiStandard from './standards/serenity-api-screenplay.standard.json';
import * as webStandard from './standards/serenity-web-screenplay.standard.json';

const server = new Server(
  {
    name: "serenity-automation-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ═══════════════════════════════════════════════════════════
// DEFINICIÓN DE TOOLS
// ═══════════════════════════════════════════════════════════

const tools: Tool[] = [
  // ═══ JAVA TOOLS ═══
  {
    name: "validate_java_code",
    description: "Valida código Java contra estándares (naming, types, structure, SOLID, OOP)",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Código Java a validar"
        },
        type: {
          type: "string",
          enum: ["class", "interface", "enum", "method"],
          description: "Tipo de código a validar"
        },
        analysisType: {
          type: "string",
          enum: ["basic", "oop", "solid", "full"],
          description: "Tipo de análisis a realizar"
        }
      },
      required: ["code"]
    }
  },
  {
    name: "generate_java_class",
    description: "Genera una clase Java completa con campos, métodos, constructores",
    inputSchema: {
      type: "object",
      properties: {
        className: { type: "string" },
        packageName: { type: "string" },
        type: { type: "string", enum: ["class", "interface", "enum"] },
        fields: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              visibility: { type: "string", enum: ["private", "public", "protected"] }
            }
          }
        }
      },
      required: ["className", "packageName"]
    }
  },

  // ═══ SERENITY API TOOLS ═══
  {
    name: "generate_api_task",
    description: "Genera un Task de Serenity para API REST (acción de negocio)",
    inputSchema: {
      type: "object",
      properties: {
        className: { type: "string" },
        packageName: { type: "string" },
        httpMethod: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
        endpoint: { type: "string" }
      },
      required: ["className", "packageName"]
    }
  },
  {
    name: "generate_api_interaction",
    description: "Genera una Interaction de Serenity para API (acción HTTP reutilizable)",
    inputSchema: {
      type: "object",
      properties: {
        className: { type: "string" },
        packageName: { type: "string" },
        httpMethod: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] }
      },
      required: ["className", "packageName", "httpMethod"]
    }
  },
  {
    name: "generate_api_question",
    description: "Genera una Question de Serenity para API (validación que retorna valor)",
    inputSchema: {
      type: "object",
      properties: {
        className: { type: "string" },
        packageName: { type: "string" },
        returnType: { type: "string", description: "Tipo de retorno: Integer, String, Boolean, etc." }
      },
      required: ["className", "packageName"]
    }
  },
  {
    name: "generate_api_model",
    description: "Genera un Model (POJO) para Request/Response de API",
    inputSchema: {
      type: "object",
      properties: {
        className: { type: "string" },
        packageName: { type: "string" },
        fields: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              jsonProperty: { type: "string" }
            }
          }
        }
      },
      required: ["className", "packageName", "fields"]
    }
  },
  {
    name: "validate_api_component",
    description: "Valida un componente de Serenity API contra los estándares",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        type: { type: "string", enum: ["Task", "Interaction", "Question", "Model", "Builder", "Endpoint"] }
      },
      required: ["code", "type"]
    }
  },

  // ═══ SERENITY WEB TOOLS ═══
  {
    name: "generate_web_ui",
    description: "Genera una clase UI con Target locators para elementos web",
    inputSchema: {
      type: "object",
      properties: {
        className: { type: "string" },
        packageName: { type: "string" },
        baseUrl: { type: "string" },
        targets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              selector: { type: "string" },
              description: { type: "string" },
              strategy: { type: "string", enum: ["id", "name", "cssSelector", "xpath"] }
            }
          }
        }
      },
      required: ["className", "packageName"]
    }
  },
  {
    name: "generate_web_task",
    description: "Genera un Task de Serenity para Web UI (acción sobre la UI)",
    inputSchema: {
      type: "object",
      properties: {
        className: { type: "string" },
        packageName: { type: "string" }
      },
      required: ["className", "packageName"]
    }
  },
  {
    name: "generate_web_question",
    description: "Genera una Question de Serenity para Web (validación visual)",
    inputSchema: {
      type: "object",
      properties: {
        className: { type: "string" },
        packageName: { type: "string" }
      },
      required: ["className", "packageName"]
    }
  },
  {
    name: "generate_set_the_stage",
    description: "Genera la clase SetTheStage (OBLIGATORIA) para configurar OnStage",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "validate_web_component",
    description: "Valida un componente de Serenity Web contra los estándares",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        type: { type: "string", enum: ["Task", "Interaction", "Question", "UI", "Page", "StepDefinition"] }
      },
      required: ["code", "type"]
    }
  },

  // ═══ STANDARDS TOOLS ═══
  {
    name: "get_standard",
    description: "Obtiene un estándar completo (Java, OOP/SOLID, Serenity API o Web)",
    inputSchema: {
      type: "object",
      properties: {
        standard: {
          type: "string",
          enum: ["java", "oop-solid", "serenity-api", "serenity-web"],
          description: "Estándar a recuperar"
        }
      },
      required: ["standard"]
    }
  }
];

// ═══════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // ═══ JAVA HANDLERS ═══
      case "validate_java_code": {
        const { code, type = 'class', analysisType = 'full' } = args as any;
        
        if (analysisType === 'full' || analysisType === 'oop' || analysisType === 'solid') {
          const result = validateOOPAndSOLID(code, analysisType);
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result, null, 2)
            }]
          };
        } else {
          const result = validateJavaStandards(code, type);
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result, null, 2)
            }]
          };
        }
      }

      case "generate_java_class": {
        const config = args as any;
        const generatedCode = generateJavaClass(config);
        return {
          content: [{
            type: "text",
            text: generatedCode
          }]
        };
      }

      // ═══ API HANDLERS ═══
      case "generate_api_task": {
        const config = {
          componentType: 'Task' as const,
          ...args as any
        };
        const generatedCode = generateAPIComponent(config);
        return {
          content: [{
            type: "text",
            text: generatedCode
          }]
        };
      }

      case "generate_api_interaction": {
        const config = {
          componentType: 'Interaction' as const,
          ...args as any
        };
        const generatedCode = generateAPIComponent(config);
        return {
          content: [{
            type: "text",
            text: generatedCode
          }]
        };
      }

      case "generate_api_question": {
        const config = {
          componentType: 'Question' as const,
          ...args as any
        };
        const generatedCode = generateAPIComponent(config);
        return {
          content: [{
            type: "text",
            text: generatedCode
          }]
        };
      }

      case "generate_api_model": {
        const config = {
          componentType: 'Model' as const,
          ...args as any
        };
        const generatedCode = generateAPIComponent(config);
        return {
          content: [{
            type: "text",
            text: generatedCode
          }]
        };
      }

      case "validate_api_component": {
        const { code, type } = args as any;
        const result = validateAPIClass(code, type);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }

      // ═══ WEB HANDLERS ═══
      case "generate_web_ui": {
        const config = {
          componentType: 'UI' as const,
          ...args as any
        };
        const generatedCode = generateWebComponent(config);
        return {
          content: [{
            type: "text",
            text: generatedCode
          }]
        };
      }

      case "generate_web_task": {
        const config = {
          componentType: 'Task' as const,
          ...args as any
        };
        const generatedCode = generateWebComponent(config);
        return {
          content: [{
            type: "text",
            text: generatedCode
          }]
        };
      }

      case "generate_web_question": {
        const config = {
          componentType: 'Question' as const,
          ...args as any
        };
        const generatedCode = generateWebComponent(config);
        return {
          content: [{
            type: "text",
            text: generatedCode
          }]
        };
      }

      case "generate_set_the_stage": {
        const generatedCode = generateSetTheStage();
        return {
          content: [{
            type: "text",
            text: generatedCode
          }]
        };
      }

      case "validate_web_component": {
        const { code, type } = args as any;
        const result = validateSerenityWebClass(type, code);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      }

      // ═══ STANDARDS HANDLER ═══
      case "get_standard": {
        const { standard } = args as any;
        let standardData;
        
        switch (standard) {
          case 'java':
            standardData = javaStandard;
            break;
          case 'oop-solid':
            standardData = oopSolidStandard;
            break;
          case 'serenity-api':
            standardData = apiStandard;
            break;
          case 'serenity-web':
            standardData = webStandard;
            break;
          default:
            throw new Error(`Unknown standard: ${standard}`);
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(standardData, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Serenity Automation MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});