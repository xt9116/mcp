import { generateGuardarRespuesta, generateResponseStorage } from '../src/generators/serenity-api.generator.js';

describe('Response Storage Generators', () => {
  describe('generateGuardarRespuesta', () => {
    it('should generate GuardarRespuesta interaction with default ability', () => {
      const code = generateGuardarRespuesta('rimac.api');

      expect(code).toContain('package rimac.api.interactions;');
      expect(code).toContain('import net.serenitybdd.screenplay.Actor;');
      expect(code).toContain('import net.serenitybdd.screenplay.Interaction;');
      expect(code).toContain('import rimac.api.abilities.LlamarAPIsRimac;');
      expect(code).toContain('import java.util.function.Consumer;');
      expect(code).toContain('public class GuardarRespuesta<T> implements Interaction');
      expect(code).toContain('private final Class<T> responseClass;');
      expect(code).toContain('private final Consumer<T> setter;');
      expect(code).toContain('private final String nombreServicio;');
      expect(code).toContain('public static <T> GuardarRespuesta<T> de(');
      expect(code).toContain('LlamarAPIsRimac ability = actor.abilityTo(LlamarAPIsRimac.class);');
      expect(code).toContain('setter.accept(body);');
    });

    it('should generate GuardarRespuesta with custom ability class', () => {
      const code = generateGuardarRespuesta('com.example.api', 'CallAPI');

      expect(code).toContain('package com.example.api.interactions;');
      expect(code).toContain('import com.example.api.abilities.CallAPI;');
      expect(code).toContain('CallAPI ability = actor.abilityTo(CallAPI.class);');
    });

    it('should include proper JavaDoc', () => {
      const code = generateGuardarRespuesta('rimac.api');

      expect(code).toContain('/**');
      expect(code).toContain('* Interaction para guardar respuestas de API en memoria');
      expect(code).toContain('* Responsabilidad: Extraer y almacenar la respuesta deserializada para uso posterior');
      expect(code).toContain('* @param <T> Tipo de la clase de respuesta');
      expect(code).toContain('* @param responseClass Clase del modelo de respuesta');
      expect(code).toContain('* @param setter Consumer que guarda la respuesta');
      expect(code).toContain('* @param nombreServicio Nombre del servicio para logging');
    });
  });

  describe('generateResponseStorage', () => {
    it('should generate simple storage class', () => {
      const code = generateResponseStorage({
        packageName: 'rimac.api',
        moduleName: 'endoso',
        serviceName: 'ObtenerCliente',
        responseClassName: 'ValidarObtenerCliente',
        threadSafe: false
      });

      expect(code).toContain('package rimac.api.util.storage.endoso;');
      expect(code).toContain('import rimac.api.response.endoso.ValidarObtenerCliente;');
      expect(code).toContain('public class RespuestaObtenerCliente');
      expect(code).toContain('private static ValidarObtenerCliente response;');
      expect(code).toContain('public static void setRespuesta(ValidarObtenerCliente respuesta)');
      expect(code).toContain('public static ValidarObtenerCliente getRespuesta()');
      expect(code).not.toContain('ThreadLocal');
      expect(code).not.toContain('limpiar()');
    });

    it('should generate thread-safe storage class', () => {
      const code = generateResponseStorage({
        packageName: 'rimac.api',
        moduleName: 'endoso',
        serviceName: 'ObtenerCliente',
        responseClassName: 'ValidarObtenerCliente',
        threadSafe: true
      });

      expect(code).toContain('package rimac.api.util.storage.endoso;');
      expect(code).toContain('import rimac.api.response.endoso.ValidarObtenerCliente;');
      expect(code).toContain('public class RespuestaObtenerCliente');
      expect(code).toContain('private static ThreadLocal<ValidarObtenerCliente> response = new ThreadLocal<>();');
      expect(code).toContain('response.set(respuesta);');
      expect(code).toContain('return response.get();');
      expect(code).toContain('public static void limpiar()');
      expect(code).toContain('response.remove();');
    });

    it('should include proper JavaDoc for simple storage', () => {
      const code = generateResponseStorage({
        packageName: 'rimac.api',
        moduleName: 'endoso',
        serviceName: 'ObtenerCliente',
        responseClassName: 'ValidarObtenerCliente',
        threadSafe: false
      });

      expect(code).toContain('/**');
      expect(code).toContain('* Clase de almacenamiento para respuestas de ObtenerCliente');
      expect(code).toContain('* Responsabilidad: Mantener en memoria la respuesta para uso entre escenarios');
      expect(code).toContain('* Guarda la respuesta del servicio');
      expect(code).toContain('* @param respuesta Respuesta a almacenar');
      expect(code).toContain('* Obtiene la respuesta almacenada');
      expect(code).toContain('* @return Respuesta guardada previamente');
    });

    it('should include proper JavaDoc for thread-safe storage', () => {
      const code = generateResponseStorage({
        packageName: 'rimac.api',
        moduleName: 'endoso',
        serviceName: 'ObtenerCliente',
        responseClassName: 'ValidarObtenerCliente',
        threadSafe: true
      });

      expect(code).toContain('/**');
      expect(code).toContain('* Clase de almacenamiento thread-safe para respuestas de ObtenerCliente');
      expect(code).toContain('* Responsabilidad: Mantener en memoria la respuesta de forma segura para ejecución paralela');
      expect(code).toContain('* Guarda la respuesta del servicio para el thread actual');
      expect(code).toContain('* Obtiene la respuesta almacenada para el thread actual');
      expect(code).toContain('* Limpia la respuesta almacenada para el thread actual');
    });

    it('should generate storage for different modules', () => {
      const code = generateResponseStorage({
        packageName: 'com.example.api',
        moduleName: 'cliente',
        serviceName: 'CrearCliente',
        responseClassName: 'CrearClienteResponse',
        threadSafe: false
      });

      expect(code).toContain('package com.example.api.util.storage.cliente;');
      expect(code).toContain('import com.example.api.response.cliente.CrearClienteResponse;');
      expect(code).toContain('public class RespuestaCrearCliente');
      expect(code).toContain('private static CrearClienteResponse response;');
    });
  });

  describe('Integration tests', () => {
    it('should generate compatible GuardarRespuesta and ResponseStorage', () => {
      const interactionCode = generateGuardarRespuesta('rimac.api');
      const storageCode = generateResponseStorage({
        packageName: 'rimac.api',
        moduleName: 'endoso',
        serviceName: 'ObtenerCliente',
        responseClassName: 'ValidarObtenerCliente',
        threadSafe: false
      });

      // Verify they work together
      expect(interactionCode).toContain('Consumer<T> setter');
      expect(storageCode).toContain('public static void setRespuesta');
      
      // The setter method signature should be compatible
      expect(storageCode).toMatch(/public static void setRespuesta\(ValidarObtenerCliente respuesta\)/);
    });
  });
});
