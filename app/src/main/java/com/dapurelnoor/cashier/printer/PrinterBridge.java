package com.dapurelnoor.cashier.printer;

import android.content.Context;

public class PrinterBridge {
    private final PrinterManager printerManager;

    public PrinterBridge(Context context) {
        this.printerManager = new PrinterManager(context);
    }

    public String getPrinterList() {
        return printerManager.getPrinterList();
    }

    public boolean connectPrinter(String address) {
        return printerManager.connectPrinter(address);
    }

    public boolean printReceipt(String base64Image, String options) {
        return printerManager.printReceipt(base64Image, options);
    }

    public boolean disconnectPrinter() {
        printerManager.disconnect();
        return true;
    }

    public boolean checkPrinterConnection(String address) {
        // Implement connection check logic
        return true;
    }
}