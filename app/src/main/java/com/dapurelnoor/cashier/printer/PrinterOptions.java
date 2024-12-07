package com.dapurelnoor.cashier.printer;

import com.google.gson.annotations.SerializedName;

public class PrinterOptions {
    @SerializedName("copies")
    private int copies = 1;
    
    @SerializedName("paperSize")
    private String paperSize = "80mm";
    
    @SerializedName("cutPaper")
    private boolean cutPaper = true;
    
    @SerializedName("openCashDrawer")
    private boolean openCashDrawer = false;
    
    @SerializedName("dpi")
    private int dpi = 203;

    public int getCopies() { return copies; }
    public void setCopies(int copies) { this.copies = copies; }
    
    public String getPaperSize() { return paperSize; }
    public void setPaperSize(String paperSize) { this.paperSize = paperSize; }
    
    public boolean isCutPaper() { return cutPaper; }
    public void setCutPaper(boolean cutPaper) { this.cutPaper = cutPaper; }
    
    public boolean isOpenCashDrawer() { return openCashDrawer; }
    public void setOpenCashDrawer(boolean openCashDrawer) { this.openCashDrawer = openCashDrawer; }
    
    public int getDpi() { return dpi; }
    public void setDpi(int dpi) { this.dpi = dpi; }
}