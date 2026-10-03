package com.elo.api.dto;

import com.elo.api.model.Role;

public class AuthResponse {
  private String userId;
    private String username;
    private Role role;

        public AuthResponse(String userId, String username, Role role) {
        this.userId = userId;
        this.username = username;
        this.role = role;

    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    
    public Role getRole() { return role; }

}
