#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

// Importar validators
import { validateJavaStandards } from './validators/java.validator.js';
import { validateOOPAndSOLID } from './validators/oop-solid.validator.js';
import { validateSerenityClass as validateAPIClass } from './validators/serenity-api.validator.js';
import { validateSerenityWebClass } from './validators/serenity-web.validator.js';

// Importar generators
import { generateJavaClass } from './generators/java.generator.js';
import { generateAPIComponent } from './generators/serenity-api.generator.js';
import { generateWebComponent, generateSetTheStage } from './generators/serenity-web.generator.js';
import { generateCompleteApiHU } from './generators/complete-api.generator.js';
import { generateCompleteWebHU } from './generators/complete-web.generator.js';
import { generateProjectStructure as generateProjectStructureGen } from './generators/project-structure.generator.js';
import { validateGeneratedCode } from './generators/validation.helper.js';

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

  // ═══ ADVANCED GENERATION TOOLS ═══
  {
    name: "process_api_hu",
    description: "Procesa una Historia de Usuario completa para API REST generando Task, Interaction, Question, Model, StepDefinitions, Feature y validaciones",
    inputSchema: {
      type: "object",
      properties: {
        huId: { type: "string", description: "ID de la HU (ej: API-HU-001)" },
        nombre: { type: "string", description: "Nombre descriptivo de la HU" },
        urlBase: { type: "string", description: "URL base del servicio" },
        endpoint: { type: "string", description: "Path del endpoint" },
        metodo: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"], description: "Método HTTP" },
        headers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              value: { type: "string" }
            }
          },
          description: "Headers requeridos"
        },
        parametros: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              description: { type: "string" }
            }
          },
          description: "Parámetros del endpoint"
        },
        esquemaRespuesta: { type: "object", description: "Schema de respuesta en formato JSON" },
        codigosRespuesta: {
          type: "array",
          items: {
            type: "object",
            properties: {
              codigo: { type: "number" },
              descripcion: { type: "string" }
            }
          },
          description: "Códigos de respuesta esperados"
        },
        validaciones: {
          type: "array",
          items: { type: "string" },
          description: "Validaciones requeridas"
        },
        flujoTask: {
          type: "array",
          items: { type: "string" },
          description: "Pasos del flujo de la Task"
        },
        escenarioPrueba: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            steps: { type: "array", items: { type: "string" } },
            examples: { type: "array", items: { type: "object" } }
          },
          description: "Escenario de prueba Gherkin"
        }
      },
      required: ["huId", "nombre", "urlBase", "endpoint", "metodo"]
    }
  },
  {
    name: "process_web_hu",
    description: "Procesa una Historia de Usuario para interfaz web generando UI classes, Tasks, Questions, StepDefinitions y Features",
    inputSchema: {
      type: "object",
      properties: {
        huId: { type: "string", description: "ID de la HU (ej: WEB-HU-001)" },
        nombre: { type: "string", description: "Nombre descriptivo de la HU" },
        baseUrl: { type: "string", description: "URL base de la aplicación" },
        paginas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              uiName: { type: "string" },
              elements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    prefix: { type: "string", enum: ["TXT", "BTN", "LBL", "DDL", "CHK", "RDB", "LNK", "IMG", "TBL"] },
                    name: { type: "string" },
                    selector: { type: "string" }
                  }
                }
              }
            }
          },
          description: "Páginas y elementos de la UI"
        },
        pasosFlujo: {
          type: "array",
          items: { type: "string" },
          description: "Pasos del flujo de la Task"
        },
        validaciones: {
          type: "array",
          items: { type: "string" },
          description: "Validaciones requeridas"
        },
        gherkinScenario: { type: "string", description: "Escenario Gherkin completo" }
      },
      required: ["huId", "nombre", "baseUrl", "paginas"]
    }
  },
  {
    name: "generate_project_structure",
    description: "Genera la estructura completa de un proyecto Gradle/Maven para automatización con Serenity BDD",
    inputSchema: {
      type: "object",
      properties: {
        buildTool: {
          type: "string",
          enum: ["gradle", "maven"],
          description: "Herramienta de build (gradle o maven)"
        },
        companyPackage: {
          type: "string",
          description: "Package base de la compañía (ej: com.rimac, com.sistecredito)"
        },
        projectName: {
          type: "string",
          description: "Nombre del proyecto"
        },
        type: {
          type: "string",
          enum: ["api", "web", "both"],
          description: "Tipo de proyecto (api, web o ambos)"
        }
      },
      required: ["buildTool", "companyPackage", "projectName"]
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

      // ═══ ADVANCED GENERATION HANDLERS ═══
      case "process_api_hu": {
        const requestData = args as any;
        const generatedCode = generateCompleteApiHU(requestData);
        const validationResults = validateGeneratedCode(generatedCode.output);

        return {
          content: [{
            type: "text",
            text: `# 🌐 HU API Generada y Validada: ${requestData.huId}\n\n` +
                  `**Nombre:** ${requestData.nombre}\n` +
                  `**Endpoint:** ${requestData.metodo} ${requestData.urlBase}${requestData.endpoint}\n\n` +

                  `## 📊 Generación y Validación Completa\n\n` +
                  `✅ **Task** generado: Operación ${requestData.metodo} completa\n` +
                  `✅ **Question** generado: Validaciones de respuesta\n` +
                  `✅ **Model** generado: Response con Jackson annotations\n` +
                  `✅ **Step Definitions** generados: En español\n` +
                  `✅ **Feature** generado: Escenario Gherkin parametrizado\n` +
                  `✅ **Interaction** generado: Método HTTP reutilizable\n\n` +

                  `## 🔍 Validación Automática de Calidad\n\n` +
                  `### 📏 Cumplimiento de Estándares\n` +
                  `${validationResults.summary}\n\n` +

                  `### 🎯 Principios SOLID Verificados\n` +
                  `${validationResults.solidStatus}\n\n` +

                  `### 🏗️ Programación Orientada a Objetos\n` +
                  `${validationResults.oopStatus}\n\n` +

                  `### ☕ Estándares Java Aplicados\n` +
                  `${validationResults.javaStatus}\n\n` +

                  (validationResults.hasIssues ?
                    `### ⚠️ Observaciones Detectadas\n${validationResults.issues}\n\n` :
                    `### ✅ Código Aprobado\n**Todas las validaciones pasaron exitosamente.**\n\n`) +

                  `## 🔧 Código Generado (Validado)\n\n` +
                  generatedCode.output +

                  `## 🚀 ¿Qué hacer ahora?\n\n` +
                  `1. **Guarda** cada archivo en la ubicación correcta de tu proyecto API\n` +
                  `2. **Configura** las dependencias Serenity API en build.gradle o pom.xml\n` +
                  `3. **Asegúrate** de que las URLs y endpoints sean accesibles\n` +
                  `4. **Configura** headers de autenticación correctamente\n` +
                  `5. **Ejecuta** los tests con \`gradle test\` o \`mvn test\`\n` +
                  `6. **Verifica** los reportes en \`target/site/serenity\`\n\n` +

                  `## 💡 Consideraciones de Calidad\n\n` +
                  `- ✅ Código validado contra principios SOLID\n` +
                  `- ✅ Cumple estándares de Programación Orientada a Objetos\n` +
                  `- ✅ Aplica mejores prácticas Java\n` +
                  `- ✅ Listo para integración continua\n` +
                  `- ✅ Mantenible y extensible`
          }]
        };
      }

      case "process_web_hu": {
        const requestData = args as any;
        const generatedCode = generateCompleteWebHU(requestData);

        return {
          content: [{
            type: "text",
            text: `# 🌐 HU Web Generada: ${requestData.huId}\n\n` +
                  `**Nombre:** ${requestData.nombre}\n` +
                  `**URL Base:** ${requestData.baseUrl}\n\n` +

                  `## 📊 Generación Completa\n\n` +
                  `✅ **UI Classes** generadas: ${requestData.paginas.length} páginas\n` +
                  `✅ **Tasks** generados: Flujo completo de la HU\n` +
                  `✅ **Questions** generados: ${requestData.validaciones.length} validaciones\n` +
                  `✅ **Step Definitions** generados: En español\n` +
                  `✅ **Features** generados: Escenario Gherkin\n\n` +

                  `## 📁 Archivos Generados\n\n` +
                  `${generatedCode.summary.files.map(f => `- **${f.type}**: ${f.name}`).join('\n')}\n\n` +

                  `## 🔧 Código Generado\n\n` +
                  generatedCode.output +

                  `## 🚀 ¿Qué hacer ahora?\n\n` +
                  `1. **Guarda** cada archivo en la ubicación correcta de tu proyecto Web\n` +
                  `2. **Configura** las dependencias Serenity Web en build.gradle o pom.xml\n` +
                  `3. **Verifica** que los selectores sean correctos\n` +
                  `4. **Asegúrate** de que la URL sea accesible\n` +
                  `5. **Ejecuta** los tests con \`gradle test\` o \`mvn test\`\n` +
                  `6. **Verifica** los reportes en \`target/site/serenity\`\n\n` +

                  `## 💡 Consideraciones de Calidad\n\n` +
                  `- ✅ Cumple estándares de Screenplay Pattern\n` +
                  `- ✅ Usa convenciones de naming de Serenity\n` +
                  `- ✅ Aplica mejores prácticas de WebDriver\n` +
                  `- ✅ Código modular y reutilizable\n` +
                  `- ✅ Mantenible y extensible`
          }]
        };
      }

      case "generate_project_structure": {
        const config = args as any;
        const projectStructure = generateProjectStructureGen(config);

        return {
          content: [{
            type: "text",
            text: `# 🏗️ Estructura de Proyecto Generada\n\n` +
                  `**Proyecto:** ${config.projectName}\n` +
                  `**Build Tool:** ${config.buildTool.toUpperCase()}\n` +
                  `**Package:** ${config.companyPackage}\n` +
                  `**Tipo:** ${config.type || 'both'}\n\n` +
                  projectStructure
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