package co.com.dummyjson.api.tasks;

import co.com.dummyjson.api.interactions.CreateUserInteraction;
import co.com.dummyjson.api.models.UserModel;
import net.serenitybdd.screenplay.Actor;
import net.serenitybdd.screenplay.Task;

import static net.serenitybdd.screenplay.Tasks.instrumented;

/**
 * Task que crea un nuevo usuario en la API.
 * Implementa el patrón Screenplay Task siguiendo las mejores prácticas de Serenity BDD.
 * Un Task representa una acción de negocio que el actor puede realizar.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class CreateUserTask implements Task {

    private final String endpoint;
    private final UserModel userData;

    /**
     * Constructor privado usado por el método estático.
     * 
     * @param endpoint Endpoint a consultar
     * @param userData Datos del usuario a crear
     */
    private CreateUserTask(String endpoint, UserModel userData) {
        this.endpoint = endpoint;
        this.userData = userData;
    }

    /**
     * Método estático para crear una instancia de este Task.
     * Proporciona una sintaxis legible y fluida para usar en los step definitions.
     * 
     * @param endpoint Endpoint a consultar
     * @param userData Datos del usuario a crear
     * @return Nueva instancia del Task
     */
    public static CreateUserTask withData(String endpoint, UserModel userData) {
        return instrumented(CreateUserTask.class, endpoint, userData);
    }

    /**
     * Ejecuta el Task: crea un usuario usando la interacción correspondiente.
     * El actor debe tener la habilidad CallAnApi configurada.
     * 
     * @param actor Actor que ejecuta el Task
     * @param <T> Tipo genérico del Actor
     */
    @Override
    public <T extends Actor> void performAs(T actor) {
        actor.attemptsTo(
            CreateUserInteraction.withData(endpoint, userData)
        );
    }
}
