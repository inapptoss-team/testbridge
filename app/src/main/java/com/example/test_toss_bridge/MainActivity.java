package com.example.test_toss_bridge;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;

import com.example.test_toss_bridge.api.ApiBridge;
import com.example.test_toss_bridge.api.ApiService;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * 메인 액티비티는 WebView를 호스팅하고, JavaScript와 Native Android 코드 간의
 * 통신을 설정하는 역할을 합니다.
 */
public class MainActivity extends AppCompatActivity {

    private WebView webView;

    // AndroidManifest.xml에 <uses-permission android:name="android.permission.INTERNET" /> 추가 필요

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);

        // 1. WebView 설정
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true); // JavaScript 실행 허용
        webSettings.setDomStorageEnabled(true);   // localStorage, sessionStorage 사용 허용

        // 2. Retrofit 클라이언트 설정
        // 10.0.2.2는 안드로이드 에뮬레이터가 개발 PC의 localhost를 가리키는 특수 IP입니다.
        String baseUrl = "http://10.0.2.2:8080/";

        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY); // 개발 중 API 통신 로그 확인

        OkHttpClient okHttpClient = new OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create()) // JSON <-> Java 객체 변환
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

        // 3. ApiBridge를 WebView에 연결
        // JavaScript에서 "Android"라는 이름으로 ApiBridge의 메소드를 호출할 수 있게 됩니다.
        webView.addJavascriptInterface(new ApiBridge(webView, apiService), "Android");

        // 4. 웹 페이지 로드
        webView.loadUrl("file:///android_asset/index.html");

        // WebView 디버깅 활성화 (Chrome 개발자 도구에서 확인 가능)
        WebView.setWebContentsDebuggingEnabled(true);
    }

    // 뒤로가기 버튼 처리
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
