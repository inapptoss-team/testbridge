package com.example.test_toss_bridge.api;

import java.util.Map;
import retrofit2.Call;
import retrofit2.http.*;

/**
 * Retrofit 라이브러리가 사용할 API 엔드포인트 명세입니다.
 * Spring Boot의 GameController에 정의된 각 API 경로와 메소드에 해당합니다.
 */
public interface ApiService {

    @GET("game/progress/{playerId}")
    Call<GameProgress> getProgress(@Path("playerId") String playerId);

    @POST("game/progress")
    Call<GameProgress> saveProgress(@Body GameProgress progress);

    @POST("game/complete-puzzle")
    @FormUrlEncoded
    Call<Map<String, Object>> completePuzzle(
            @Field("playerId") String playerId,
            @Field("puzzleId") String puzzleId
    );

    @POST("game/reset/{playerId}")
    Call<Map<String, Object>> resetProgress(@Path("playerId") String playerId);

    @POST("game/unlock-all/{playerId}")
    Call<Map<String, Object>> unlockAll(@Path("playerId") String playerId);

    @GET("game/puzzle-status/{playerId}/{puzzleId}")
    Call<Map<String, Object>> getPuzzleStatus(
            @Path("playerId") String playerId,
            @Path("puzzleId") String puzzleId
    );

    @GET("game/info")
    Call<Map<String, Object>> getGameInfo();

    // PuzzleController에 대한 엔드포인트도 추가 (game-api.js에서 사용 중)
    @GET("puzzle/player/{playerId}")
    Call<Object> getPlayerPuzzles(@Path("playerId") String playerId);

    @POST("puzzle/submit")
    Call<Map<String, Object>> submitPuzzleAnswer(@Body Map<String, String> body);
}
