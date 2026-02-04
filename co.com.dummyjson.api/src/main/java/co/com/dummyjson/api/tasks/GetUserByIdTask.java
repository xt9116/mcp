package co.com.dummyjson.api.tasks;

import co.com.dummyjson.api.interactions.GetUserByIdInteraction;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;
import net.serenitybdd.screenplay.rest.abilities.CallAnApi;

import static net.serenitybdd.screenplay.Tasks.instrumented;

/**
 * Task que obtiene información de un usuario por su ID.
 * Implementa el patrón Screenplay Task siguiendo las mejores prácticas de Serenity BDD.
 * Un Task representa una acción de negocio que el actor puede realizar.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class GetUserByIdTask implements Task {

    private final String endpoint;
    private final Integer userId;

    /**
     * Constructor privado usado por el método estático.
     * 
     * @param endpoint Endpoint a consultar
     * @param userId ID del usuario a obtener
     */
    private GetUserByIdTask(String endpoint, Integer userId) {
        this.endpoint = endpoint;
        this.userId = userId;
    }

    /**
     * Método estático para crear una instancia de este Task.
     * Proporciona una sintaxis legible y fluida para usar en los step definitions.
     * 
     * @param endpoint Endpoint a consultar
     * @param userId ID del usuario a obtener
     * @return Nueva instancia del Task
     */
    public static GetUserByIdTask withId(String endpoint, Integer userId) {
        return instrumented(GetUserByIdTask.class, endpoint, userId);
    }

    /**
     * Ejecuta el Task: obtiene un usuario por ID usando la interacción correspondiente.
     * El actor debe tener la habilidad CallAnApi configurada.
     * 
     * @param actor Actor que ejecuta el Task
     * @param <T> Tipo genérico del Actor
     */
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            GetUserByIdInteraction.withId(endpoint, userId)
        );
    }
}
