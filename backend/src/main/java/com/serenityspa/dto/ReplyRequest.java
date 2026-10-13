package com.serenityspa.dto;

import jakarta.validation.constraints.NotBlank;

public class ReplyRequest {

    @NotBlank(message = "Reply message cannot be empty")
    private String reply;

    public ReplyRequest() {}

    public ReplyRequest(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}
