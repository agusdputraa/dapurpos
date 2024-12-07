package com.dapurelnoor.cashier;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private PrinterBridge printerBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Initialize PrinterBridge
        printerBridge = new PrinterBridge(this);
        
        // Set up WebView
        WebView webView = findViewById(R.id.webview);
        // Configure WebView settings...
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (printerBridge != null) {
            printerBridge.disconnectPrinter();
        }
    }
}