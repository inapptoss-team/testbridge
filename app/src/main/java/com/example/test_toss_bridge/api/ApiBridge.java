package com.example.test_toss_bridge.api;

import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.util.Log;

import com.google.gson.Gson;

import java.io.IOException;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * WebView의 JavaScript와 Android Native 코드 간의 통신을 담당하는 브릿지 클래스입니다.
 * JavaScript에서 이 클래스의 메소드를 호출하면, Retrofit을 통해 백엔드 API와 통신하고
 * 결과를 다시 JavaScript의 콜백 함수로 전달합니다.
 */
public class ApiBridge {
    private static final String TAG = "ApiBridge";

    private final WebView webView;
    private final ApiService apiService;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Gson gson = new Gson();

    public ApiBridge(WebView webView, ApiService apiService) {
        this.webView = webView;
        this.apiService = apiService;
    }

    /**
     * API 호출 결과를 JavaScript 콜백 함수로 전달하는 헬퍼 메소드입니다.
     * @param callbackName JavaScript에서 전달한 콜백 함수의 이름
     * @param resultData 성공 시 전달할 데이터 객체
     * @param errorData 실패 시 전달할 에러 정보 객체
     */
    private void postResult(final String callbackName, final Object resultData, final Object errorData) {
        // JavaScript 코드는 UI 스레드에서 실행되어야 합니다.
        mainHandler.post(() -> {
            if (callbackName == null || callbackName.isEmpty()) return;

            String resultJson = (resultData == null) ? "null" : gson.toJson(resultData);
            String errorJson = (errorData == null) ? "null" : gson.toJson(errorData);

            // window[callbackName](result, error) 형태의 JS 코드를 실행
            String script = String.format("window['%s'](%s, %s);", callbackName, resultJson, errorJson);
            
            Log.d(TAG, "Executing JS: " + script);
            webView.evaluateJavascript(script, null);
        });
    }

    // --- GameController Endpoints --- 

    @JavascriptInterface
    public void getProgress(String playerId, String callbackName) {
        apiService.getProgress(playerId).enqueue(new BridgeCallback<>(callbackName));
    }

    @JavascriptInterface
    public void saveProgress(String progressJson, String callbackName) {
        GameProgress progress = gson.fromJson(progressJson, GameProgress.class);
        apiService.saveProgress(progress).enqueue(new BridgeCallback<>(callbackName));
    }

    @JavascriptInterface
    public void completePuzzle(String playerId, String puzzleId, String callbackName) {
        apiService.completePuzzle(playerId, puzzleId).enqueue(new BridgeCallback<>(callbackName));
    }

    @JavascriptInterface
    public void resetProgress(String playerId, String callbackName) {
        apiService.resetProgress(playerId).enqueue(new BridgeCallback<>(callbackName));
    }

    @JavascriptInterface
    public void unlockAll(String playerId, String callbackName) {
        apiService.unlockAll(playerId).enqueue(new BridgeCallback<>(callbackName));
    }

    @JavascriptInterface
    public void getPuzzleStatus(String playerId, String puzzleId, String callbackName) {
        apiService.getPuzzleStatus(playerId, puzzleId).enqueue(new BridgeCallback<>(callbackName));
    }

    @JavascriptInterface
    public void getGameInfo(String callbackName) {
        apiService.getGameInfo().enqueue(new BridgeCallback<>(callbackName));
    }

    /**
     * Retrofit 통신의 결과를 처리하고 JavaScript 콜백을 호출하는 공통 Callback 클래스입니다.
     * @param <T> API 응답의 타입
     */
    private class BridgeCallback<T> implements Callback<T> {
        private final String callbackName;

        BridgeCallback(String callbackName) {
            this.callbackName = callbackName;
        }

        @Override
        public void onResponse(Call<T> call, Response<T> response) {
            if (response.isSuccessful()) {
                Log.d(TAG, "API aall success: " + call.request().url());
                postResult(callbackName, response.body(), null);
            } else {
                try {
                    String errorBody = response.errorBody() != null ? response.errorBody().string() : "Empty error body";
                    Log.e(TAG, "API call failed: " + response.code() + " - " + errorBody);
                    postResult(callbackName, null, errorBody);
                } catch (IOException e) {
                    Log.e(TAG, "Error reading error body", e);
                    postResult(callbackName, null, "Request failed with code: " + response.code());
                }
            }
        }

        @Override
        public void onFailure(Call<T> call, Throwable t) {
            Log.e(TAG, "API call failure: " + call.request().url(), t);
            postResult(callbackName, null, "Network error: " + t.getMessage());
        }
    }
}
