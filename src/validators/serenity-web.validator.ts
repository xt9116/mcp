/**
 * Validador para Serenity Screenplay - WEB UI
 * Valida Tasks, Interactions, Questions, UI classes, StepDefinitions
 * según el estándar serenity-web-screenplay.standard.json
 */

interface ValidationPayloadWeb {
  code?: string;
  type?: 'Task' | 'Interaction' | 'Question' | 'StepDefinition' | 'UI' | 'Page';
  
  stepDefinitionsLines?: number;
  taskContainsWebDriverDirect?: boolean;
  interactionContainsAssertions?: boolean;
  uiContainsLogic?: boolean;
  uiExtendsPageObject?: boolean;
  uiUsesTarget?: boolean;
  pageContainsActionMethods?: boolean;
  questionReturnsValue?: boolean;
  usesPageObjectModel?: boolean;
  usesFindByAnnotations?: boolean;
  taskUsesBusinessLanguage?: boolean;
  urlIsHardcoded?: boolean;
  hasStepAnnotation?: boolean;
  
  className?: string;
  implementsCorrectInterface?: boolean;
  hasStaticFactoryMethod?: boolean;
  hasPublicConstructor?: boolean;
  usesInstrumented?: boolean;
  
  scenarioValidatesVisibility?: boolean;
  scenarioValidatesText?: boolean;
  scenarioValidatesElementCount?: boolean;
  
  locatorStrategy?: 'id' | 'name' | 'cssSelector' | 'xpath';
  locatorIsStable?: boolean;
}

export function validateSerenityWeb(payload: ValidationPayloadWeb) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validación Screenplay First
  if (payload.usesPageObjectModel) {
    errors.push("❌ PROHIBIDO: No usar Page Object Model tradicional");
  }

  if (payload.usesFindByAnnotations) {
    errors.push("❌ PROHIBIDO: No usar @FindBy annotations - usar Target locators");
  }

  // Validaciones de Step Definitions
  if (payload.type === 'StepDefinition') {
    if (payload.stepDefinitionsLines && payload.stepDefinitionsLines > 5) {
      errors.push(`❌ Step Definitions supera el máximo de 5 líneas (tiene ${payload.stepDefinitionsLines})`);
    }
    
    if (payload.code) {
      if (payload.code.includes('WebDriver') || payload.code.includes('driver.')) {
        errors.push("❌ Step Definitions no debe interactuar directamente con WebDriver");
      }
      
      if (!payload.code.includes('theActorCalled') && !payload.code.includes('theActorInTheSpotlight')) {
        warnings.push("⚠️ Se recomienda usar theActorCalled() o theActorInTheSpotlight()");
      }
    }
  }

  // Validaciones de Tasks
  if (payload.type === 'Task') {
    if (payload.taskContainsWebDriverDirect) {
      errors.push("❌ Los Tasks no deben contener WebDriver directo");
    }
    
    if (!payload.implementsCorrectInterface) {
      errors.push("❌ El Task debe implementar la interface Task");
    }
    
    if (!payload.hasPublicConstructor) {
      errors.push("❌ CRÍTICO: El constructor debe ser público (ByteBuddy requirement)");
    }
    
    if (!payload.usesInstrumented) {
      errors.push("❌ CRÍTICO: Usar Tasks.instrumented() en factory method");
    }
    
    if (payload.code && !payload.code.includes('WaitUntil') && payload.code.includes('Click.on')) {
      warnings.push("⚠️ Se recomienda incluir WaitUntil para mayor estabilidad");
    }
  }

  // Validaciones de Interactions
  if (payload.type === 'Interaction') {
    if (payload.interactionContainsAssertions) {
      errors.push("❌ Las Interactions no deben contener aserciones");
    }
    
    if (!payload.hasPublicConstructor) {
      errors.push("❌ CRÍTICO: El constructor debe ser público");
    }
    
    if (!payload.usesInstrumented) {
      errors.push("❌ CRÍTICO: Usar instrumented() en factory method");
    }
  }

  // Validaciones de Questions
  if (payload.type === 'Question') {
    if (!payload.questionReturnsValue) {
      errors.push("❌ La Question debe retornar un valor");
    }
    
    if (payload.usesInstrumented) {
      warnings.push("⚠️ Questions NO deben usar instrumented() - usar 'new Question()'");
    }
    
    if (payload.code && (payload.code.includes('Click.on') || payload.code.includes('Enter.theValue'))) {
      errors.push("❌ Questions NO deben ejecutar acciones");
    }
  }

  // Validaciones de UI
  if (payload.type === 'UI') {
    if (!payload.className?.startsWith('UI')) {
      errors.push("❌ Las clases UI deben empezar con 'UI' (ej: UIHome)");
    }

    if (!payload.uiExtendsPageObject) {
      errors.push("❌ Las clases UI DEBEN extender PageObject");
    }

    if (!payload.uiUsesTarget) {
      errors.push("❌ Las clases UI DEBEN usar Target en lugar de By");
    }
    
    if (payload.uiContainsLogic) {
      errors.push("❌ Las clases UI NO deben contener lógica");
    }
    
    if (payload.code) {
      if (!payload.code.includes('public static final Target')) {
        errors.push("❌ Los locators deben ser 'public static final Target'");
      }

      if (payload.code.includes('By.id') || payload.code.includes('By.cssSelector')) {
        errors.push("❌ NO usar By directo - usar Target.the().locatedBy()");
      }
      
      const targetMatches = payload.code.matchAll(/Target\s+(\w+)\s*=/g);
      for (const match of targetMatches) {
        const targetName = match[1];
        const validPrefixes = ['TXT_', 'BTN_', 'LBL_', 'DDL_', 'CHK_', 'RDB_', 'LNK_', 'IMG_', 'TBL_'];
        const hasValidPrefix = validPrefixes.some(prefix => targetName.startsWith(prefix));
        
        if (!hasValidPrefix) {
          warnings.push(`⚠️ Target '${targetName}' no usa prefijo estándar`);
        }
      }
    }
    
    if (payload.locatorStrategy === 'xpath' && !payload.locatorIsStable) {
      warnings.push("⚠️ XPath es frágil - preferir id > name > cssSelector");
    }
  }

  // Validaciones de Pages (opcional)
  if (payload.type === 'Page') {
    if (payload.pageContainsActionMethods) {
      errors.push("❌ Pages NO deben contener métodos de acción - usar Tasks");
    }
    
    warnings.push("⚠️ Pages son opcionales - considerar usar solo UI/");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: errors.length === 0 
      ? `✅ ${payload.type} válido según el estándar`
      : `❌ ${errors.length} error(es) encontrado(s)`,
    details: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      criticalIssues: errors.filter(e => e.includes('CRÍTICO')).length
    }
  };
}

