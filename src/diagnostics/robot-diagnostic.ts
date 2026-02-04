/**
 * Robot Diagnostic Module
 * Analiza proyectos Serenity BDD existentes y genera reportes sobre la implementación del patrón Screenplay
 */

export interface DiagnosticConfig {
  projectPath: string;
  projectType: 'api' | 'web' | 'both';
  checkDependencies?: boolean;
  checkStructure?: boolean;
  checkPatterns?: boolean;
}

export interface DiagnosticIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  issue: string;
  location?: string;
  suggestion: string;
}

export interface DiagnosticResult {
  projectName: string;
  projectType: string;
  timestamp: string;
  overallScore: number;
  passed: boolean;
  summary: {
    totalIssues: number;
    errors: number;
    warnings: number;
    info: number;
  };
  sections: {
    dependencies: DiagnosticSection;
    structure: DiagnosticSection;
    screenplayPattern: DiagnosticSection;
    bestPractices: DiagnosticSection;
  };
  issues: DiagnosticIssue[];
  recommendations: string[];
}

export interface DiagnosticSection {
  name: string;
  passed: boolean;
  score: number;
  checks: CheckResult[];
}

export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

/**
 * Analiza un proyecto Serenity y genera un diagnóstico completo
 */
export function diagnoseSerenityRobot(projectStructure: string, config: DiagnosticConfig): DiagnosticResult {
  const issues: DiagnosticIssue[] = [];
  const recommendations: string[] = [];

  // 1. Verificar dependencias
  const dependenciesSection = analyzeDependencies(projectStructure, config.projectType, issues);

  // 2. Verificar estructura del proyecto
  const structureSection = analyzeStructure(projectStructure, config.projectType, issues);

  // 3. Verificar implementación del patrón Screenplay
  const screenplaySection = analyzeScreenplayPattern(projectStructure, config.projectType, issues);

  // 4. Verificar mejores prácticas
  const bestPracticesSection = analyzeBestPractices(projectStructure, config.projectType, issues);

  // Generar recomendaciones
  generateRecommendations(issues, recommendations);

  // Calcular puntuación general
  const overallScore = calculateOverallScore([
    dependenciesSection,
    structureSection,
    screenplaySection,
    bestPracticesSection
  ]);

  const summary = {
    totalIssues: issues.length,
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length
  };

  return {
    projectName: config.projectPath.split('/').pop() || 'unknown',
    projectType: config.projectType,
    timestamp: new Date().toISOString(),
    overallScore,
    passed: overallScore >= 70 && summary.errors === 0,
    summary,
    sections: {
      dependencies: dependenciesSection,
      structure: structureSection,
      screenplayPattern: screenplaySection,
      bestPractices: bestPracticesSection
    },
    issues,
    recommendations
  };
}

/**
 * Analiza las dependencias del proyecto
 */
