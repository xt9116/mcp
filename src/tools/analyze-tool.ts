import { analyzeFullClass } from '../validators/oop-solid.validator.js';

interface AnalyzeToolRequest {
  code: string;
  analysisType?: 'structure' | 'quality' | 'metrics' | 'full';
  suggestions?: boolean;
}

export async function analyzeTool(request: AnalyzeToolRequest) {
  const { code, analysisType = 'full', suggestions = true } = request;

  if (!code || code.trim().length === 0) {
    return {
      success: false,
      error: "Código vacío - proporciona código Java para analizar"
    };
  }

  try {
    const fullAnalysis = analyzeFullClass(code);
    
    let analysis: any = {
      structure: analyzeStructure(code, fullAnalysis),
      metrics: analyzeMetrics(fullAnalysis),
    };

    if (analysisType === 'full' || analysisType === 'quality') {
      analysis.quality = analyzeQuality(code, fullAnalysis);
    }

    if (suggestions) {
      analysis.suggestions = generateSuggestions(fullAnalysis, code);
    }

    return {
      success: true,
      analysis,
      summary: generateAnalysisSummary(analysis)
    };

  } catch (error) {
    return {
      success: false,
      error: `Error durante análisis: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function analyzeStructure(code: string, payload: any) {
  const className = code.match(/class\s+(\w+)/)?.[1] || 'Unknown';
  const interfaces = code.match(/implements\s+([\w\s,]+)/)?.[1]?.split(',').map(i => i.trim()) || [];
  const extendsClass = code.match(/extends\s+(\w+)/)?.[1] || null;
  
  const fields = (code.match(/(?:private|public|protected)\s+\w+\s+\w+\s*;/g) || []).length;
  const methods = (code.match(/public\s+(?!class|interface)\w+\s+\w+\s*\(/g) || []).length;
  const constructors = (code.match(/public\s+\w+\s*\([^)]*\)\s*\{/g) || []).length;

  return {
    className,
    interfaces,
    extends: extendsClass,
    counts: {
      fields,
      methods,
      constructors,
      linesOfCode: payload.linesOfCode || 0
    },
    visibility: {
      publicMethods: methods,
      privateMethods: (code.match(/private\s+\w+\s+\w+\s*\(/g) || []).length
    }
  };
}

function analyzeMetrics(payload: any) {
  return {
    linesOfCode: payload.linesOfCode || 0,
    methodCount: payload.methodCount || 0,
    cyclomaticComplexity: payload.cyclomaticComplexity || 0,
    inheritanceDepth: payload.inheritanceDepth || 0,
    evaluation: {
      size: evaluateSize(payload.linesOfCode),
      complexity: evaluateComplexity(payload.cyclomaticComplexity),
      methods: evaluateMethodCount(payload.methodCount)
    }
  };
}

function analyzeQuality(code: string, payload: any) {
  return {
    encapsulation: analyzeEncapsulation(code),
    abstraction: payload.usesAbstraction || false,
    dependencyInjection: payload.hasDependencyInjection || false,
    codeSmells: detectCodeSmells(code, payload),
    solidCompliance: analyzeSolidCompliance(code, payload)
  };
}

function analyzeEncapsulation(code: string): any {
  const publicFields = (code.match(/public\s+\w+\s+\w+\s*;/g) || []).length;
  const privateFields = (code.match(/private\s+\w+\s+\w+\s*;/g) || []).length;
  const hasGetters = code.includes('public') && code.includes('get');
  const hasSetters = code.includes('public') && code.includes('set');

  return {
    score: publicFields === 0 && privateFields > 0 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
    publicFields,
    privateFields,
    hasGetters,
    hasSetters,
    issues: publicFields > 0 ? ['Campos públicos detectados'] : []
  };
}

function detectCodeSmells(code: string, payload: any): string[] {
  const smells: string[] = [];

  // Long Method
  if (payload.linesOfCode && payload.linesOfCode > 300) {
    smells.push('Long Class (>300 líneas)');
  }

  // God Class
  if (payload.methodCount && payload.methodCount > 15) {
    smells.push('God Class (>15 métodos)');
  }

  // Feature Envy
  const getterCalls = (code.match(/\w+\.get\w+\(\)/g) || []).length;
  if (getterCalls > 5) {
    smells.push('Possible Feature Envy (muchos getters externos)');
  }

  // Primitive Obsession
  const primitiveFields = (code.match(/private\s+(String|int|double|boolean)\s+\w+;/g) || []).length;
  if (primitiveFields > 5) {
    smells.push('Primitive Obsession (muchos campos primitivos)');
  }

  // Data Class
  const getterSetterCount = (code.match(/(get|set)\w+\(/g) || []).length;
  if (payload.methodCount && getterSetterCount / payload.methodCount > 0.8) {
    smells.push('Data Class (solo getters/setters)');
  }

  return smells;
}

function analyzeSolidCompliance(code: string, payload: any): any {
  return {
    srp: {
      compliant: payload.methodCount && payload.methodCount <= 10,
      reason: payload.methodCount && payload.methodCount > 10 
        ? 'Múltiples métodos sugieren múltiples responsabilidades' 
        : 'Número razonable de métodos'
    },
    ocp: {
      compliant: code.includes('interface') || code.includes('abstract'),
      reason: code.includes('interface') || code.includes('abstract')
        ? 'Usa abstracciones para extensión'
        : 'Sin interfaces/abstracciones detectadas'
    },
    dip: {
      compliant: payload.hasDependencyInjection || false,
      reason: payload.hasDependencyInjection
        ? 'Usa inyección de dependencias'
        : 'No detectada inyección de dependencias'
    }
  };
}

function generateSuggestions(payload: any, code: string): string[] {
  const suggestions: string[] = [];

  if (payload.linesOfCode && payload.linesOfCode > 200) {
    suggestions.push('💡 Considerar dividir la clase en clases más pequeñas (Extract Class)');
  }

  if (payload.methodCount && payload.methodCount > 10) {
    suggestions.push('💡 Revisar si la clase tiene múltiples responsabilidades (SRP)');
  }

  if (payload.cyclomaticComplexity && payload.cyclomaticComplexity > 5) {
    suggestions.push('💡 Simplificar la lógica o extraer métodos (Extract Method)');
  }

  if (!payload.usesAbstraction) {
    suggestions.push('💡 Considerar usar interfaces para mejorar flexibilidad');
  }

  if (!payload.hasDependencyInjection && code.includes('new ')) {
    suggestions.push('💡 Implementar inyección de dependencias para mejor testabilidad');
  }

  const publicFields = (code.match(/public\s+\w+\s+\w+\s*;/g) || []).length;
  if (publicFields > 0) {
    suggestions.push('💡 Encapsular campos públicos con getters/setters');
  }

  return suggestions;
}

function generateAnalysisSummary(analysis: any): string {
  const lines: string[] = [];
  
  lines.push("═══════════════════════════════════════════════");
  lines.push("📊 RESUMEN DE ANÁLISIS DE CÓDIGO");
  lines.push("═══════════════════════════════════════════════\n");

  if (analysis.structure) {
    lines.push(`📦 ESTRUCTURA:`);
    lines.push(`   Clase: ${analysis.structure.className}`);
    if (analysis.structure.extends) {
      lines.push(`   Extiende: ${analysis.structure.extends}`);
    }
    if (analysis.structure.interfaces.length > 0) {
      lines.push(`   Implementa: ${analysis.structure.interfaces.join(', ')}`);
    }
    lines.push(`   Campos: ${analysis.structure.counts.fields}`);
    lines.push(`   Métodos: ${analysis.structure.counts.methods}`);
    lines.push(`   Líneas: ${analysis.structure.counts.linesOfCode}\n`);
  }

  if (analysis.metrics) {
    lines.push(`📈 MÉTRICAS:`);
    lines.push(`   Tamaño: ${analysis.metrics.evaluation.size}`);
    lines.push(`   Complejidad: ${analysis.metrics.evaluation.complexity}`);
    lines.push(`   Métodos: ${analysis.metrics.evaluation.methods}\n`);
  }

  if (analysis.quality) {
    lines.push(`✨ CALIDAD:`);
    lines.push(`   Encapsulación: ${analysis.quality.encapsulation.score}`);
    lines.push(`   Usa Abstracción: ${analysis.quality.abstraction ? 'Sí' : 'No'}`);
    lines.push(`   Inyección de Dependencias: ${analysis.quality.dependencyInjection ? 'Sí' : 'No'}`);
    
    if (analysis.quality.codeSmells.length > 0) {
      lines.push(`\n   🔍 Code Smells Detectados:`);
      analysis.quality.codeSmells.forEach((smell: string) => 
        lines.push(`      - ${smell}`)
      );
    }
    lines.push("");
  }

  if (analysis.suggestions && analysis.suggestions.length > 0) {
    lines.push(`💡 SUGERENCIAS DE MEJORA (${analysis.suggestions.length}):`);
    analysis.suggestions.forEach((suggestion: string) => 
      lines.push(`   ${suggestion}`)
    );
  }

  lines.push("\n═══════════════════════════════════════════════");

  return lines.join('\n');
}

function evaluateSize(lines: number | undefined): string {
  if (!lines) return 'UNKNOWN';
  if (lines < 100) return 'PEQUEÑO';
  if (lines < 300) return 'MEDIO';
  return 'GRANDE';
}

function evaluateComplexity(complexity: number | undefined): string {
  if (!complexity) return 'UNKNOWN';
  if (complexity <= 5) return 'BAJA';
  if (complexity <= 10) return 'MEDIA';
  return 'ALTA';
}

function evaluateMethodCount(count: number | undefined): string {
  if (!count) return 'UNKNOWN';
  if (count <= 5) return 'POCOS';
  if (count <= 10) return 'MODERADO';
  return 'MUCHOS';
}

export { AnalyzeToolRequest };