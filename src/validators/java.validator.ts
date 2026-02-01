// java.validator.ts - Validador completo para estándares Java
import { validateOOPPrinciples, validateSOLIDPrinciples, validateCodeMetrics } from './oop-solid.validator.js';

interface JavaValidationPayload {
  code?: string;
  className?: string;
  packageName?: string;
  type?: 'class' | 'interface' | 'enum' | 'method';

  // Basic validations
  hasValidPackage?: boolean;
  hasValidClassName?: boolean;
  hasValidMethodNames?: boolean;
  hasValidVariableNames?: boolean;
  hasValidConstants?: boolean;

  // Data types
  usesPrimitivesAppropriately?: boolean;
  usesWrappersCorrectly?: boolean;
  handlesStringsProperly?: boolean;

  // Class design
  hasProperStructure?: boolean;
  hasValidConstructors?: boolean;
  hasValidMethods?: boolean;

  // Advanced
  usesGenericsCorrectly?: boolean;
  usesLambdasAppropriately?: boolean;
  usesStreamsProperly?: boolean;
  handlesConcurrency?: boolean;

  // Quality
  followsSOLID?: boolean;
  hasGoodMetrics?: boolean;
  avoidsAntiPatterns?: boolean;
}

export function validateJavaCode(payload: JavaValidationPayload) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // ═══════════════════════════════════════════════════════════
  // BASIC VALIDATIONS - Naming, Packages, Types
  // ═══════════════════════════════════════════════════════════

  // Package validation
  if (payload.packageName && !payload.hasValidPackage) {
    if (!/^com\.([a-z]+)\.([a-z]+)(\.[a-z]+)*$/.test(payload.packageName)) {
      errors.push("❌ PACKAGE: Nombre de paquete debe seguir patrón com.{company}.{project}.{module}");
    }
    if (payload.packageName.split('.').length > 4) {
      warnings.push("⚠️ PACKAGE: Paquete demasiado profundo (>4 niveles)");
    }
  }

  // Class naming
  if (payload.className && !payload.hasValidClassName) {
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(payload.className)) {
      errors.push("❌ CLASS NAME: Nombre de clase debe ser PascalCase");
    }
    if (payload.className.length > 25) {
      warnings.push("⚠️ CLASS NAME: Nombre de clase demasiado largo (>25 caracteres)");
    }
    const forbiddenWords = ['user', 'data', 'manager', 'handler', 'util'];
    if (forbiddenWords.some(word => payload.className?.toLowerCase().includes(word))) {
      warnings.push(`⚠️ CLASS NAME: Evitar palabras genéricas como ${forbiddenWords.join(', ')}`);
    }
  }

  // Code analysis if available
  if (payload.code) {
    // Method naming validation
    const methodMatches = payload.code.match(/public\s+(?!class|interface)\w+\s+(\w+)\s*\(/g);
    if (methodMatches) {
      methodMatches.forEach(match => {
        const methodName = match.match(/(\w+)\s*\(/)?.[1];
        if (methodName && !/^[a-z][a-zA-Z0-9]*$/.test(methodName)) {
          errors.push(`❌ METHOD NAME: '${methodName}' debe ser camelCase`);
        }
        if (methodName && methodName.length > 15) {
          warnings.push(`⚠️ METHOD NAME: '${methodName}' demasiado largo (>15 caracteres)`);
        }
      });
    }

    // Variable naming validation
    const varMatches = payload.code.match(/(?:private|public|protected)?\s*(?:final\s+)?(?:static\s+)?[A-Z]\w*\s+(\w+)\s*[;=]/g);
    if (varMatches) {
      varMatches.forEach(match => {
        const varName = match.match(/(\w+)\s*[;=]/)?.[1];
        if (varName && !/^[a-z][a-zA-Z0-9]*$/.test(varName) && !/^[A-Z][A-Z_]*$/.test(varName)) {
          warnings.push(`⚠️ VARIABLE NAME: '${varName}' debe ser camelCase o UPPER_SNAKE_CASE`);
        }
      });
    }

    // Constants validation
    const constMatches = payload.code.match(/public\s+static\s+final\s+\w+\s+(\w+)\s*=/g);
    if (constMatches) {
      constMatches.forEach(match => {
        const constName = match.match(/(\w+)\s*=/)?.[1];
        if (constName && !/^[A-Z][A-Z_]*$/.test(constName)) {
          errors.push(`❌ CONSTANT: '${constName}' debe ser UPPER_SNAKE_CASE`);
        }
      });
    }

    // Data types validation
    if (payload.code.includes('float ')) {
      warnings.push("⚠️ DATA TYPES: Preferir double sobre float por precisión");
    }

    if (payload.code.includes('new String(')) {
      warnings.push("⚠️ STRINGS: Evitar 'new String()' - usar literales");
    }

    // Operators validation
    if (payload.code.includes(' == ') && payload.code.includes('String')) {
      warnings.push("⚠️ COMPARISON: Usar equals() para comparar Strings, no ==");
    }

    // String concatenation in loops
    if (payload.code.match(/for\s*\([^)]+\)\s*\{[^}]*\+[^}]*\}/s)) {
      errors.push("❌ PERFORMANCE: String concatenation en loops - usar StringBuilder");
    }

    // Null checks
    const nullChecks = (payload.code.match(/if\s*\(\s*\w+\s*==\s*null\s*\)/g) || []).length;
    if (nullChecks > 3) {
      warnings.push("⚠️ NULL HANDLING: Múltiples null checks - considerar Optional");
    }

    // Exception handling
    if (payload.code.includes('catch (Exception e)')) {
      warnings.push("⚠️ EXCEPTIONS: Evitar catch(Exception) - ser específico");
    }

    if (payload.code.includes('e.printStackTrace()')) {
      warnings.push("⚠️ EXCEPTIONS: No usar printStackTrace() en producción");
    }

    // Collections usage
    if (payload.code.includes('new ArrayList<>()')) {
      const hasCapacity = payload.code.includes('new ArrayList<>(');
      if (!hasCapacity) {
        suggestions.push("💡 COLLECTIONS: Considerar especificar capacidad inicial en ArrayList");
      }
    }

    // Generics validation
    if (payload.code.includes('List ') && !payload.code.includes('List<')) {
      errors.push("❌ GENERICS: Usar generics siempre - no raw types");
    }

    // Lambdas validation
    const lambdaMatches = payload.code.match(/->\s*\{[^}]*\}/g);
    if (lambdaMatches) {
      lambdaMatches.forEach(lambda => {
        const lines = lambda.split('\n').length;
        if (lines > 3) {
          warnings.push("⚠️ LAMBDAS: Lambdas complejas (>3 líneas) - considerar método separado");
        }
      });
    }

    // Streams validation
    if (payload.code.includes('.stream()') && payload.code.includes('.collect(Collectors.toList())')) {
      suggestions.push("💡 STREAMS: Considerar toList() (Java 16+) en lugar de collect(Collectors.toList())");
    }

    // Method size validation
    const methodBodies = payload.code.match(/public\s+\w+\s+\w+\s*\([^)]*\)\s*\{([^}]*)\}/g);
    if (methodBodies) {
      methodBodies.forEach(body => {
        const lines = body.split('\n').length;
        if (lines > 30) {
          errors.push("❌ METHOD SIZE: Método demasiado largo (>30 líneas)");
        } else if (lines > 20) {
          warnings.push("⚠️ METHOD SIZE: Método largo (>20 líneas)");
        }
      });
    }

    // Parameter count validation
    const paramMatches = payload.code.match(/public\s+\w+\s+\w+\s*\(([^)]+)\)/g);
    if (paramMatches) {
      paramMatches.forEach(match => {
        const params = match.match(/,/g);
        const paramCount = params ? params.length + 1 : 0;
        if (paramCount > 5) {
          errors.push("❌ PARAMETERS: Método con demasiados parámetros (>5)");
        }
      });
    }

    // Class size validation
    const totalLines = payload.code.split('\n').length;
    if (totalLines > 500) {
      errors.push("❌ CLASS SIZE: Clase demasiado grande (>500 líneas)");
    } else if (totalLines > 300) {
      warnings.push("⚠️ CLASS SIZE: Clase grande (>300 líneas)");
    }

    // SOLID violations detection
    const methodCount = (payload.code.match(/public\s+(?!class|interface)\w+\s+\w+\s*\(/g) || []).length;
    if (methodCount > 10) {
      warnings.push("⚠️ SOLID SRP: Clase con muchos métodos públicos (>10) - posible violación SRP");
    }

    if (payload.code.includes('new ') && !payload.code.includes('private') && payload.code.includes('class')) {
      const newCount = (payload.code.match(/new\s+\w+\(/g) || []).length;
      if (newCount > 2) {
        warnings.push("⚠️ SOLID DIP: Múltiples 'new' detectados - considerar inyección de dependencias");
      }
    }

    // Code smells
    if (payload.code.includes('if') && payload.code.includes('else if')) {
      const elseIfCount = (payload.code.match(/else\s+if/g) || []).length;
      if (elseIfCount > 2) {
        warnings.push("⚠️ CODE SMELL: Cadena larga de if-else - considerar Strategy pattern");
      }
    }

    const commentLines = (payload.code.match(/^\s*\/\//gm) || []).length;
    const codeLines = payload.code.split('\n').filter(line => line.trim().length > 0 && !line.trim().startsWith('//')).length;
    if (commentLines > codeLines * 0.5) {
      warnings.push("⚠️ CODE SMELL: Demasiados comentarios - código debería ser autoexplicativo");
    }
  }

  // ═══════════════════════════════════════════════════════════
  // INTEGRATE OOP/SOLID VALIDATIONS
  // ═══════════════════════════════════════════════════════════

  const oopPayload = {
    code: payload.code,
    className: payload.className,
    linesOfCode: payload.code ? payload.code.split('\n').length : undefined,
    methodCount: payload.code ? (payload.code.match(/public\s+(?!class|interface)\w+\s+\w+\s*\(/g) || []).length : undefined
  };

  const oopValidation = validateOOPPrinciples(oopPayload);
  const solidValidation = validateSOLIDPrinciples(oopPayload);
  const metricsValidation = validateCodeMetrics(oopPayload);

  errors.push(...oopValidation.errors, ...solidValidation.errors, ...metricsValidation.errors);
  warnings.push(...oopValidation.warnings, ...solidValidation.warnings, ...metricsValidation.warnings);
  suggestions.push(...oopValidation.suggestions, ...solidValidation.suggestions);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    summary: {
      totalIssues: errors.length + warnings.length + suggestions.length,
      criticalIssues: errors.length,
      warnings: warnings.length,
      suggestions: suggestions.length
    },
    validations: {
      basic: {
        naming: !errors.some(e => e.includes('NAME') || e.includes('PACKAGE')),
        types: !warnings.some(w => w.includes('DATA TYPES') || w.includes('STRINGS')),
        operators: !warnings.some(w => w.includes('COMPARISON'))
      },
      intermediate: {
        structure: !errors.some(e => e.includes('CLASS SIZE') || e.includes('METHOD SIZE')),
        exceptions: !warnings.some(w => w.includes('EXCEPTIONS')),
        collections: !suggestions.some(s => s.includes('COLLECTIONS'))
      },
      advanced: {
        generics: !errors.some(e => e.includes('GENERICS')),
        functional: !warnings.some(w => w.includes('LAMBDAS') || w.includes('STREAMS')),
        concurrency: !warnings.some(w => w.includes('Thread'))
      },
      quality: {
        solid: solidValidation.valid,
        cleanCode: !errors.some(e => e.includes('SOLID') || e.includes('CODE SMELL')),
        performance: !warnings.some(w => w.includes('PERFORMANCE'))
      }
    }
  };
}

// Helper functions
function extractClassName(code: string): string | null {
  const match = code.match(/class\s+(\w+)/);
  return match ? match[1] : null;
}

function validateMethodNames(code: string): boolean {
  const methods = code.match(/public\s+(?!class|interface)\w+\s+(\w+)\s*\(/g) || [];
  return methods.every(method => {
    const match = method.match(/(\w+)\s*\(/);
    const name = match ? match[1] : '';
    return name ? /^[a-z][a-zA-Z0-9]*$/.test(name) : false;
  });
}

function validateVariableNames(code: string): boolean {
  const variables = code.match(/(?:private|public|protected)?\s*(?:final\s+)?(?:static\s+)?[A-Z]\w*\s+(\w+)\s*[;=]/g) || [];
  return variables.every(variable => {
    const match = variable.match(/(\w+)\s*[;=]/);
    const name = match ? match[1] : '';
    return name ? /^[a-z][a-zA-Z0-9]*$/.test(name) || /^[A-Z][A-Z_]*$/.test(name) : false;
  });
}

function validateConstants(code: string): boolean {
  const constants = code.match(/public\s+static\s+final\s+\w+\s+(\w+)\s*=/g) || [];
  return constants.every(constant => {
    const match = constant.match(/(\w+)\s*=/);
    const name = match ? match[1] : '';
    return name ? /^[A-Z][A-Z_]*$/.test(name) : false;
  });
}

function validateClassStructure(code: string): boolean {
  const hasConstants = code.includes('static final');
  const hasFields = !!(code.match(/(?:private|public|protected)\s+(?!static|final)\w+\s+\w+\s*;/));
  const hasConstructors = code.includes('public ') && code.includes('(') && code.includes('{');
  const hasMethods = !!(code.match(/public\s+(?!class|interface)\w+\s+\w+\s*\(/));

  return hasConstants || hasFields || hasConstructors || hasMethods;
}

function validateConstructors(code: string): boolean {
  const constructors = code.match(/public\s+(\w+)\s*\([^)]*\)\s*\{/g) || [];
  return constructors.every(constructor => {
    const className = extractClassName(code);
    const constructorName = constructor.match(/public\s+(\w+)/)?.[1];
    return constructorName === className;
  });
}

function validateMethods(code: string): boolean {
  const methods = code.match(/public\s+(?!class|interface)\w+\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\}/g) || [];
  return methods.every(method => {
    const body = method.match(/\{([^}]*)\}/)?.[1] || '';
    const lines = body.split('\n').length;
    return lines <= 30;
  });
}

function validateLambdas(code: string): boolean {
  const lambdas = code.match(/->\s*\{[^}]*\}/g) || [];
  return lambdas.every(lambda => {
    const lines = lambda.split('\n').length;
    return lines <= 3;
  });
}

function validateStreams(code: string): boolean {
  if (!code.includes('.stream()')) return true;
  const hasCollect = code.includes('.collect(');
  const hasForEach = code.includes('.forEach(');
  const hasTerminal = hasCollect || hasForEach || code.includes('.count()') || code.includes('.anyMatch(');
  return hasTerminal;
}

function validateSOLIDCompliance(code: string): boolean {
  const hasInterface = code.includes('interface') || code.includes('implements');
  const hasMultipleMethods = (code.match(/public\s+(?!class|interface)\w+\s+\w+\s*\(/g) || []).length > 1;
  const hasNewInstances = (code.match(/new\s+\w+\(/g) || []).length > 2;
  return hasInterface && !hasMultipleMethods || !hasNewInstances;
}

function validateMetrics(code: string): boolean {
  const lines = code.split('\n').length;
  const methods = (code.match(/public\s+(?!class|interface)\w+\s+\w+\s*\(/g) || []).length;
  return lines <= 500 && methods <= 10;
}

function hasAntiPatterns(code: string): boolean {
  return code.includes('catch (Exception e) {}') ||
         code.includes('System.out.println') ||
         code.includes('String + ') && code.includes('for ');
}

// Main validation function
export function validateJavaStandards(code: string, type: 'class' | 'interface' | 'enum' | 'method' = 'class') {
  const payload: JavaValidationPayload = {
    code,
    type,
    className: extractClassName(code) || undefined,
    packageName: code.match(/package\s+([\w.]+);/)?.[1],
    hasValidPackage: code.includes('package com.'),
    hasValidClassName: /^[A-Z][a-zA-Z0-9]*$/.test(extractClassName(code) || ''),
    hasValidMethodNames: validateMethodNames(code),
    hasValidVariableNames: validateVariableNames(code),
    hasValidConstants: validateConstants(code),
    usesPrimitivesAppropriately: !code.includes('new Integer('),
    usesWrappersCorrectly: !code.includes('int = null'),
    handlesStringsProperly: !code.includes('==') || !code.includes('String'),
    hasProperStructure: validateClassStructure(code),
    hasValidConstructors: validateConstructors(code),
    hasValidMethods: validateMethods(code),
    usesGenericsCorrectly: !code.includes('List ') || code.includes('List<'),
    usesLambdasAppropriately: validateLambdas(code),
    usesStreamsProperly: validateStreams(code),
    handlesConcurrency: !code.includes('synchronized') || code.includes('private final Object'),
    followsSOLID: validateSOLIDCompliance(code),
    hasGoodMetrics: validateMetrics(code),
    avoidsAntiPatterns: !hasAntiPatterns(code)
  };

  return validateJavaCode(payload);
}