function analyzeDependencies(projectStructure: string, projectType: string, issues: DiagnosticIssue[]): DiagnosticSection {
  const checks: CheckResult[] = [];

  // Verificar Serenity BDD 4.3.4
  const hasSerenity434 = projectStructure.includes('serenity') && 
                         (projectStructure.includes('4.3.4') || projectStructure.includes('4.3.'));
  checks.push({
    name: 'Serenity BDD Version',
    passed: hasSerenity434,
    message: hasSerenity434 
      ? '✅ Serenity BDD 4.3.4 detectado'
      : '❌ Serenity BDD 4.3.4 no encontrado',
    details: hasSerenity434 
      ? 'Usando la versión recomendada de Serenity BDD'
      : 'Se requiere Serenity BDD 4.3.4 para compatibilidad óptima'
  });

  if (!hasSerenity434) {
    issues.push({
      severity: 'error',
      category: 'Dependencies',
      issue: 'Serenity BDD 4.3.4 no está configurado',
      suggestion: 'Actualizar dependencia a net.serenity-bdd:serenity-core:4.3.4'
    });
  }

  // Verificar JUnit 4
  const hasJUnit4 = projectStructure.includes('junit:junit:4.13.2') || 
                    projectStructure.includes('junit4');
  checks.push({
    name: 'JUnit 4 Version',
    passed: hasJUnit4,
    message: hasJUnit4
      ? '✅ JUnit 4.13.2 (estable) detectado'
      : '❌ JUnit 4.13.2 no encontrado',
    details: hasJUnit4
      ? 'Usando JUnit 4 estable para compatibilidad con @RunWith(CucumberWithSerenity.class)'
      : 'Se requiere JUnit 4.13.2 para ejecutar tests con @RunWith'
  });

  if (!hasJUnit4) {
    issues.push({
      severity: 'error',
      category: 'Dependencies',
      issue: 'JUnit 4.13.2 no está configurado',
      suggestion: 'Agregar dependencia junit:junit:4.13.2 para soporte de @RunWith'
    });
  }

  // Verificar Serenity Cucumber
  const hasSerenityBDD = projectStructure.includes('serenity-cucumber');
  checks.push({
    name: 'Serenity Cucumber',
    passed: hasSerenityBDD,
    message: hasSerenityBDD
      ? '✅ Serenity Cucumber configurado'
      : '❌ Serenity Cucumber no encontrado',
    details: hasSerenityBDD
      ? 'Integración con Cucumber está disponible'
      : 'Se requiere net.serenity-bdd:serenity-cucumber:4.3.4'
  });

  // Verificar dependencias específicas por tipo
  if (projectType === 'api' || projectType === 'both') {
    const hasRestAssured = projectStructure.includes('rest-assured') || 
                          projectStructure.includes('serenity-screenplay-rest');
    checks.push({
      name: 'Serenity REST Assured',
      passed: hasRestAssured,
      message: hasRestAssured
        ? '✅ Serenity REST Assured configurado'
        : '❌ Serenity REST Assured no encontrado',
      details: hasRestAssured
        ? 'Soporte para API testing disponible'
        : 'Se requiere serenity-rest-assured y serenity-screenplay-rest'
    });

    if (!hasRestAssured) {
      issues.push({
        severity: 'error',
        category: 'Dependencies',
        issue: 'Dependencias de API testing no configuradas',
        suggestion: 'Agregar serenity-rest-assured y serenity-screenplay-rest version 4.3.4'
      });
    }
  }

  if (projectType === 'web' || projectType === 'both') {
    const hasWebDriver = projectStructure.includes('serenity-screenplay-webdriver') ||
                        projectStructure.includes('selenium');
    checks.push({
      name: 'Serenity WebDriver',
      passed: hasWebDriver,
      message: hasWebDriver
        ? '✅ Serenity WebDriver configurado'
        : '❌ Serenity WebDriver no encontrado',
      details: hasWebDriver
        ? 'Soporte para Web UI testing disponible'
        : 'Se requiere serenity-screenplay-webdriver'
    });

    if (!hasWebDriver) {
      issues.push({
        severity: 'error',
        category: 'Dependencies',
        issue: 'Dependencias de Web UI testing no configuradas',
        suggestion: 'Agregar serenity-screenplay-webdriver version 4.3.4'
      });
    }
  }

  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    name: 'Dependencias',
    passed: score >= 80,
    score,
    checks
  };
}

/**
 * Analiza la estructura del proyecto
 */
