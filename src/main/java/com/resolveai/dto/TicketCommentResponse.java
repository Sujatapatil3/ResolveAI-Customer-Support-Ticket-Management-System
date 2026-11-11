
package com.resolveai.dto;

import java.time.LocalDateTime;

import com.resolveai.entity.UserRole;

public class TicketCommentResponse {

    private Long id;
    private String message;
    private LocalDateTime createdAt;
    private Long ticketId;
    private String authorEmail;
    private UserRole authorRole;

    public TicketCommentResponse() {
    }

    public TicketCommentResponse(
            Long id,
            String message,
            LocalDateTime createdAt,
            Long ticketId,
            String authorEmail,
            UserRole authorRole) {

        this.id = id;
        this.message = message;
        this.createdAt = createdAt;
        this.ticketId = ticketId;
        this.authorEmail = authorEmail;
        this.authorRole = authorRole;
    }

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public UserRole getAuthorRole() {
        return authorRole;
    }
}
