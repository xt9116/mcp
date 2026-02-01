import { validateJavaStandards } from '../validators/java.validator.js';
import { validateSerenityApi, validateSerenityClass } from '../validators/serenity-api.validator.js';
import { validateSerenityWeb, validateSerenityWebClass } from '../validators/serenity-web.validator.js';
import { validateOOPAndSOLID } from '../validators/oop-solid.validator.js';

interface ValidateToolRequest {
  code: string;
  type: 'java' | 'api' | 'web' | 'oop-solid';
  className?: string;
  classType?: 'Task' | 'Interaction' | 'Question' | 'StepDefinition' | 'Model' | 'Builder' | 'Endpoint' | 'UI' | 'Page';
}

export async function validateTool(request: ValidateToolRequest) {
  const { code, type, className, classType } = request;

  if (!code || code.trim().length === 0) {
    return {
      success: false,
      error: "Código vacío - proporciona código Java para validar"
    };
  }

  try {
    let validationResult;

    switch (type) {
      case 'java':
        validationResult = validateJavaStandards(code, 'class');
        break;

      case 'api':
        if (classType) {
          validationResult = validateSerenityClass(code, classType);
        } else {
          return {
            success: false,
            error: "Para validar código API, especifica el classType (Task, Interaction, Question, etc.)"
          };
        }
        break;

      case 'web':
        if (classType) {
          validationResult = validateSerenityWebClass(classType, code, className);
        } else {
          return {
            success: false,
            error: "Para validar código Web, especifica el classType (Task, Interaction, Question, UI, etc.)"
          };
        }
        break;

      case 'oop-solid':
        validationResult = validateOOPAndSOLID(code, 'both');
        break;

      default:
        return {
          success: false,
          error: `Tipo de validación desconocido: ${type}. Usa: java, api, web, oop-solid`
        };
    }

    return {
      success: validationResult.valid,
      validation: validationResult,
      summary: generateValidationSummary(validationResult)
    };

  } catch (error) {
    return {
      success: false,
      error: `Error durante validación: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function generateValidationSummary(result: any): string {
  const lines: string[] = [];
  
  lines.push("═══════════════════════════════════════════════");
  lines.push("📋 RESUMEN DE VALIDACIÓN");
  lines.push("═══════════════════════════════════════════════\n");

  if (result.valid) {
    lines.push("✅ CÓDIGO VÁLIDO - Cumple con todos los estándares\n");
  } else {
    lines.push("❌ CÓDIGO INVÁLIDO - Se encontraron problemas\n");
  }

  if (result.errors && result.errors.length > 0) {
    lines.push(`🔴 ERRORES CRÍTICOS (${result.errors.length}):`);
    result.errors.forEach((error: string) => lines.push(`   ${error}`));
    lines.push("");
  }

  if (result.warnings && result.warnings.length > 0) {
    lines.push(`⚠️  ADVERTENCIAS (${result.warnings.length}):`);
    result.warnings.forEach((warning: string) => lines.push(`   ${warning}`));
    lines.push("");
  }

  if (result.suggestions && result.suggestions.length > 0) {
    lines.push(`💡 SUGERENCIAS (${result.suggestions.length}):`);
    result.suggestions.forEach((suggestion: string) => lines.push(`   ${suggestion}`));
    lines.push("");
  }

  if (result.summary) {
    lines.push("📊 ESTADÍSTICAS:");
    lines.push(`   Total de issues: ${result.summary.totalIssues || 0}`);
    lines.push(`   Críticos: ${result.summary.criticalIssues || 0}`);
    lines.push(`   Advertencias: ${result.summary.warnings || result.warnings?.length || 0}`);
    lines.push(`   Sugerencias: ${result.summary.suggestions || result.suggestions?.length || 0}`);
  }

  lines.push("\n═══════════════════════════════════════════════");

  return lines.join('\n');
}

export { ValidateToolRequest };