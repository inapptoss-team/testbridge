package com.example.test_toss_bridge.api;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/**
 * Spring Boot 백엔드의 GameProgress DTO에 대응하는 안드로이드의 데이터 클래스입니다.
 * API 응답을 파싱하기 위해 Gson 라이브러리와 함께 사용됩니다.
 */
public class GameProgress {

    @SerializedName("playerId")
    private String playerId;

    @SerializedName("completedPuzzles")
    private List<String> completedPuzzles;

    // Gson과 같은 라이브러리는 객체 생성을 위해 기본 생성자를 필요로 하는 경우가 많습니다.
    public GameProgress() {}

    // Getter와 Setter는 private 필드에 접근하기 위해 필요합니다.
    public String getPlayerId() {
        return playerId;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public List<String> getCompletedPuzzles() {
        return completedPuzzles;
    }

    public void setCompletedPuzzles(List<String> completedPuzzles) {
        this.completedPuzzles = completedPuzzles;
    }
}