function analyzeStructure(projectStructure: string, projectType: string, issues: DiagnosticIssue[]): DiagnosticSection {
  const checks: CheckResult[] = [];

  // Verificar estructura base
  const hasRunners = projectStructure.includes('runners/') || projectStructure.includes('Runner.java');
  checks.push({
    name: 'Runner Classes',
    passed: hasRunners,
    message: hasRunners
      ? '✅ Runner class encontrado'
      : '❌ Runner class no encontrado',
    details: hasRunners
      ? 'CucumberTestRunner presente para ejecutar tests'
      : 'Se requiere una clase Runner con @RunWith(CucumberWithSerenity.class)'
  });

  if (!hasRunners) {
    issues.push({
      severity: 'error',
      category: 'Structure',
      issue: 'No se encontró clase Runner',
      location: 'src/test/java/.../runners/',
      suggestion: 'Crear CucumberTestRunner con @RunWith(CucumberWithSerenity.class) y @CucumberOptions'
    });
  }

  const hasHooks = projectStructure.includes('hooks/') || projectStructure.includes('Hooks.java');
  checks.push({
    name: 'Hooks Class',
    passed: hasHooks,
    message: hasHooks
      ? '✅ Hooks class encontrado'
      : '⚠️  Hooks class no encontrado',
    details: hasHooks
      ? 'Clase Hooks presente para configuración @Before/@After'
      : 'Se recomienda crear Hooks para SetTheStage y cleanup'
  });

  if (!hasHooks) {
    issues.push({
      severity: 'warning',
      category: 'Structure',
      issue: 'No se encontró clase Hooks',
      location: 'src/test/java/.../hooks/',
      suggestion: 'Crear clase Hooks con @Before para OnStage.setTheStage() y @After para cleanup'
    });
  }

  const hasStepDefinitions = projectStructure.includes('stepdefinitions/') || 
                             projectStructure.includes('StepDefinitions.java');
  checks.push({
    name: 'Step Definitions',
    passed: hasStepDefinitions,
    message: hasStepDefinitions
      ? '✅ Step Definitions encontrados'
      : '❌ Step Definitions no encontrados',
    details: hasStepDefinitions
      ? 'Clases StepDefinitions presentes'
      : 'Se requieren clases StepDefinitions para mapear Gherkin a código'
  });

  if (!hasStepDefinitions) {
    issues.push({
      severity: 'error',
      category: 'Structure',
      issue: 'No se encontraron Step Definitions',
      location: 'src/test/java/.../stepdefinitions/',
      suggestion: 'Crear clases StepDefinitions con métodos @Given, @When, @Then'
    });
  }

  const hasFeatures = projectStructure.includes('features/') || projectStructure.includes('.feature');
  checks.push({
    name: 'Feature Files',
    passed: hasFeatures,
    message: hasFeatures
      ? '✅ Feature files encontrados'
      : '❌ Feature files no encontrados',
    details: hasFeatures
      ? 'Archivos .feature presentes en resources'
      : 'Se requieren archivos .feature con escenarios Gherkin'
  });

  // Verificar estructura específica por tipo
  if (projectType === 'api' || projectType === 'both') {
    const hasTasks = projectStructure.includes('tasks/') || projectStructure.includes('Task.java');
    checks.push({
      name: 'API Tasks',
      passed: hasTasks,
      message: hasTasks
        ? '✅ Tasks encontrados'
        : '❌ Tasks no encontrados',
      details: 'Tasks representan acciones de negocio en el patrón Screenplay'
    });

    const hasInteractions = projectStructure.includes('interactions/') || 
                           projectStructure.includes('Interaction.java');
    checks.push({
      name: 'API Interactions',
      passed: hasInteractions,
      message: hasInteractions
        ? '✅ Interactions encontrados'
        : '⚠️  Interactions no encontrados',
      details: 'Interactions son acciones HTTP reutilizables'
    });

    const hasQuestions = projectStructure.includes('questions/') || 
                        projectStructure.includes('Question.java');
    checks.push({
      name: 'API Questions',
      passed: hasQuestions,
      message: hasQuestions
        ? '✅ Questions encontrados'
        : '❌ Questions no encontrados',
      details: 'Questions extraen información para validaciones'
    });

    const hasModels = projectStructure.includes('models/') || 
                     projectStructure.includes('Model.java') ||
                     projectStructure.includes('dto/');
    checks.push({
      name: 'API Models',
      passed: hasModels,
      message: hasModels
        ? '✅ Models/DTOs encontrados'
        : '⚠️  Models/DTOs no encontrados',
      details: 'Models representan la estructura de Request/Response'
    });
  }

  if (projectType === 'web' || projectType === 'both') {
    const hasUI = projectStructure.includes('userinterfaces/') || 
                 projectStructure.includes('pages/') ||
                 projectStructure.includes('UI.java');
    checks.push({
      name: 'Web UI Classes',
      passed: hasUI,
      message: hasUI
        ? '✅ UI classes encontradas'
        : '❌ UI classes no encontradas',
      details: 'UI classes contienen Target locators para elementos web'
    });

    if (!hasUI) {
      issues.push({
        severity: 'error',
        category: 'Structure',
        issue: 'No se encontraron clases UI para Web',
        location: 'src/main/java/.../userinterfaces/',
        suggestion: 'Crear clases UI con Target locators y método con() para Page Objects'
      });
    }
  }

  const hasSerenityProperties = projectStructure.includes('serenity.properties');
  checks.push({
    name: 'Serenity Properties',
    passed: hasSerenityProperties,
    message: hasSerenityProperties
      ? '✅ serenity.properties encontrado'
      : '⚠️  serenity.properties no encontrado',
    details: hasSerenityProperties
      ? 'Archivo de configuración presente'
      : 'Se recomienda crear serenity.properties con configuración del proyecto'
  });

  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    name: 'Estructura del Proyecto',
    passed: score >= 70,
    score,
    checks
  };
}

