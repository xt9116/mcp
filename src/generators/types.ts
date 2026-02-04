export interface ApiHURequest {
  huId: string;
  nombre: string;
  urlBase: string;
  endpoint: string;
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Array<{ name: string; value: string }>;
  parametros: Array<{ name: string; type: string; description: string }>;
  esquemaRespuesta: Record<string, any>;
  codigosRespuesta: Array<{ codigo: number; descripcion: string }>;
  validaciones: string[];
  flujoTask: string[];
  escenarioPrueba: {
    nombre: string;
    steps: string[];
    examples: Record<string, string>[];
  };
  packageName?: string; // Optional: Base package name for generated code (e.g., "co.com.rickandmorty")
}

export interface WebHURequest {
  huId: string;
  nombre: string;
  baseUrl: string;
  paginas: Array<{
    name: string;
    uiName: string;
    elements: Array<{
      prefix: string;
      name: string;
      selector: string;
    }>;
  }>;
  pasosFlujo: string[];
  validaciones: string[];
  gherkinScenario: string;
  packageName?: string; // Optional: Base package name for generated code (e.g., "co.com.rickandmorty")
}

export interface GeneratedHU {
  output: string;
  summary: {
    totalFiles: number;
    files: Array<{ name: string; type: string }>;
  };
}

export interface ParsedApiHURequest extends ApiHURequest {
  isValid: boolean;
  error?: string;
}