package co.com.dummyjson.api.questions;

import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Question;
import net.serenitybdd.rest.SerenityRest;

/**
 * Question que obtiene el código de estado HTTP de la última respuesta.
 * Implementa el patrón Screenplay Question siguiendo las mejores prácticas de Serenity BDD.
 * Una Question permite al actor consultar el estado del sistema.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class ResponseStatusCodeQuestion implements Question<Integer> {

    /**
     * Constructor privado para forzar el uso del método estático.
     */
    private ResponseStatusCodeQuestion() {
    }

    /**
     * Método estático para crear una instancia de esta Question.
     * Proporciona una sintaxis legible y fluida para usar en los step definitions.
     * 
     * @return Nueva instancia de la Question
     */
    public static ResponseStatusCodeQuestion value() {
        return new ResponseStatusCodeQuestion();
    }

    /**
     * Ejecuta la consulta: obtiene el código de estado de la última respuesta HTTP.
     * 
     * @param actor Actor que realiza la consulta
     * @return Código de estado HTTP de la respuesta (ej: 200, 404, 500)
     */
    @Override
    public Integer answeredBy(Actor actor) {
        return SerenityRest.lastResponse().getStatusCode();
    }
}