/**
 * Analiza la implementación del patrón Screenplay
 */
function analyzeScreenplayPattern(projectStructure: string, _projectType: string, issues: DiagnosticIssue[]): DiagnosticSection {
  const checks: CheckResult[] = [];

  // Verificar Actor usage
  const hasActorUsage = projectStructure.includes('Actor') || 
                       projectStructure.includes('OnStage') ||
                       projectStructure.includes('theActorInTheSpotlight');
  checks.push({
    name: 'Actor Pattern',
    passed: hasActorUsage,
    message: hasActorUsage
      ? '✅ Uso de Actor detectado'
      : '❌ Uso de Actor no detectado',
    details: hasActorUsage
      ? 'Pattern Screenplay implementado con Actor'
      : 'Se debe usar Actor y OnStage para implementar Screenplay correctamente'
  });

  if (!hasActorUsage) {
    issues.push({
      severity: 'error',
      category: 'Screenplay Pattern',
      issue: 'Patrón Actor no implementado',
      suggestion: 'Usar OnStage.theActorCalled() o theActorInTheSpotlight() en StepDefinitions'
    });
  }

  // Verificar uso de performAs
  const hasPerformAs = projectStructure.includes('performAs') || 
                      projectStructure.includes('attemptsTo');
  checks.push({
    name: 'Task Execution Pattern',
    passed: hasPerformAs,
    message: hasPerformAs
      ? '✅ Ejecución de Tasks correcta (attemptsTo)'
      : '⚠️  No se detectó attemptsTo() para Tasks',
    details: 'Los Tasks deben ejecutarse con actor.attemptsTo()'
  });

  if (!hasPerformAs) {
    issues.push({
      severity: 'warning',
      category: 'Screenplay Pattern',
      issue: 'No se detectó uso de attemptsTo() para Tasks',
      suggestion: 'Ejecutar Tasks con actor.attemptsTo(Task.method())'
    });
  }

  // Verificar Questions pattern
  const hasQuestionPattern = projectStructure.includes('asksFor') || 
                            projectStructure.includes('seeThat');
  checks.push({
    name: 'Question Pattern',
    passed: hasQuestionPattern,
    message: hasQuestionPattern
      ? '✅ Question pattern implementado'
      : '⚠️  Question pattern no detectado',
    details: 'Las validaciones deben usar actor.asksFor() o actor.should(seeThat())'
  });

  // Anti-patrones comunes
  const hasPageObjectAntipattern = projectStructure.includes('PageObject') && 
                                   !projectStructure.includes('Target');
  if (hasPageObjectAntipattern) {
    checks.push({
      name: 'Anti-pattern Check',
      passed: false,
      message: '❌ Detectado patrón PageObject tradicional',
      details: 'Se está usando PageObject en lugar de Screenplay pattern con Target'
    });

    issues.push({
      severity: 'error',
      category: 'Screenplay Pattern',
      issue: 'Anti-pattern: Uso de PageObject tradicional detectado',
      suggestion: 'Migrar a Screenplay pattern usando Target locators en clases UI y Tasks/Questions'
    });
  } else {
    checks.push({
      name: 'Anti-pattern Check',
      passed: true,
      message: '✅ No se detectaron anti-patrones obvios',
      details: 'El código sigue el patrón Screenplay correctamente'
    });
  }

  // Verificar imports correctos
  const hasCorrectImports = projectStructure.includes('net.serenitybdd.screenplay') || 
                           projectStructure.includes('net.serenitybdd.core.pages');
  checks.push({
    name: 'Serenity Imports',
    passed: hasCorrectImports,
    message: hasCorrectImports
      ? '✅ Imports de Serenity correctos'
      : '⚠️  Verificar imports de Serenity',
    details: 'Debe usar net.serenitybdd.screenplay para Task, Question, Actor'
  });

  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    name: 'Patrón Screenplay',
    passed: score >= 70,
    score,
    checks
  };
}

