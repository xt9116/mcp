package co.com.dummyjson.api.endpoints;

/**
 * Clase que centraliza todos los endpoints de la API DummyJSON.
 * Sigue el principio de Single Responsibility al mantener las URLs en un solo lugar.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class DummyJsonEndpoints {

    /**
     * Constructor privado para prevenir instanciación.
     * Esta es una clase utilitaria con solo constantes estáticas.
     */
    private DummyJsonEndpoints() {
        throw new IllegalStateException("Utility class - do not instantiate");
    }

    /**
     * Endpoint para obtener un usuario por ID.
     * Método HTTP: GET
     * Ejemplo: /users/1
     */
    public static final String GET_USER_BY_ID = "/users/{id}";

    /**
     * Endpoint para obtener todos los usuarios.
     * Método HTTP: GET
     * Ejemplo: /users
     */
    public static final String GET_ALL_USERS = "/users";

    /**
     * Endpoint para crear un nuevo usuario.
     * Método HTTP: POST
     * Ejemplo: /users/add
     */
    public static final String CREATE_USER = "/users/add";

    /**
     * Endpoint para actualizar un usuario existente.
     * Método HTTP: PUT
     * Ejemplo: /users/1
     */
    public static final String UPDATE_USER = "/users/{id}";

    /**
     * Endpoint para eliminar un usuario.
     * Método HTTP: DELETE
     * Ejemplo: /users/1
     */
    public static final String DELETE_USER = "/users/{id}";
}
