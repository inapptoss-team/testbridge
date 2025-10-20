package com.example.test_toss_bridge.api;

import com.example.test_toss_bridge.dto.Message;
import retrofit2.Call;
import retrofit2.http.GET;

public interface ApiService {
    @GET("/")
    Call<Message> getHome();
}