/**
 * Analiza mejores prácticas
 */
function analyzeBestPractices(projectStructure: string, _projectType: string, issues: DiagnosticIssue[]): DiagnosticSection {
  const checks: CheckResult[] = [];

  // Naming conventions
  const hasProperNaming = projectStructure.includes('Task') && 
                         projectStructure.includes('Question');
  checks.push({
    name: 'Naming Conventions',
    passed: hasProperNaming,
    message: hasProperNaming
      ? '✅ Convenciones de nombres correctas'
      : '⚠️  Verificar convenciones de nombres',
    details: 'Tasks terminan en Task, Questions en Question, UI classes en UI'
  });

  // Builder pattern
  const hasBuilders = projectStructure.includes('Builder') || 
                     projectStructure.includes('builder()');
  checks.push({
    name: 'Builder Pattern',
    passed: hasBuilders,
    message: hasBuilders
      ? '✅ Builder pattern detectado'
      : '⚠️  Builder pattern no detectado',
    details: 'Se recomienda usar Builder pattern para Models complejos'
  });

  // Javadoc
  const hasJavadoc = projectStructure.includes('/**') || 
                    projectStructure.includes('* @');
  checks.push({
    name: 'Documentation',
    passed: hasJavadoc,
    message: hasJavadoc
      ? '✅ Documentación presente'
      : '⚠️  Documentación insuficiente',
    details: 'Las clases principales deben tener Javadoc'
  });

  if (!hasJavadoc) {
    issues.push({
      severity: 'info',
      category: 'Best Practices',
      issue: 'Falta documentación Javadoc',
      suggestion: 'Agregar Javadoc a clases y métodos públicos principales'
    });
  }

  // Separación de concerns
  const hasProperPackages = projectStructure.includes('tasks/') && 
                           projectStructure.includes('questions/');
  checks.push({
    name: 'Package Organization',
    passed: hasProperPackages,
    message: hasProperPackages
      ? '✅ Organización de paquetes correcta'
      : '⚠️  Mejorar organización de paquetes',
    details: 'Tasks, Questions, Models deben estar en paquetes separados'
  });

  // Configuración de reportes
  const hasReportConfig = projectStructure.includes('serenity.properties') || 
                         projectStructure.includes('serenity-maven-plugin');
  checks.push({
    name: 'Report Configuration',
    passed: hasReportConfig,
    message: hasReportConfig
      ? '✅ Configuración de reportes presente'
      : '⚠️  Configuración de reportes no detectada',
    details: 'Debe tener serenity-maven-plugin o serenity.properties configurado'
  });

  const passedChecks = checks.filter(c => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    name: 'Mejores Prácticas',
    passed: score >= 60,
    score,
    checks
  };
}

