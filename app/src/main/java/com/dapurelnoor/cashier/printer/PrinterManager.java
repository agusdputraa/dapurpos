package com.dapurelnoor.cashier.printer;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.util.Base64;
import android.util.Log;

import com.dantsu.escposprinter.EscPosPrinter;
import com.dantsu.escposprinter.connection.bluetooth.BluetoothConnection;
import com.dantsu.escposprinter.connection.usb.UsbConnection;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

public class PrinterManager {
    private static final String TAG = "PrinterManager";
    private final Context context;
    private final BluetoothAdapter bluetoothAdapter;
    private final UsbManager usbManager;
    private final Gson gson;
    private EscPosPrinter currentPrinter;

    public PrinterManager(Context context) {
        this.context = context;
        this.bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        this.usbManager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
        this.gson = new Gson();
    }

    public List<PrinterDevice> getAvailablePrinters() {
        List<PrinterDevice> printers = new ArrayList<>();
        
        // Get Bluetooth printers
        if (bluetoothAdapter != null) {
            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
            if (pairedDevices != null) {
                for (BluetoothDevice device : pairedDevices) {
                    if (isPrinterDevice(device)) {
                        PrinterDevice printer = new PrinterDevice();
                        printer.setId(device.getAddress());
                        printer.setName(device.getName());
                        printer.setAddress(device.getAddress());
                        printer.setType("bluetooth");
                        printer.setStatus("available");
                        
                        PrinterDevice.PrinterDetails details = new PrinterDevice.PrinterDetails();
                        details.setManufacturer(device.getName());
                        printer.setDetails(details);
                        
                        printers.add(printer);
                    }
                }
            }
        }

        // Get USB printers
        HashMap<String, UsbDevice> usbDevices = usbManager.getDeviceList();
        for (UsbDevice device : usbDevices.values()) {
            if (isPrinterDevice(device)) {
                PrinterDevice printer = new PrinterDevice();
                printer.setId(String.valueOf(device.getDeviceId()));
                printer.setName(device.getProductName());
                printer.setAddress(String.format("%04x:%04x", device.getVendorId(), device.getProductId()));
                printer.setType("usb");
                printer.setStatus("available");
                
                PrinterDevice.PrinterDetails details = new PrinterDevice.PrinterDetails();
                details.setManufacturer(device.getManufacturerName());
                details.setVendorId(device.getVendorId());
                details.setProductId(device.getProductId());
                printer.setDetails(details);
                
                printers.add(printer);
            }
        }

        return printers;
    }

    public String getPrinterList() {
        return gson.toJson(getAvailablePrinters());
    }

    public boolean connectPrinter(String address) {
        try {
            if (currentPrinter != null) {
                currentPrinter.disconnectPrinter();
                currentPrinter = null;
            }

            // Try Bluetooth connection first
            if (bluetoothAdapter != null) {
                BluetoothDevice device = bluetoothAdapter.getRemoteDevice(address);
                if (device != null) {
                    BluetoothConnection connection = new BluetoothConnection(device);
                    currentPrinter = new EscPosPrinter(connection, 203, 80f, 48);
                    return true;
                }
            }

            // Try USB connection
            HashMap<String, UsbDevice> usbDevices = usbManager.getDeviceList();
            for (UsbDevice device : usbDevices.values()) {
                String deviceAddress = String.format("%04x:%04x", device.getVendorId(), device.getProductId());
                if (deviceAddress.equals(address)) {
                    UsbConnection connection = UsbConnection.createUsbConnection(usbManager, device);
                    currentPrinter = new EscPosPrinter(connection, 203, 80f, 48);
                    return true;
                }
            }

            return false;
        } catch (Exception e) {
            Log.e(TAG, "Error connecting to printer", e);
            return false;
        }
    }

    public boolean printReceipt(String base64Image, String optionsJson) {
        try {
            if (currentPrinter == null) {
                Log.e(TAG, "No printer connected");
                return false;
            }

            PrinterOptions options = gson.fromJson(optionsJson, PrinterOptions.class);
            byte[] imageData = Base64.decode(base64Image, Base64.DEFAULT);

            // Print the receipt
            for (int i = 0; i < options.getCopies(); i++) {
                currentPrinter.printImage(imageData);
                
                if (options.isCutPaper()) {
                    currentPrinter.cut();
                }
                
                if (options.isOpenCashDrawer()) {
                    currentPrinter.openCashDrawer();
                }
            }

            return true;
        } catch (Exception e) {
            Log.e(TAG, "Error printing receipt", e);
            return false;
        }
    }

    private boolean isPrinterDevice(BluetoothDevice device) {
        // Basic printer detection - you might want to enhance this
        return device.getBluetoothClass() != null && 
               device.getBluetoothClass().getMajorDeviceClass() == BluetoothClass.Device.Major.IMAGING;
    }

    private boolean isPrinterDevice(UsbDevice device) {
        // USB printer class code is 7
        return device.getInterface(0).getInterfaceClass() == 7;
    }

    public void disconnect() {
        if (currentPrinter != null) {
            try {
                currentPrinter.disconnectPrinter();
            } catch (Exception e) {
                Log.e(TAG, "Error disconnecting printer", e);
            }
            currentPrinter = null;
        }
    }
}