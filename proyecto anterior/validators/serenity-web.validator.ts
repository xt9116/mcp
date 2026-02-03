interface ValidationPayloadWeb {
  // Código fuente o metadatos
  code?: string;
  type?: 'Task' | 'Interaction' | 'Question' | 'StepDefinition' | 'UI' | 'Page';
  
  // Validaciones específicas Web
  stepDefinitionsLines?: number;
  taskContainsWebDriverDirect?: boolean;
  interactionContainsAssertions?: boolean;
  uiContainsLogic?: boolean;
  uiUsesCorrectStrategy?: boolean;
  pageContainsActionMethods?: boolean;
  questionReturnsValue?: boolean;
  usesPageObjectModel?: boolean;
  usesFindByAnnotations?: boolean;
  taskUsesBusinessLanguage?: boolean;
  urlIsHardcoded?: boolean;
  
  // Validaciones de estructura
  className?: string;
  implementsCorrectInterface?: boolean;
  hasStaticFactoryMethod?: boolean;
  hasPublicConstructor?: boolean;
  usesInstrumented?: boolean;
  
  // Validaciones de escenario
  scenarioValidatesVisibility?: boolean;
  scenarioValidatesText?: boolean;
  scenarioValidatesElementCount?: boolean;
  
  // Validaciones de locators
  locatorStrategy?: 'id' | 'name' | 'cssSelector' | 'xpath';
  locatorIsStable?: boolean;
}