/**
 * Genera recomendaciones basadas en los issues encontrados
 */
function generateRecommendations(issues: DiagnosticIssue[], recommendations: string[]): void {
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  if (errorCount === 0 && warningCount === 0) {
    recommendations.push('✅ Excelente! El proyecto sigue correctamente el patrón Screenplay y las mejores prácticas.');
    recommendations.push('💡 Continuar manteniendo este nivel de calidad en el código.');
    return;
  }

  if (errorCount > 0) {
    recommendations.push('🔴 CRÍTICO: Corregir errores encontrados antes de continuar con el desarrollo.');
  }

  // Agrupar issues por categoría
  const issuesByCategory: Record<string, DiagnosticIssue[]> = {};
  issues.forEach(issue => {
    if (!issuesByCategory[issue.category]) {
      issuesByCategory[issue.category] = [];
    }
    issuesByCategory[issue.category]!.push(issue);
  });

  // Generar recomendaciones por categoría
  if (issuesByCategory['Dependencies']) {
    recommendations.push('📦 Actualizar dependencias a Serenity 4.3.4 y JUnit 4.13.2 en pom.xml o build.gradle');
  }

  if (issuesByCategory['Structure']) {
    recommendations.push('📁 Completar la estructura del proyecto con Runner, Hooks, StepDefinitions y Features');
  }

  if (issuesByCategory['Screenplay Pattern']) {
    recommendations.push('🎭 Revisar implementación del patrón Screenplay: usar Actor, Tasks, Questions correctamente');
    recommendations.push('📚 Consultar documentación oficial de Serenity Screenplay: https://serenity-bdd.info/docs/screenplay/screenplay_fundamentals');
  }

  if (issuesByCategory['Best Practices']) {
    recommendations.push('⭐ Mejorar calidad del código: agregar documentación, usar Builder pattern, seguir naming conventions');
  }

  if (warningCount > 5) {
    recommendations.push('⚠️  Considerar refactorización para reducir warnings y mejorar mantenibilidad');
  }
}

/**
 * Calcula la puntuación general del proyecto
 */
function calculateOverallScore(sections: DiagnosticSection[]): number {
  const weights = {
    'Dependencias': 0.30,
    'Estructura del Proyecto': 0.30,
    'Patrón Screenplay': 0.30,
    'Mejores Prácticas': 0.10
  };

  let totalScore = 0;
  sections.forEach(section => {
    const weight = weights[section.name as keyof typeof weights] || 0.25;
    totalScore += section.score * weight;
  });

  return Math.round(totalScore);
}

/**
 * Genera un reporte en formato Markdown
 */
