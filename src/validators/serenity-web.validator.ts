/**
 * Validador para Serenity Screenplay - WEB UI
 * Valida Tasks, Interactions, Questions, UI classes, StepDefinitions
 * según el estándar serenity-web-screenplay.standard.json (actualizado con patrones robots Rimac)
 */

interface ValidationPayloadWeb {
  code?: string;
  type?: 'Task' | 'Interaction' | 'Question' | 'StepDefinition' | 'UI' | 'Page' | 'SetTheStage';

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

  // Validaciones de naming conventions (actualizado)
  usesCorrectUIPrefix?: boolean;
  usesCorrectTargetPrefixes?: boolean;
  usesCorrectQuestionPattern?: boolean;
  usesCorrectFactoryMethods?: boolean;
  usesCorrectFolderName?: boolean;
  usesCorrectUIClassName?: boolean;
  usesLocatedByVsLocatedBy?: boolean;
  hasDrawTheCurtain?: boolean;
  usesTheActorCalled?: boolean;
  stepsExceedThreeLines?: boolean;
  hasLogicInSteps?: boolean;
}

export function validateSerenityWeb(payload: ValidationPayloadWeb) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validación Screenplay First
  if (payload.usesPageObjectModel) {
    errors.push('❌ PROHIBIDO: No usar Page Object Model tradicional (@FindBy)');
  }

  if (payload.usesFindByAnnotations) {
    errors.push('❌ PROHIBIDO: No usar @FindBy annotations - usar Target locators');
  }

  // Validaciones de estructura de carpetas
  if (payload.usesCorrectFolderName === false) {
    errors.push("❌ La carpeta de UI debe llamarse 'userinterfaces' (todo junto, minúsculas)");
  }

  // Validaciones de StepDefinitions (máximo 3 líneas)
  if (payload.type === 'StepDefinition') {
    if (payload.stepsExceedThreeLines) {
      errors.push(`❌ Step Definitions supera el máximo de 3 líneas (tiene ${payload.stepDefinitionsLines} líneas)`);
    }

    if (payload.hasLogicInSteps) {
      errors.push('❌ Step Definitions no debe contener lógica (if, for, while, try-catch)');
    }

    if (!payload.usesTheActorCalled) {
      warnings.push('⚠️ Se recomienda usar theActorCalled() para inicializar actores');
    }

    if (payload.code) {
      if (payload.code.includes('WebDriver') || payload.code.includes('driver.')) {
        errors.push('❌ Step Definitions no debe interactuar directamente con WebDriver');
      }

      if (!payload.code.includes('theActorCalled') && !payload.code.includes('theActorInTheSpotlight')) {
        warnings.push('⚠️ Se recomienda usar theActorCalled() o theActorInTheSpotlight()');
      }

      // IMPORTANTE: Validar que TODAS las validaciones usen seeThat()
      if (payload.code.includes('assertThat(') && !payload.code.includes('// Migration note')) {
        errors.push('❌ CRÍTICO: Step Definitions no debe usar assertThat() - usar seeThat() con Questions (patrón Screenplay)');
      }

      if (payload.code.includes('assertEquals') || payload.code.includes('assertTrue') || payload.code.includes('assertFalse')) {
        errors.push('❌ CRÍTICO: Step Definitions no debe usar assertions directas - usar seeThat() con Questions');
      }

      // Validar que las validaciones usen Questions, no lambdas
      if (payload.code.includes('seeThat(') && payload.code.includes('() ->')) {
        errors.push('❌ CRÍTICO: seeThat() debe usar Question implementations, NO lambdas');
      }

      // Validar que seeThat tenga descripción (3 parámetros)
      const seeThatMatches = payload.code.match(/seeThat\s*\(/g);
      if (seeThatMatches && seeThatMatches.length > 0) {
        // Verificar que cada seeThat tenga al menos 3 parámetros (descripción, Question, matcher)
        const seeThatCalls = payload.code.match(/seeThat\s*\([^)]+,[^)]+,[^)]+\)/g);
        if (!seeThatCalls || seeThatCalls.length < seeThatMatches.length) {
          warnings.push('⚠️ seeThat() debe tener 3 parámetros: descripción, Question, matcher (ayuda con inferencia de tipos)');
        }
      }
    }
  }

  // Validaciones de Tasks
  if (payload.type === 'Task') {
    if (payload.taskContainsWebDriverDirect) {
      errors.push('❌ Los Tasks no deben contener WebDriver directo');
    }

    if (!payload.implementsCorrectInterface) {
      errors.push('❌ El Task debe implementar la interface Task');
    }

    if (!payload.hasPublicConstructor) {
      errors.push('❌ CRÍTICO: El constructor debe ser público (ByteBuddy requirement)');
    }

    if (!payload.usesInstrumented) {
      errors.push('❌ CRÍTICO: Usar Tasks.instrumented() en factory method');
    }

    if (payload.code && !payload.code.includes('WaitUntil') && payload.code.includes('Click.on')) {
      warnings.push('⚠️ Se recomienda incluir WaitUntil para mayor estabilidad');
    }

    if (!payload.taskUsesBusinessLanguage) {
      warnings.push('⚠️ El Task debe usar lenguaje de negocio, no términos técnicos');
    }

    if (payload.code && payload.usesPageObjectModel) {
      errors.push('❌ Task no debe usar Page Object Model tradicional');
    }
  }

  // Validaciones de Interactions
  if (payload.type === 'Interaction') {
    if (payload.interactionContainsAssertions) {
      errors.push('❌ Las Interactions no deben contener aserciones');
    }

    if (!payload.hasPublicConstructor) {
      errors.push('❌ CRÍTICO: El constructor debe ser público');
    }

    if (!payload.usesInstrumented) {
      errors.push('❌ CRÍTICO: Usar instrumented() en factory method');
    }

    if (payload.code && !payload.code.includes('actor.attemptsTo')) {
      errors.push('❌ Interaction debe usar actor.attemptsTo() en performAs()');
    }

    if (payload.code && (payload.code.includes('Enter') || payload.code.includes('Click'))) {
      // Interactions pueden contener acciones nativas de Serenity
    }
  }

  // Validaciones de Questions
  if (payload.type === 'Question') {
    if (!payload.questionReturnsValue) {
      errors.push('❌ La Question debe retornar un valor');
    }

    if (payload.usesInstrumented) {
      warnings.push("⚠️ Questions NO deben usar instrumented() - usar 'new Question()'");
    }

    if (payload.code && (payload.code.includes('Click.on') || payload.code.includes('Enter.theValue'))) {
      errors.push('❌ Questions NO deben ejecutar acciones');
    }

    if (!payload.usesCorrectFactoryMethods) {
      warnings.push('⚠️ Question debe tener factory methods: en(), del(), de() (no as())');
    }
  }

  // Validaciones de UI (actualizado con validaciones robots Rimac)
  if (payload.type === 'UI') {
    if (!payload.usesCorrectUIClassName) {
      errors.push("❌ Las clases UI deben empezar con 'UI' o terminar en 'Page' (ej: UIHome, UISoatDigital, LoginPage, UILoginPage)");
    }

    if (!payload.uiExtendsPageObject) {
      errors.push('❌ Las clases UI DEBEN extender PageObject');
    }

    if (!payload.uiUsesTarget) {
      errors.push('❌ Las clases UI DEBEN usar Target en lugar de By');
    }

    if (!payload.usesLocatedByVsLocatedBy) {
      errors.push('❌ Las clases UI DEBEN usar .locatedBy() en lugar de .located(By.*)');
    }

    if (payload.uiContainsLogic) {
      errors.push('❌ Las clases UI NO deben contener lógica (solo Target locators)');
    }

    if (payload.code) {
      if (!payload.code.includes('public static final Target')) {
        errors.push("❌ Los locators deben ser 'public static final Target'");
      }

      if (payload.code.includes('By.id') || payload.code.includes('By.cssSelector') || payload.code.includes('By.xpath')) {
        errors.push('❌ NO usar By directo - usar Target.the().locatedBy()');
      }

      const targetMatches = payload.code.matchAll(/public static final Target\s+(\w+)\s*=/g);
      for (const match of targetMatches) {
        const targetName = match[1];
        if (targetName) {
          // Standard prefixes recommended by Rimac
          const standardPrefixes = ['TXT_', 'BTN_', 'LBL_', 'DDL_', 'CHK_', 'RDB_', 'LNK_', 'IMG_', 'TBL_'];
          const hasStandardPrefix = standardPrefixes.some(prefix => targetName.startsWith(prefix));

          // Check if it follows the PREFIX_NAME pattern (uppercase letters followed by underscore)
          const followsPrefixPattern = /^[A-Z]+_/.test(targetName);

          if (!followsPrefixPattern) {
            errors.push(`❌ Target '${targetName}' debe seguir el patrón PREFIX_NAME (ej: TXT_USERNAME, LST_PRODUCTS)`);
          } else if (!hasStandardPrefix) {
            // Format standard prefixes without trailing underscores for readability
            const standardPrefixList = standardPrefixes.map(p => p.replace(/_$/, '')).join(', ');
            warnings.push(`⚠️ Target '${targetName}' usa prefijo personalizado. Los prefijos estándar recomendados son: ${standardPrefixList}`);
          }
        }
      }
    }

    if (payload.locatorStrategy === 'xpath' && !payload.locatorIsStable) {
      warnings.push('⚠️ XPath es frágil - preferir id > name > cssSelector');
    }
  }

  // Validaciones de SetTheStage (actualizado con validaciones robots Rimac)
  if (payload.type === 'SetTheStage') {
    if (payload.code) {
      if (!payload.code.includes('@Before')) {
        errors.push('❌ SetTheStage debe tener @Before');
      }
      if (!payload.code.includes('@After')) {
        errors.push('❌ SetTheStage debe tener @After');
      }
      if (!payload.code.includes('OnStage.setTheStage')) {
        errors.push('❌ SetTheStage debe llamar a OnStage.setTheStage()');
      }
      if (!payload.hasDrawTheCurtain) {
        errors.push('❌ CRÍTICO: SetTheStage debe tener OnStage.drawTheCurtain() en @After');
      }
    }
  }

  // Validaciones de Pages (opcional)
  if (payload.type === 'Page') {
    if (payload.pageContainsActionMethods) {
      errors.push('❌ Pages NO deben contener métodos de acción - usar Tasks');
    }

    warnings.push('⚠️ Pages son opcionales - considerar usar solo UI/');
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
  type: 'Task' | 'Interaction' | 'Question' | 'StepDefinition' | 'UI' | 'Page' | 'SetTheStage',
  code: string,
  className?: string
) {
  const payload: ValidationPayloadWeb = {
    code,
    type,
    className
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

  // Validaciones de naming conventions (actualizado)
  payload.usesCorrectFolderName = code.includes('userinterfaces') && !code.includes('userInterfaces');
  // UI classes can start with 'UI' or end with 'Page' (e.g., UIHome, LoginPage, UILoginPage)
  payload.usesCorrectUIClassName = className ? (className.startsWith('UI') || className.endsWith('Page')) : false;
  payload.usesLocatedByVsLocatedBy = code.includes('.locatedBy(') && !code.includes('.located(By.');
  payload.hasDrawTheCurtain = code.includes('drawTheCurtain()');
  payload.usesTheActorCalled = code.includes('theActorCalled(');

  if (type === 'Question') {
    payload.usesCorrectFactoryMethods = code.includes('.en(') || code.includes('.del(') || code.includes('.de(');
  }

  if (type === 'StepDefinition') {
    const methodMatches = code.match(/@(?:Given|When|Then|And|But|Dado|Cuando|Entonces|Y)\s*\([^)]+\)\s*public\s+void\s+\w+\([^)]*\)\s*\{([^}]+)\}/g);
    if (methodMatches) {
      methodMatches.forEach(match => {
        const lines = match.split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).length;
        if (lines > 3) {
          payload.stepsExceedThreeLines = true;
          payload.stepDefinitionsLines = lines;
        }
      });
    }

    payload.hasLogicInSteps = code.includes('if (') || code.includes('for (') ||
                           code.includes('while (') || code.includes('try {') ||
                           code.includes('catch (');
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

    // Validar prefijos de Targets - solo verifica que sigan el patrón PREFIX_NAME
    const targetMatches = code.matchAll(/public static final Target\s+(\w+)\s*=/g);
    let allValid = true;
    for (const match of targetMatches) {
      const targetName = match[1];
      if (targetName) {
        // Check if it follows the PREFIX_NAME pattern (uppercase letters followed by underscore)
        const followsPrefixPattern = /^[A-Z]+_/.test(targetName);
        if (!followsPrefixPattern) {
          allValid = false;
          break;
        }
      }
    }
    payload.usesCorrectTargetPrefixes = allValid;
  }

  return validateSerenityWeb(payload);
}

export function isValidTaskName(name: string): boolean {
  const validPatterns = [
    /^[A-Z][a-z]+[A-Z][a-z]+/,
    /^Abrir/,
    /^Buscar/,
    /^Iniciar/,
    /^Agregar/,
    /^Completar/,
    /^Navegar/,
    /^Registrar/,
    /^IniciarSesion/,
    /^CerrarSesion/,
    /^Diligenciar/,
    /^Obtener/,
    /^Seleccionar/
  ];

  return validPatterns.some(pattern => pattern.test(name));
}

export function isValidQuestionName(name: string): boolean {
  return name.includes('Es') ||
         name.includes('Del') ||
         name.includes('De') ||
         name.startsWith('Elemento') ||
         name.startsWith('Texto') ||
         name.startsWith('Cantidad') ||
         name.startsWith('Verificar');
}

export function isValidUIName(name: string): boolean {
  // UI classes can start with 'UI' or end with 'Page' (e.g., UIHome, LoginPage, UILoginPage)
  return name.startsWith('UI') || name.endsWith('Page');
}
