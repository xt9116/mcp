package co.com.dummyjson.api.models;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Modelo que representa un usuario de la API DummyJSON.
 * Implementa el patrón Builder para facilitar la creación de objetos complejos.
 * 
 * @author Serenity Automation Team
 * @version 1.0.0
 */
public class UserModel {

    @JsonProperty("id")
    private Integer id;

    @JsonProperty("firstName")
    private String firstName;

    @JsonProperty("lastName")
    private String lastName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("username")
    private String username;

    @JsonProperty("age")
    private Integer age;

    @JsonProperty("gender")
    private String gender;

    /**
     * Constructor privado para forzar el uso del Builder.
     */
    private UserModel() {
    }

    /**
     * Constructor privado usado por el Builder.
     * 
     * @param builder Instancia del builder con los valores configurados
     */
    private UserModel(Builder builder) {
        this.id = builder.id;
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.email = builder.email;
        this.phone = builder.phone;
        this.username = builder.username;
        this.age = builder.age;
        this.gender = builder.gender;
    }

    // Getters

    public Integer getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getUsername() {
        return username;
    }

    public Integer getAge() {
        return age;
    }

    public String getGender() {
        return gender;
    }

    /**
     * Clase Builder para construir instancias de UserModel.
     * Implementa el patrón Builder para facilitar la creación de objetos con múltiples parámetros.
     */
    public static class Builder {
        private Integer id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String username;
        private Integer age;
        private String gender;

        /**
         * Configura el ID del usuario.
         * 
         * @param id ID del usuario
         * @return Builder actual para encadenamiento
         */
        public Builder withId(Integer id) {
            this.id = id;
            return this;
        }

        /**
         * Configura el nombre del usuario.
         * 
         * @param firstName Nombre del usuario
         * @return Builder actual para encadenamiento
         */
        public Builder withFirstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        /**
         * Configura el apellido del usuario.
         * 
         * @param lastName Apellido del usuario
         * @return Builder actual para encadenamiento
         */
        public Builder withLastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        /**
         * Configura el email del usuario.
         * 
         * @param email Email del usuario
         * @return Builder actual para encadenamiento
         */
        public Builder withEmail(String email) {
            this.email = email;
            return this;
        }

        /**
         * Configura el teléfono del usuario.
         * 
         * @param phone Teléfono del usuario
         * @return Builder actual para encadenamiento
         */
        public Builder withPhone(String phone) {
            this.phone = phone;
            return this;
        }

        /**
         * Configura el nombre de usuario.
         * 
         * @param username Nombre de usuario
         * @return Builder actual para encadenamiento
         */
        public Builder withUsername(String username) {
            this.username = username;
            return this;
        }

        /**
         * Configura la edad del usuario.
         * 
         * @param age Edad del usuario
         * @return Builder actual para encadenamiento
         */
        public Builder withAge(Integer age) {
            this.age = age;
            return this;
        }

        /**
         * Configura el género del usuario.
         * 
         * @param gender Género del usuario
         * @return Builder actual para encadenamiento
         */
        public Builder withGender(String gender) {
            this.gender = gender;
            return this;
        }

        /**
         * Construye la instancia final de UserModel con los valores configurados.
         * 
         * @return Nueva instancia de UserModel
         */
        public UserModel build() {
            return new UserModel(this);
        }
    }
}