export function validateSerenityWebClass(
  type: 'Task' | 'Interaction' | 'Question' | 'StepDefinition' | 'UI' | 'Page',
  code: string,
  className?: string
) {
  const payload: ValidationPayloadWeb = {
    code,
    type,
    className,
  };

  payload.implementsCorrectInterface = 
    (type === 'Task' && code.includes('implements Task')) ||
    (type === 'Interaction' && code.includes('implements Interaction')) ||
    (type === 'Question' && code.includes('implements Question<'));

  payload.hasStaticFactoryMethod = /public static \w+ \w+\(/.test(code);
  payload.hasPublicConstructor = /public \w+\([^)]*\) \{/.test(code);
  payload.usesInstrumented = code.includes('instrumented(') || code.includes('Tasks.instrumented');
  payload.hasStepAnnotation = code.includes('@Step');
  
  payload.taskContainsWebDriverDirect = code.includes('WebDriver') || code.includes('driver.');
  payload.interactionContainsAssertions = code.includes('assert') || code.includes('should(');
  payload.uiContainsLogic = code.includes('public void') || code.includes('if (');
  payload.uiExtendsPageObject = code.includes('extends PageObject');
  payload.uiUsesTarget = code.includes('Target.the(');
  payload.usesPageObjectModel = code.includes('@FindBy');
  payload.urlIsHardcoded = /https?:\/\/[^\s"']+/.test(code) && !code.includes('@DefaultUrl');
  payload.questionReturnsValue = code.includes('implements Question<') && !code.includes('<Void>');

  if (type === 'StepDefinition') {
    const methodMatches = code.match(/@(?:Given|When|Then|Dado|Cuando|Entonces)\s*\([^)]+\)\s*public\s+void\s+\w+\([^)]*\)\s*\{([^}]+)\}/g);
    if (methodMatches) {
      methodMatches.forEach(match => {
        const lines = match.split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).length;
        if (lines > 5) {
          payload.stepDefinitionsLines = lines;
        }
      });
    }
  }

  payload.scenarioValidatesVisibility = code.includes('ElementoEsVisible') || code.includes('isVisible');
  payload.scenarioValidatesText = code.includes('TextoDelElemento') || code.includes('getText');
  payload.scenarioValidatesElementCount = code.includes('CantidadDeElementos');

  if (type === 'UI') {
    if (code.includes('locatedBy("#')) {
      payload.locatorStrategy = 'id';
      payload.locatorIsStable = true;
    } else if (code.includes('locatedBy("//')) {
      payload.locatorStrategy = 'xpath';
      payload.locatorIsStable = false;
    } else {
      payload.locatorStrategy = 'cssSelector';
      payload.locatorIsStable = true;
    }
  }

  return validateSerenityWeb(payload);
}

export function isValidTaskName(name: string): boolean {
  const validPatterns = [
    /^[A-Z][a-z]+[A-Z][a-z]+/,
    /^Abrir/,
    /^Buscar/,
    /^Iniciar/,
    /^Agregar/
  ];
  
  return validPatterns.some(pattern => pattern.test(name));
}

export function isValidQuestionName(name: string): boolean {
  return name.includes('Es') || 
         name.includes('Del') || 
         name.includes('De') ||
         name.startsWith('Elemento') ||
         name.startsWith('Texto');
}