export function validateSerenityWeb(payload: ValidationPayloadWeb) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ✅ 1. Validación de principios Screenplay First (NO Page Object Model)
  if (payload.usesPageObjectModel) {
    errors.push("❌ PROHIBIDO: No usar Page Object Model tradicional - usar Screenplay pattern");
  }

  if (payload.usesFindByAnnotations) {
    errors.push("❌ PROHIBIDO: No usar @FindBy annotations - usar By locators estáticos en UI classes");
  }

  // ✅ 2. Validaciones de Step Definitions
  if (payload.type === 'StepDefinition') {
    if (payload.stepDefinitionsLines && payload.stepDefinitionsLines > 3) {
      errors.push("❌ Step Definitions supera el máximo de 3 líneas");
    }
    
    if (payload.code) {
      if (payload.code.includes('if (') || payload.code.includes('for (') || payload.code.includes('while (')) {
        errors.push("❌ Step Definitions no debe contener lógica (if, for, while)");
      }
      
      if (payload.code.includes('assertEquals') || payload.code.includes('assertTrue') || payload.code.includes('assertThat')) {
        errors.push("❌ Step Definitions no debe contener aserciones técnicas directas");
      }
      
      if (payload.code.includes('WebDriver') || payload.code.includes('driver.')) {
        errors.push("❌ Step Definitions no debe interactuar directamente con WebDriver");
      }
      
      if (!payload.code.includes('@Before') && !payload.code.includes('OnStage.setTheStage')) {
        warnings.push("⚠️ Se recomienda configurar OnStage en @Before hook");
      }
    }
  }

  // ✅ 3. Validaciones de Tasks
  if (payload.type === 'Task') {
    if (payload.taskContainsWebDriverDirect) {
      errors.push("❌ Los Tasks no deben contener interacciones directas con WebDriver - usar Interactions");
    }
    
    if (!payload.implementsCorrectInterface) {
      errors.push("❌ El Task debe implementar la interface Task");
    }
    
    if (!payload.hasStaticFactoryMethod) {
      warnings.push("⚠️ Se recomienda método estático factory (ej: con(), en(), desde())");
    }
    
    if (!payload.hasPublicConstructor) {
      errors.push("❌ CRÍTICO: El constructor del Task debe ser público (ByteBuddy requirement)");
    }
    
    if (!payload.usesInstrumented) {
      errors.push("❌ CRÍTICO: El factory method debe usar Tasks.instrumented() - NO usar 'new Task()'");
    }
    
    if (payload.code && (payload.code.includes('Click.on') || payload.code.includes('Enter.theValue'))) {
      warnings.push("⚠️ Preferir delegar acciones Serenity en Interactions custom para mayor reutilización");
    }
    
    if (!payload.taskUsesBusinessLanguage) {
      warnings.push("⚠️ El Task debe usar lenguaje de negocio, no términos técnicos");
    }
    
    if (payload.urlIsHardcoded && payload.code) {
      errors.push("❌ No hardcodear URLs en Tasks - usar constantes");
    }
  }

  // ✅ 4. Validaciones de Interactions
  if (payload.type === 'Interaction') {
    if (payload.interactionContainsAssertions) {
      errors.push("❌ Las Interactions no deben contener aserciones");
    }
    
    if (!payload.implementsCorrectInterface) {
      errors.push("❌ La Interaction debe implementar la interface Interaction");
    }
    
    if (!payload.hasStaticFactoryMethod) {
      warnings.push("⚠️ Se recomienda método estático factory (ej: el(), la(), en())");
    }
    
    if (!payload.hasPublicConstructor) {
      errors.push("❌ CRÍTICO: El constructor de la Interaction debe ser público (ByteBuddy requirement)");
    }
    
    if (!payload.usesInstrumented) {
      errors.push("❌ CRÍTICO: El factory method debe usar Tasks.instrumented() - NO usar 'new Interaction()'");
    }
    
    if (payload.code && !payload.code.includes('actor.attemptsTo')) {
      errors.push("❌ Interaction debe usar actor.attemptsTo() en performAs()");
    }
  }

  // ✅ 5. Validaciones de Questions
  if (payload.type === 'Question') {
    if (!payload.questionReturnsValue) {
      errors.push("❌ La Question debe retornar un valor (Boolean, String, Integer, etc)");
    }
    
    if (!payload.implementsCorrectInterface) {
      errors.push("❌ La Question debe implementar la interface Question<T>");
    }
    
    if (!payload.hasStaticFactoryMethod) {
      warnings.push("⚠️ Se recomienda método estático factory (ej: del(), de(), en())");
    }
    
    if (payload.code && payload.usesInstrumented) {
      warnings.push("⚠️ Questions NO deben usar instrumented() - usar 'new Question()' directamente");
    }
    
    if (payload.code && !payload.code.includes('BrowseTheWeb.as(actor)')) {
      warnings.push("⚠️ Questions web deben usar BrowseTheWeb.as(actor) para acceder al WebDriver");
    }
  }

  // ✅ 6. Validaciones de UI (Locators)
  if (payload.type === 'UI') {
    if (!payload.className?.endsWith('UI')) {
      errors.push("❌ Las clases de locators deben terminar en 'UI' (ej: HomePageUI)");
    }
    
    if (payload.uiContainsLogic) {
      errors.push("❌ Las clases UI NO deben contener lógica - solo locators (By selectors)");
    }
    
    if (payload.code) {
      if (!payload.code.includes('public static final By')) {
        errors.push("❌ Los locators deben ser 'public static final By'");
      }
      
      if (payload.code.includes('public void') || payload.code.includes('public String')) {
        errors.push("❌ Las clases UI NO deben contener métodos de acción");
      }
      
      if (!payload.code.includes('private') || !payload.code.includes('UI()')) {
        warnings.push("⚠️ Se recomienda constructor privado para evitar instanciación de clase UI");
      }
    }
    
    // Validar estrategia de locator
    if (payload.locatorStrategy === 'xpath' && !payload.locatorIsStable) {
      warnings.push("⚠️ XPath es frágil - preferir id > name > cssSelector");
    }
    
    if (payload.locatorStrategy === 'id' || payload.locatorStrategy === 'name') {
      // Excelente elección
    } else if (payload.locatorStrategy === 'cssSelector') {
      warnings.push("⚠️ CSS Selector es aceptable pero menos estable que id o name");
    } else if (payload.locatorStrategy === 'xpath') {
      warnings.push("⚠️ XPath es la estrategia menos estable - considerar alternativas");
    }
  }

  // ✅ 7. Validaciones de Pages (Opcional - Screenplay no las requiere)
  if (payload.type === 'Page') {
    if (payload.pageContainsActionMethods) {
      errors.push("❌ Pages en Screenplay NO deben contener métodos de acción - usar Tasks e Interactions");
    }
    
    warnings.push("⚠️ Pages son opcionales en Screenplay - considerar usar solo UI/ sin Pages");
    
    if (payload.code && (payload.code.includes('public void click') || payload.code.includes('public void type'))) {
      errors.push("❌ NO crear métodos de acción en Pages - delegar en Interactions");
    }
  }

  // ✅ 8. Validaciones de nombre y convenciones
  if (payload.className) {
    if (payload.type === 'Task' && !isValidTaskName(payload.className)) {
      warnings.push(`⚠️ Nombre de Task '${payload.className}' no sigue el patrón recomendado (Verbo + Complemento)`);
    }
    
    if (payload.type === 'Interaction' && !isValidInteractionName(payload.className)) {
      warnings.push(`⚠️ Nombre de Interaction '${payload.className}' no sigue el patrón recomendado (Acción + En/La/El)`);
    }
    
    if (payload.type === 'Question' && !isValidQuestionName(payload.className)) {
      warnings.push(`⚠️ Nombre de Question '${payload.className}' no sigue el patrón recomendado (Qué + Es/De + Complemento)`);
    }
  }

  // ✅ 9. Validaciones de escenarios
  if (payload.type === 'StepDefinition' && payload.code) {
    if (!payload.scenarioValidatesVisibility) {
      warnings.push("⚠️ El escenario debería validar visibilidad de al menos un elemento clave");
    }
    
    if (!payload.scenarioValidatesText && !payload.scenarioValidatesElementCount) {
      warnings.push("⚠️ El escenario debería validar texto o cantidad de elementos");
    }
  }

  // ✅ 10. Validaciones de @Step annotation
  if (payload.code && (payload.type === 'Task' || payload.type === 'Interaction')) {
    if (!payload.code.includes('@Step')) {
      warnings.push("⚠️ Se recomienda usar @Step annotation para mejor reporting");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: errors.length === 0 
      ? `✅ ${payload.type} válido según el estándar Serenity Screenplay Web`
      : `❌ ${errors.length} errores encontrados`,
  };
}

