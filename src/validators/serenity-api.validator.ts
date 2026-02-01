interface ValidationPayload {
  // Código fuente o metadatos
  code?: string;
  type?: 'Task' | 'Interaction' | 'Question' | 'StepDefinition' | 'Model' | 'Builder' | 'Endpoint';
  
  // Validaciones específicas
  stepDefinitionsLines?: number;
  taskContainsHttp?: boolean;
  interactionContainsAssertions?: boolean;
  endpointIsVersioned?: boolean;
  endpointIsHardcoded?: boolean;
  modelContainsLogic?: boolean;
  questionReturnsValue?: boolean;
  builderContainsSendLogic?: boolean;
  usesStepsAnnotation?: boolean;
  taskUsesBusinessLanguage?: boolean;
  
  // Validaciones de estructura
  className?: string;
  implementsCorrectInterface?: boolean;
  hasStaticFactoryMethod?: boolean;
  hasPublicConstructor?: boolean;
  usesInstrumented?: boolean;
  
  // Validaciones de escenario
  scenarioValidatesStatusCode?: boolean;
  scenarioValidatesBodyField?: boolean;
  scenarioValidatesErrorMessage?: boolean;
}

export function validateSerenityApi(payload: ValidationPayload) {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ✅ 1. Validación de principios Screenplay First
  if (payload.usesStepsAnnotation) {
    errors.push("❌ PROHIBIDO: No usar @Steps annotation - usar Screenplay pattern");
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
    }
  }

  // ✅ 3. Validaciones de Tasks
  if (payload.type === 'Task') {
    if (payload.taskContainsHttp) {
      errors.push("❌ Los Tasks no deben contener llamadas HTTP directas - usar Interactions");
    }
    
    if (!payload.implementsCorrectInterface) {
      errors.push("❌ El Task debe implementar la interface Task");
    }
    
    if (!payload.hasStaticFactoryMethod) {
      warnings.push("⚠️ Se recomienda método estático factory (ej: with(), from())");
    }
    
    if (!payload.hasPublicConstructor) {
      errors.push("❌ CRÍTICO: El constructor del Task debe ser público (ByteBuddy requirement)");
    }
    
    if (!payload.usesInstrumented) {
      errors.push("❌ CRÍTICO: El factory method debe usar Tasks.instrumented() - NO usar 'new Task()'");
    }
    
    if (payload.code && (payload.code.includes('Post.to') || payload.code.includes('Get.resource'))) {
      errors.push("❌ Task no debe usar HTTP directo - delegar en Interactions");
    }
    
    if (!payload.taskUsesBusinessLanguage) {
      warnings.push("⚠️ El Task debe usar lenguaje de negocio, no términos técnicos");
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
      warnings.push("⚠️ Se recomienda método estático factory (ej: to(), with())");
    }
    
    if (!payload.hasPublicConstructor) {
      errors.push("❌ CRÍTICO: El constructor de la Interaction debe ser público (ByteBuddy requirement)");
    }
    
    if (!payload.usesInstrumented) {
      errors.push("❌ CRÍTICO: El factory method debe usar instrumented() - NO usar 'new Interaction()'");
    }
    
    if (payload.code && !payload.code.includes('actor.attemptsTo')) {
      errors.push("❌ Interaction debe usar actor.attemptsTo() en performAs()");
    }
  }

  // ✅ 5. Validaciones de Questions
  if (payload.type === 'Question') {
    if (!payload.questionReturnsValue) {
      errors.push("❌ La Question debe retornar un valor (Boolean, Integer, String, etc)");
    }
    
    if (!payload.implementsCorrectInterface) {
      errors.push("❌ La Question debe implementar Question<T> con tipo de retorno");
    }
    
    if (!payload.hasStaticFactoryMethod) {
      warnings.push("⚠️ Se recomienda método estático factory (ej: value(), of())");
    }
    
    if (payload.code && payload.usesInstrumented) {
      warnings.push("⚠️ Questions NO deben usar instrumented() - usar 'new Question()' directamente");
    }
    
    if (payload.code && !payload.code.includes('answeredBy')) {
      errors.push("❌ Question debe implementar el método answeredBy(Actor actor)");
    }
  }

  // ✅ 6. Validaciones de Models
  if (payload.type === 'Model') {
    if (payload.modelContainsLogic) {
      errors.push("❌ Los Models solo deben contener datos - sin lógica de negocio");
    }
    
    if (payload.code) {
      if (!payload.code.includes('@JsonIgnoreProperties(ignoreUnknown = true)')) {
        warnings.push("⚠️ Se recomienda @JsonIgnoreProperties(ignoreUnknown = true) en Models");
      }
      
      if (payload.code.includes('public void send') || payload.code.includes('public void post')) {
        errors.push("❌ El Model no debe tener métodos de envío o comunicación");
      }
    }
  }

  // ✅ 7. Validaciones de Builders
  if (payload.type === 'Builder') {
    if (payload.builderContainsSendLogic) {
      errors.push("❌ Los Builders no deben contener lógica de envío - solo construcción");
    }
    
    if (payload.code && !payload.code.includes('public static')) {
      warnings.push("⚠️ Builder debe tener métodos estáticos (ej: withValidData())");
    }
    
    if (payload.className && !payload.className.endsWith('Builder')) {
      warnings.push("⚠️ El Builder debe terminar con 'Builder' (ej: CreateUserRequestBuilder)");
    }
  }

  // ✅ 8. Validaciones de Endpoints
  if (payload.type === 'Endpoint') {
    if (payload.endpointIsHardcoded) {
      errors.push("❌ No hardcodear URLs - usar constantes en clase {Resource}Endpoints");
    }
    
    if (payload.endpointIsVersioned === false) {
      errors.push("❌ Los endpoints deben estar versionados (ej: /v1/users)");
    }
    
    if (payload.className && !payload.className.endsWith('Endpoints')) {
      warnings.push("⚠️ La clase de endpoints debe terminar con 'Endpoints'");
    }
    
    if (payload.code && !payload.code.includes('public static final String')) {
      errors.push("❌ Los endpoints deben ser constantes: public static final String");
    }
  }

  // ✅ 9. Validaciones de escenario completo (validaciones obligatorias)
  if (payload.scenarioValidatesStatusCode === false) {
    errors.push("❌ OBLIGATORIO: El escenario debe validar el Status Code");
  }
  
  if (payload.scenarioValidatesBodyField === false) {
    warnings.push("⚠️ RECOMENDADO: El escenario debe validar al menos un campo del body");
  }

  // ✅ 10. Validaciones de nombres según convenciones
  if (payload.className && payload.type) {
    const namingValidation = validateNamingConvention(payload.className, payload.type);
    if (!namingValidation.valid) {
      warnings.push(`⚠️ Convención de nombre: ${namingValidation.message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalIssues: errors.length + warnings.length,
      criticalIssues: errors.length,
      suggestions: warnings.length
    }
  };
}

function validateNamingConvention(className: string, type: string): { valid: boolean; message: string } {
  const conventions: Record<string, { pattern: RegExp; example: string }> = {
    'Task': { 
      pattern: /^[A-Z][a-z]+[A-Z][a-zA-Z]*$/, 
      example: 'CreateUser, GetPolicy, UpdateCustomer' 
    },
    'Interaction': { 
      pattern: /^(Post|Get|Put|Delete|Patch)Request$/, 
      example: 'PostRequest, GetRequest, PutRequest' 
    },
    'Question': { 
      pattern: /^Response[A-Z][a-zA-Z]*|^[A-Z][a-zA-Z]*Question$/, 
      example: 'ResponseStatusCode, ResponseBodyField, ErrorMessageQuestion' 
    },
    'Builder': { 
      pattern: /^[A-Z][a-zA-Z]*Builder$/, 
      example: 'CreateUserRequestBuilder' 
    },
    'Model': { 
      pattern: /^[A-Z][a-zA-Z]*(Request|Response)$/, 
      example: 'CreateUserRequest, UserResponse' 
    },
    'Endpoint': { 
      pattern: /^[A-Z][a-zA-Z]*Endpoints$/, 
      example: 'UserEndpoints, PolicyEndpoints' 
    }
  };

  const convention = conventions[type];
  if (!convention) {
    return { valid: true, message: '' };
  }

  if (!convention.pattern.test(className)) {
    return { 
      valid: false, 
      message: `${type} debe seguir el patrón: ${convention.example}` 
    };
  }

  return { valid: true, message: '' };
}

// Función auxiliar para validar código completo de una clase
export function validateSerenityClass(code: string, type: ValidationPayload['type']) {
  const payload: ValidationPayload = {
    code,
    type,
    implementsCorrectInterface: false,
    hasStaticFactoryMethod: false,
    hasPublicConstructor: false,
    usesInstrumented: false
  };

  // Detectar interface implementada
  if (type === 'Task' && code.includes('implements Task')) {
    payload.implementsCorrectInterface = true;
  }
  if (type === 'Interaction' && code.includes('implements Interaction')) {
    payload.implementsCorrectInterface = true;
  }
  if (type === 'Question' && code.includes('implements Question<')) {
    payload.implementsCorrectInterface = true;
  }

  // Detectar constructor público
  payload.hasPublicConstructor = /public\s+\w+\s*\([^)]*\)\s*\{/.test(code);

  // Detectar método factory estático
  if (code.includes('public static')) {
    payload.hasStaticFactoryMethod = true;
  }

  // Detectar uso de instrumented()
  payload.usesInstrumented = code.includes('instrumented(') || code.includes('Tasks.instrumented(');

  // Detectar HTTP en Tasks
  if (type === 'Task') {
    payload.taskContainsHttp = code.includes('Post.to(') || code.includes('Get.resource(') || 
                               code.includes('.post(') || code.includes('.get(');
  }

  // Detectar aserciones en Interactions
  if (type === 'Interaction') {
    payload.interactionContainsAssertions = code.includes('assert') || code.includes('should(');
  }

  // Detectar retorno en Questions
  if (type === 'Question') {
    payload.questionReturnsValue = code.includes('return ');
  }

  // Detectar lógica en Models
  if (type === 'Model') {
    const hasBusinessLogic = code.includes('if (') || code.includes('for (') || 
                            code.includes('calculate') || code.includes('validate');
    payload.modelContainsLogic = hasBusinessLogic;
  }

  // Detectar versionado en endpoints
  if (type === 'Endpoint') {
    payload.endpointIsVersioned = code.includes('/v1/') || code.includes('/v2/');
    payload.endpointIsHardcoded = /https?:\/\//.test(code) && !code.includes('public static final');
  }

  // Extraer nombre de clase
  const classMatch = code.match(/class\s+(\w+)/);
  if (classMatch) {
    payload.className = classMatch[1];
  }

  // Validar lenguaje de negocio en Tasks
  if (type === 'Task') {
    const hasBusinessTerms = /crear|obtener|actualizar|eliminar|buscar|procesar|validar/i.test(code);
    payload.taskUsesBusinessLanguage = hasBusinessTerms;
  }

  // Contar líneas en step definitions
  if (type === 'StepDefinition') {
    const methodMatches = code.match(/@(?:Given|When|Then|And|But)\s*\([^)]+\)\s*public\s+void\s+\w+\([^)]*\)\s*\{([^}]+)\}/g);
    if (methodMatches) {
      methodMatches.forEach(match => {
        const lines = match.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
        }).length;
        
        if (lines > 3) {
          payload.stepDefinitionsLines = lines;
        }
      });
    }
  }

  return validateSerenityApi(payload);
}

// Exportar funciones auxiliares
export function isValidTaskName(name: string): boolean {
  return /^[A-Z][a-z]+[A-Z][a-zA-Z]*$/.test(name);
}

export function isValidInteractionName(name: string): boolean {
  return /^(Post|Get|Put|Delete|Patch)Request$/.test(name);
}

export function isValidQuestionName(name: string): boolean {
  return /^Response[A-Z][a-zA-Z]*|^[A-Z][a-zA-Z]*Question$/.test(name);
}

export function isValidBuilderName(name: string): boolean {
  return /^[A-Z][a-zA-Z]*Builder$/.test(name);
}

export function isValidModelName(name: string): boolean {
  return /^[A-Z][a-zA-Z]*(Request|Response)$/.test(name);
}

export function isValidEndpointName(name: string): boolean {
  return /^[A-Z][a-zA-Z]*Endpoints$/.test(name);
}