package com.dapurelnoor.cashier.printer;

import com.google.gson.annotations.SerializedName;

public class PrinterDevice {
    @SerializedName("id")
    private String id;
    
    @SerializedName("name")
    private String name;
    
    @SerializedName("address")
    private String address;
    
    @SerializedName("type")
    private String type;
    
    @SerializedName("status")
    private String status;
    
    @SerializedName("details")
    private PrinterDetails details;

    public PrinterDevice() {}

    public static class PrinterDetails {
        @SerializedName("manufacturer")
        private String manufacturer;
        
        @SerializedName("model")
        private String model;
        
        @SerializedName("serialNumber")
        private String serialNumber;
        
        @SerializedName("vendorId")
        private Integer vendorId;
        
        @SerializedName("productId")
        private Integer productId;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public PrinterDetails getDetails() { return details; }
    public void setDetails(PrinterDetails details) { this.details = details; }
}