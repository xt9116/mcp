// src/utils/file-manager.ts

export interface FileToGenerate {
  path: string;
  content: string;
  description?: string;
}

export class FileManager {
  
  /**
   * Valida que la ruta del archivo sea segura
   */
  static validatePath(path: string): boolean {
    // Validar que no haya path traversal
    if (path.includes('..') || path.includes('~')) {
      return false;
    }
    
    // Validar extensiones permitidas
    const allowedExtensions = ['.java', '.feature', '.properties', '.gradle', '.json', '.md'];
    const hasValidExtension = allowedExtensions.some(ext => path.endsWith(ext));
    
    return hasValidExtension;
  }

  /**
   * Genera la estructura de directorios para un archivo
   */
  static getDirectoryStructure(filePath: string): string {
    const parts = filePath.split('/');
    parts.pop(); // Remover el nombre del archivo
    return parts.join('/');
  }

  /**
   * Agrupa archivos por directorio
   */
  static groupFilesByDirectory(files: FileToGenerate[]): Map<string, FileToGenerate[]> {
    const grouped = new Map<string, FileToGenerate[]>();
    
    for (const file of files) {
      const dir = this.getDirectoryStructure(file.path);
      
      if (!grouped.has(dir)) {
        grouped.set(dir, []);
      }
      
      grouped.get(dir)!.push(file);
    }
    
    return grouped;
  }

  /**
   * Genera un resumen de archivos generados
   */
  static generateSummary(files: FileToGenerate[]): string {
    const grouped = this.groupFilesByDirectory(files);
    let summary = `📦 Total de archivos generados: ${files.length}\n\n`;
    
    for (const [dir, dirFiles] of grouped.entries()) {
      summary += `📁 ${dir}/\n`;
      for (const file of dirFiles) {
        const fileName = file.path.split('/').pop();
        summary += `   ├─ ${fileName}`;
        if (file.description) {
          summary += ` - ${file.description}`;
        }
        summary += '\n';
      }
      summary += '\n';
    }
    
    return summary;
  }

  /**
   * Valida que todos los archivos tengan rutas válidas
   */
  static validateAllFiles(files: FileToGenerate[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const file of files) {
      if (!this.validatePath(file.path)) {
        errors.push(`❌ Ruta inválida: ${file.path}`);
      }
      
      if (!file.content || file.content.trim().length === 0) {
        errors.push(`❌ Contenido vacío: ${file.path}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}