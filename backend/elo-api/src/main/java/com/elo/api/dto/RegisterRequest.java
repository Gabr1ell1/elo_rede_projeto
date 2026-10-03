package com.elo.api.dto;

import com.elo.api.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RegisterRequest {

    @NotBlank(message = "username é obrigatório")
    private String username;

    @NotBlank(message = "password é obrigatório")
    private String password;

    @NotBlank(message = "email é obrigatório")
    private String email;

    @NotNull(message = "role é obrigatório")
    private Role role;

    private String cep; // opcional por enquanto

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
}