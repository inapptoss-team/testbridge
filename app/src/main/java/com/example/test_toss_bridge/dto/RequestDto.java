package com.example.test_toss_bridge.dto;

public class RequestDto {
    private String state;

    public RequestDto() {}

    public RequestDto(String state) {
        this.state = state;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