// Helper functions
function isValidTaskName(name: string): boolean {
  // Tareas deben ser verbo + complemento: BuscarProducto, IniciarSesion, AgregarAlCarrito
  const taskPattern = /^[A-Z][a-z]+[A-Z][a-z]+/;
  return taskPattern.test(name);
}

function isValidInteractionName(name: string): boolean {
  // Interactions: HacerClicEn, EscribirEn, NavegarA
  const commonInteractions = ['HacerClicEn', 'EscribirEn', 'NavegarA', 'EsperarElemento', 'SeleccionarOpcion', 'HacerScroll'];
  return commonInteractions.includes(name) || name.includes('En') || name.includes('A');
}

function isValidQuestionName(name: string): boolean {
  // Questions: ElementoEsVisible, TextoDelElemento, CantidadDeElementos
  return name.includes('Es') || name.includes('Del') || name.includes('De') || name.includes('Cantidad');
}

// Función para validar código completo
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

  // Detectar patrones en el código
  payload.implementsCorrectInterface = 
    (type === 'Task' && code.includes('implements Task')) ||
    (type === 'Interaction' && code.includes('implements Interaction')) ||
    (type === 'Question' && code.includes('implements Question<'));

  payload.hasStaticFactoryMethod = /public static \w+ \w+\(/.test(code);
  payload.hasPublicConstructor = /public \w+\(/.test(code);
  payload.usesInstrumented = code.includes('instrumented(');
  
  payload.taskContainsWebDriverDirect = code.includes('WebDriver') || code.includes('driver.');
  payload.interactionContainsAssertions = 
    code.includes('assertEquals') || 
    code.includes('assertTrue') || 
    code.includes('assertThat');
  
  payload.uiContainsLogic = 
    code.includes('public void') || 
    code.includes('if (') || 
    code.includes('for (');
  
  payload.pageContainsActionMethods = 
    code.includes('public void click') || 
    code.includes('public void type') ||
    code.includes('public void navigate');
  
  payload.usesPageObjectModel = code.includes('@FindBy');
  payload.usesFindByAnnotations = code.includes('@FindBy');
  payload.urlIsHardcoded = /https?:\/\/[^\s"']+/.test(code) && !code.includes('Constants.');
  
  payload.questionReturnsValue = 
    code.includes('implements Question<') && 
    !code.includes('implements Question<Void>');

  // Contar líneas en step definitions
  if (type === 'StepDefinition') {
    const methodMatches = code.match(/@(?:Given|When|Then|And|But)\s*\([^)]+\)\s*public\s+void\s+\w+\([^)]*\)\s*\{([^}]+)\}/g);
    if (methodMatches) {
      methodMatches.forEach(match => {
        const lines = match.split('\n').filter(line => line.trim() && !line.trim().startsWith('/')).length;
        if (lines > 3) {
          payload.stepDefinitionsLines = lines;
        }
      });
    }
  }

  // Validaciones de escenario
  payload.scenarioValidatesVisibility = code.includes('ElementoEsVisible') || code.includes('isVisible');
  payload.scenarioValidatesText = code.includes('TextoDelElemento') || code.includes('getText');
  payload.scenarioValidatesElementCount = code.includes('CantidadDeElementos') || code.includes('size()');

  return validateSerenityWeb(payload);
}
