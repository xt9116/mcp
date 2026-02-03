// oop-solid.validator.ts
// Validador completo para Programación Orientada a Objetos y Principios SOLID

interface OOPValidationPayload {
  code?: string;
  className?: string;

  // Validaciones de OOP
  hasPublicFields?: boolean;
  exposesInternalCollections?: boolean;
  hasProperEncapsulation?: boolean;
  usesAbstraction?: boolean;
  inheritanceDepth?: number;
  usesPolymorphism?: boolean;
  hasExcessiveInstanceof?: boolean;

  // Validaciones SOLID
  hasMultipleResponsibilities?: boolean;
  responsibilityCount?: number;
  isClosedForModification?: boolean;
  violatesLSP?: boolean;
  hasFatInterface?: boolean;
  interfaceMethodCount?: number;
  usesConcreteTypes?: boolean;
  hasDependencyInjection?: boolean;

  // Métricas
  linesOfCode?: number;
  methodCount?: number;
  parameterCount?: number;
  cyclomaticComplexity?: number;
  couplingLevel?: number;

  // Tipo de análisis
  analysisType?: 'class' | 'interface' | 'method' | 'full';
}

export function validateOOPPrinciples(payload: OOPValidationPayload) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // ═══════════════════════════════════════════════════════════
  // VALIDACIONES DE ENCAPSULACIÓN
  // ═══════════════════════════════════════════════════════════

  if (payload.hasPublicFields) {
    errors.push('❌ ENCAPSULACIÓN: No usar campos públicos - usar private con getters/setters');
  }

  if (payload.exposesInternalCollections) {
    errors.push('❌ ENCAPSULACIÓN: No exponer colecciones mutables directamente - retornar copias inmutables');
  }

  if (payload.code && payload.code.includes('public ') &&
      (payload.code.match(/public\s+\w+\s+\w+;/g)?.length || 0) > 0) {
    errors.push('❌ ENCAPSULACIÓN: Detectados campos públicos en el código');
  }

  // ═══════════════════════════════════════════════════════════
  // VALIDACIONES DE ABSTRACCIÓN
  // ═══════════════════════════════════════════════════════════

  if (!payload.usesAbstraction && payload.analysisType === 'class') {
    warnings.push('⚠️ ABSTRACCIÓN: Considerar usar interfaces o clases abstractas para mejor diseño');
  }

  if (payload.parameterCount && payload.parameterCount > 4) {
    errors.push('❌ ABSTRACCIÓN: Método con demasiados parámetros (>4) - considerar objeto parameter');
  }

  // ═══════════════════════════════════════════════════════════
  // VALIDACIONES DE HERENCIA
  // ═══════════════════════════════════════════════════════════

  if (payload.inheritanceDepth && payload.inheritanceDepth > 3) {
    errors.push('❌ HERENCIA: Jerarquía demasiado profunda (>3 niveles) - considerar composición');
  }

  if (payload.code && payload.code.includes('extends') && payload.code.includes('class')) {
    const classMatch = payload.code.match(/class\s+(\w+)\s+extends\s+(\w+)/);
    if (classMatch) {
      suggestions.push(`💡 HERENCIA: Verificar que ${classMatch[1]} realmente ES-UN ${classMatch[2]}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // VALIDACIONES DE POLIMORFISMO
  // ═══════════════════════════════════════════════════════════

  if (payload.hasExcessiveInstanceof) {
    errors.push('❌ POLIMORFISMO: Uso excesivo de instanceof - usar polimorfismo en su lugar');
  }

  if (payload.code && (payload.code.match(/instanceof/g)?.length || 0) > 2) {
    errors.push('❌ POLIMORFISMO: Múltiples instanceof detectados - refactorizar usando polimorfismo');
  }

  if (payload.code && payload.code.includes('if') && payload.code.includes('instanceof')) {
    warnings.push('⚠️ POLIMORFISMO: Condicionales con instanceof - considerar Strategy Pattern');
  }

  // ═══════════════════════════════════════════════════════════
  // VALIDACIONES DE CODE SMELLS
  // ═══════════════════════════════════════════════════════════

  if (payload.code) {
    // Long Method
    const methodMatches = payload.code.match(/public\s+\w+\s+\w+\([^)]*\)\s*\{[^}]*\}/g);
    if (methodMatches) {
      methodMatches.forEach(method => {
        const lines = method.split('\n').length;
        if (lines > 20) {
          errors.push('❌ CODE SMELL: Método demasiado largo (>20 líneas)');
        }
      });
    }

    // Long Parameter List
    const paramMatches = payload.code.match(/public\s+\w+\s+\w+\(([^)]+)\)/g);
    if (paramMatches) {
      paramMatches.forEach(match => {
        const paramCount = (match.match(/,/g) || []).length + 1;
        if (paramCount > 4) {
          errors.push('❌ CODE SMELL: Método con demasiados parámetros (>4)');
        }
      });
    }

    // Data Class (solo getters/setters)
    const getterSetterCount = (payload.code.match(/(get|set|is)\w+\(/g) || []).length;
    const totalMethods = (payload.code.match(/public\s+(?!class)\w+\s+\w+\(/g) || []).length;
    if (totalMethods > 0 && getterSetterCount / totalMethods > 0.8 && totalMethods > 3) {
      warnings.push('⚠️ CODE SMELL: Posible Data Class - demasiados getters/setters');
    }

    // Primitive Obsession
    const primitiveFields = (payload.code.match(/private\s+(String|int|double|boolean|long|float)\s+\w+;/g) || []).length;
    if (primitiveFields > 5) {
      warnings.push('⚠️ CODE SMELL: Posible Primitive Obsession - muchos campos primitivos');
    }

    // Feature Envy
    const externalCalls = (payload.code.match(/\w+\.get\w+\(\)/g) || []).length;
    if (externalCalls > 3 && payload.code.includes('this.')) {
      warnings.push('⚠️ CODE SMELL: Posible Feature Envy - muchos accesos a datos externos');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    principle: 'OOP',
    summary: {
      totalIssues: errors.length + warnings.length,
      criticalIssues: errors.length,
      improvements: suggestions.length
    }
  };
}

export function validateSOLIDPrinciples(payload: OOPValidationPayload) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // ═══════════════════════════════════════════════════════════
  // S - SINGLE RESPONSIBILITY PRINCIPLE
  // ═══════════════════════════════════════════════════════════

  if (payload.hasMultipleResponsibilities) {
    errors.push('❌ SRP: Clase con múltiples responsabilidades - dividir en clases separadas');
  }

  if (payload.responsibilityCount && payload.responsibilityCount > 1) {
    errors.push(`❌ SRP: Detectadas ${payload.responsibilityCount} responsabilidades - debe ser 1`);
  }

  if (payload.methodCount && payload.methodCount > 10) {
    warnings.push('⚠️ SRP: Clase con muchos métodos (>10) - posible violación de SRP');
  }

  // Detectar responsabilidades mezcladas
  if (payload.code) {
    const hasDataAccess = /save|update|delete|insert|select|query|findBy|repository/i.test(payload.code);
    const hasBusinessLogic = /calculate|process|validate|compute|transform|convert/i.test(payload.code);
    const hasPresentation = /render|display|format|print|html|json|xml/i.test(payload.code);
    const hasSecurity = /authenticate|authorize|encrypt|decrypt|token/i.test(payload.code);
    const hasLogging = /log\.|logger\.|System\.out/i.test(payload.code);

    const responsibilityCount = [hasDataAccess, hasBusinessLogic, hasPresentation, hasSecurity, hasLogging].filter(Boolean).length;

    if (responsibilityCount > 1) {
      const responsibilities = [];
      if (hasDataAccess) {
        responsibilities.push('acceso a datos');
      }
      if (hasBusinessLogic) {
        responsibilities.push('lógica de negocio');
      }
      if (hasPresentation) {
        responsibilities.push('presentación');
      }
      if (hasSecurity) {
        responsibilities.push('seguridad');
      }
      if (hasLogging) {
        responsibilities.push('logging');
      }
      errors.push(`❌ SRP: Clase mezcla múltiples responsabilidades: ${responsibilities.join(', ')}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // O - OPEN/CLOSED PRINCIPLE
  // ═══════════════════════════════════════════════════════════

  if (payload.code && payload.code.includes('switch') && payload.code.includes('instanceof')) {
    errors.push('❌ OCP: Switch sobre tipos viola OCP - usar polimorfismo');
  }

  if (payload.code && (payload.code.match(/if.*instanceof/g)?.length || 0) > 1) {
    errors.push('❌ OCP: Múltiples if-instanceof - no está cerrado para modificación');
  }

  if (!payload.code?.includes('interface') && !payload.code?.includes('abstract')) {
    warnings.push('⚠️ OCP: Sin interfaces/abstracciones - dificulta extensión');
  }

  // ═══════════════════════════════════════════════════════════
  // L - LISKOV SUBSTITUTION PRINCIPLE
  // ═══════════════════════════════════════════════════════════

  if (payload.violatesLSP) {
    errors.push('❌ LSP: Subclase no puede reemplazar a la clase base sin cambiar comportamiento');
  }

  if (payload.code && payload.code.includes('@Override') &&
      payload.code.includes('throw new UnsupportedOperationException')) {
    errors.push('❌ LSP: Override que lanza UnsupportedOperationException viola LSP');
  }

  if (payload.code && payload.code.includes('extends') && payload.code.includes('@Override')) {
    suggestions.push('💡 LSP: Verificar que el método sobrescrito mantiene el contrato de la clase base');
  }

  // ════════════════════════════════════════���══════════════════
  // I - INTERFACE SEGREGATION PRINCIPLE
  // ═══════════════════════════════════════════════════════════

  if (payload.hasFatInterface) {
    errors.push('❌ ISP: Interfaz demasiado grande - dividir en interfaces más específicas');
  }

  if (payload.interfaceMethodCount && payload.interfaceMethodCount > 5) {
    warnings.push('⚠️ ISP: Interfaz con muchos métodos (>5) - considerar segregar');
  }

  if (payload.code && payload.code.includes('interface') && payload.code.includes('implements')) {
    const methodCount = (payload.code.match(/void\s+\w+\(/g)?.length || 0);
    if (methodCount > 7) {
      errors.push('❌ ISP: Interfaz con demasiados métodos - violaría ISP');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // D - DEPENDENCY INVERSION PRINCIPLE
  // ═══════════════════════════════════════════════════════════

  if (payload.usesConcreteTypes) {
    errors.push('❌ DIP: Dependencia de tipos concretos - usar interfaces/abstracciones');
  }

  if (!payload.hasDependencyInjection) {
    errors.push('❌ DIP: Sin inyección de dependencias - usar constructor/setter injection');
  }

  if (payload.code && payload.code.includes('new ') &&
      !payload.code.includes('private') &&
      payload.code.includes('class')) {
    const newCount = (payload.code.match(/new\s+\w+\(/g)?.length || 0);
    if (newCount > 2) {
      warnings.push("⚠️ DIP: Múltiples 'new' detectados - considerar inyección de dependencias");
    }
  }

  if (payload.code && /private\s+\w+\s+\w+\s*=\s*new/.test(payload.code)) {
    errors.push('❌ DIP: Creación directa de dependencias en campos - inyectar por constructor');
  }

  // ═══════════════════════════════════════════════════════════
  // VALIDACIONES AVANZADAS DE SOLID
  // ═══════════════════════════════════════════════════════════

  // Testing friendliness
  if (payload.code && !payload.code.includes('interface') && !payload.code.includes('abstract') && payload.code.includes('new ')) {
    warnings.push("⚠️ TESTING: Clase concreta con 'new' - dificulta testing con mocks");
  }

  // Domain modeling
  if (payload.className && payload.className.endsWith('Manager') && payload.methodCount && payload.methodCount > 5) {
    warnings.push("⚠️ DOMAIN: Nombre 'Manager' sugiere posible God Class - revisar responsabilidades");
  }

  if (payload.code && payload.code.includes('public void set') && payload.code.includes('final') === false) {
    suggestions.push('💡 IMMUTABILITY: Considerar usar objetos inmutables (final fields, no setters)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    principle: 'SOLID',
    summary: {
      totalIssues: errors.length + warnings.length,
      criticalIssues: errors.length,
      improvements: suggestions.length
    }
  };
}

export function validateCodeMetrics(payload: OOPValidationPayload) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Líneas de código
  if (payload.linesOfCode && payload.linesOfCode > 300) {
    errors.push('❌ MÉTRICAS: Clase demasiado grande (>300 líneas) - dividir en clases más pequeñas');
  } else if (payload.linesOfCode && payload.linesOfCode > 200) {
    warnings.push('⚠️ MÉTRICAS: Clase grande (>200 líneas) - considerar refactorizar');
  }

  // Complejidad ciclomática
  if (payload.cyclomaticComplexity && payload.cyclomaticComplexity > 10) {
    errors.push('❌ MÉTRICAS: Complejidad ciclomática demasiado alta (>10) - simplificar método');
  } else if (payload.cyclomaticComplexity && payload.cyclomaticComplexity > 5) {
    warnings.push('⚠️ MÉTRICAS: Complejidad ciclomática alta (>5) - considerar extraer métodos');
  }

  // Acoplamiento
  if (payload.couplingLevel && payload.couplingLevel > 7) {
    errors.push('❌ MÉTRICAS: Alto acoplamiento (>7 dependencias) - reducir dependencias');
  }

  // Conteo de métodos
  if (payload.methodCount && payload.methodCount > 15) {
    errors.push('❌ MÉTRICAS: Demasiados métodos en clase (>15) - posible violación SRP');
  } else if (payload.methodCount && payload.methodCount > 10) {
    warnings.push('⚠️ MÉTRICAS: Muchos métodos en clase (>10) - revisar responsabilidades');
  }

  // Análisis automático si hay código
  if (payload.code) {
    // Calcular líneas de código
    const actualLines = payload.code.split('\n').filter(line => line.trim().length > 0).length;
    if (actualLines > 300) {
      errors.push('❌ MÉTRICAS: Clase con demasiadas líneas de código (>300)');
    }

    // Contar métodos
    const methodMatches = payload.code.match(/public\s+(?!class|interface)\w+\s+\w+\(/g);
    const actualMethods = methodMatches ? methodMatches.length : 0;
    if (actualMethods > 15) {
      errors.push('❌ MÉTRICAS: Demasiados métodos públicos (>15)');
    }

    // Calcular complejidad ciclomática aproximada
    const ifCount = (payload.code.match(/\bif\s*\(/g) || []).length;
    const forCount = (payload.code.match(/\bfor\s*\(/g) || []).length;
    const whileCount = (payload.code.match(/\bwhile\s*\(/g) || []).length;
    const switchCount = (payload.code.match(/\bswitch\s*\(/g) || []).length;
    const catchCount = (payload.code.match(/\bcatch\s*\(/g) || []).length;
    const conditionalCount = (payload.code.match(/\?|\&\&|\|\|/g) || []).length;

    const estimatedComplexity = ifCount + forCount + whileCount + switchCount + catchCount + (conditionalCount / 2);
    if (estimatedComplexity > 10) {
      errors.push('❌ MÉTRICAS: Complejidad ciclomática estimada muy alta (>10)');
    } else if (estimatedComplexity > 5) {
      warnings.push('⚠️ MÉTRICAS: Complejidad ciclomática estimada alta (>5)');
    }

    // Contar dependencias (imports + new)
    const importCount = (payload.code.match(/import\s+/g) || []).length;
    const newCount = (payload.code.match(/new\s+\w+/g) || []).length;
    const dependencyCount = importCount + newCount;
    if (dependencyCount > 10) {
      warnings.push('⚠️ MÉTRICAS: Muchas dependencias (>10) - considerar reducir acoplamiento');
    }
  }

  // Sugerencias basadas en métricas
  if (payload.linesOfCode && payload.linesOfCode > 150) {
    suggestions.push('💡 MÉTRICAS: Considerar aplicar Extract Class para reducir tamaño');
  }

  if (payload.cyclomaticComplexity && payload.cyclomaticComplexity > 3) {
    suggestions.push('💡 MÉTRICAS: Considerar Extract Method para reducir complejidad');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    summary: {
      totalIssues: errors.length + warnings.length,
      criticalIssues: errors.length
    }
  };
}

export function analyzeFullClass(code: string): OOPValidationPayload {
  const payload: OOPValidationPayload = {
    code,
    analysisType: 'full'
  };

  // Analizar líneas de código
  payload.linesOfCode = code.split('\n').filter(line => line.trim()).length;

  // Detectar campos públicos
  payload.hasPublicFields = /public\s+\w+\s+\w+;/.test(code);

  // Contar métodos
  payload.methodCount = (code.match(/public\s+\w+\s+\w+\(/g)?.length || 0);

  // Detectar instanceof
  const instanceofCount = (code.match(/instanceof/g)?.length || 0);
  payload.hasExcessiveInstanceof = instanceofCount > 2;

  // Detectar inyección de dependencias
  payload.hasDependencyInjection = /public\s+\w+\s*\([^)]*\w+\s+\w+[^)]*\)/.test(code) &&
                                    !/=\s*new/.test(code);

  // Detectar uso de abstracciones
  payload.usesAbstraction = code.includes('interface') || code.includes('abstract');

  // Detectar profundidad de herencia (simplificado)
  const extendsMatch = code.match(/extends\s+(\w+)/);
  payload.inheritanceDepth = extendsMatch ? 1 : 0;

  // Estimar complejidad ciclomática (simplificado)
  const ifCount = (code.match(/\bif\b/g)?.length || 0);
  const forCount = (code.match(/\bfor\b/g)?.length || 0);
  const whileCount = (code.match(/\bwhile\b/g)?.length || 0);
  const caseCount = (code.match(/\bcase\b/g)?.length || 0);
  payload.cyclomaticComplexity = 1 + ifCount + forCount + whileCount + caseCount;

  return payload;
}

export function validateOOPAndSOLID(code: string, analysisType: 'oop' | 'solid' | 'both' = 'both') {
  const payload = analyzeFullClass(code);

  const result: any = {
    code,
    analysis: {}
  };

  if (analysisType === 'oop' || analysisType === 'both') {
    result.analysis.oop = validateOOPPrinciples(payload);
  }

  if (analysisType === 'solid' || analysisType === 'both') {
    result.analysis.solid = validateSOLIDPrinciples(payload);
  }

  result.analysis.metrics = validateCodeMetrics(payload);

  // Consolidar resultados
  const allErrors = [
    ...(result.analysis.oop?.errors || []),
    ...(result.analysis.solid?.errors || []),
    ...(result.analysis.metrics?.errors || [])
  ];

  const allWarnings = [
    ...(result.analysis.oop?.warnings || []),
    ...(result.analysis.solid?.warnings || []),
    ...(result.analysis.metrics?.warnings || [])
  ];

  const allSuggestions = [
    ...(result.analysis.oop?.suggestions || []),
    ...(result.analysis.solid?.suggestions || [])
  ];

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    suggestions: allSuggestions,
    detailedAnalysis: result.analysis,
    metrics: payload,
    summary: {
      totalIssues: allErrors.length + allWarnings.length,
      criticalIssues: allErrors.length,
      improvements: allSuggestions.length,
      linesOfCode: payload.linesOfCode,
      complexity: payload.cyclomaticComplexity
    }
  };
}