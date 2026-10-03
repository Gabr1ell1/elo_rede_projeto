package com.elo.api.dto;


public class StatsResponse {
     private String userId;
    private String username;
  

    public StatsResponse(String userId, String username) {
        this.userId = userId;
        this.username = username;
     
    }

    public String getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }


}