export function generateMarkdownReport(result: DiagnosticResult): string {
  const statusEmoji = result.passed ? '✅' : '❌';
  const scoreColor = result.overallScore >= 80 ? '🟢' : result.overallScore >= 60 ? '🟡' : '🔴';

  let report = `# 🔍 Reporte de Diagnóstico - Serenity Robot

## Información General

- **Proyecto:** ${result.projectName}
- **Tipo:** ${result.projectType.toUpperCase()}
- **Fecha:** ${new Date(result.timestamp).toLocaleString('es-ES')}
- **Estado:** ${statusEmoji} ${result.passed ? 'APROBADO' : 'REQUIERE CORRECCIONES'}
- **Puntuación General:** ${scoreColor} **${result.overallScore}/100**

## 📊 Resumen de Issues

| Tipo | Cantidad |
|------|----------|
| 🔴 Errores | ${result.summary.errors} |
| ⚠️  Advertencias | ${result.summary.warnings} |
| ℹ️  Información | ${result.summary.info} |
| **Total** | **${result.summary.totalIssues}** |

---

## 📋 Análisis Detallado

`;

  // Agregar cada sección
  Object.values(result.sections).forEach(section => {
    const sectionEmoji = section.passed ? '✅' : '❌';
    const scoreBar = '█'.repeat(Math.floor(section.score / 10)) + '░'.repeat(10 - Math.floor(section.score / 10));
    
    report += `### ${sectionEmoji} ${section.name}\n\n`;
    report += `**Puntuación:** ${section.score}/100 ${scoreBar}\n\n`;
    
    section.checks.forEach(check => {
      report += `- ${check.message}\n`;
      if (check.details) {
        report += `  - _${check.details}_\n`;
      }
    });
    
    report += '\n';
  });

  report += '---\n\n';

  // Agregar issues detallados si existen
  if (result.issues.length > 0) {
    report += '## 🔴 Issues Encontrados\n\n';
    
    const errorIssues = result.issues.filter(i => i.severity === 'error');
    const warningIssues = result.issues.filter(i => i.severity === 'warning');
    const infoIssues = result.issues.filter(i => i.severity === 'info');

    if (errorIssues.length > 0) {
      report += '### 🔴 Errores Críticos\n\n';
      errorIssues.forEach((issue, index) => {
        report += `${index + 1}. **${issue.issue}**\n`;
        report += `   - **Categoría:** ${issue.category}\n`;
        if (issue.location) {
          report += `   - **Ubicación:** \`${issue.location}\`\n`;
        }
        report += `   - **Solución:** ${issue.suggestion}\n\n`;
      });
    }

    if (warningIssues.length > 0) {
      report += '### ⚠️  Advertencias\n\n';
      warningIssues.forEach((issue, index) => {
        report += `${index + 1}. **${issue.issue}**\n`;
        report += `   - **Categoría:** ${issue.category}\n`;
        if (issue.location) {
          report += `   - **Ubicación:** \`${issue.location}\`\n`;
        }
        report += `   - **Recomendación:** ${issue.suggestion}\n\n`;
      });
    }

    if (infoIssues.length > 0) {
      report += '### ℹ️  Información\n\n';
      infoIssues.forEach((issue, index) => {
        report += `${index + 1}. **${issue.issue}**\n`;
        report += `   - **Sugerencia:** ${issue.suggestion}\n\n`;
      });
    }

    report += '---\n\n';
  }

  // Agregar recomendaciones
  if (result.recommendations.length > 0) {
    report += '## 💡 Recomendaciones\n\n';
    result.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += '\n---\n\n';
  }

  // Agregar conclusión
  report += '## 📝 Conclusión\n\n';
  if (result.passed) {
    report += '✅ **El proyecto ha pasado el diagnóstico.** El patrón Screenplay está correctamente implementado y sigue las mejores prácticas de Serenity BDD.\n\n';
    report += 'El proyecto puede continuar su desarrollo manteniendo estos estándares de calidad.\n';
  } else {
    report += '❌ **El proyecto requiere correcciones.** Se han encontrado issues que deben ser resueltos para garantizar una correcta implementación del patrón Screenplay.\n\n';
    report += '**Próximos pasos:**\n';
    report += '1. Revisar y corregir los errores críticos listados arriba\n';
    report += '2. Actualizar dependencias a las versiones recomendadas (Serenity 4.3.4, JUnit 4.13.2)\n';
    report += '3. Completar la estructura del proyecto según el patrón Screenplay\n';
    report += '4. Volver a ejecutar el diagnóstico para verificar las correcciones\n';
  }

  report += '\n---\n\n';
  report += '_Generado por Serenity Automation MCP - Diagnostic Tool_\n';
  report += `_Timestamp: ${result.timestamp}_\n`;

  return report;
}
