
package com.resolveai.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.resolveai.dto.TicketCommentResponse;
import com.resolveai.entity.TicketComment;
import com.resolveai.service.TicketCommentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class TicketCommentController {

    private final TicketCommentService commentService;

    public TicketCommentController(TicketCommentService commentService) {
        this.commentService = commentService;
    }

    

@PostMapping
public ResponseEntity<TicketCommentResponse> addComment(
        @PathVariable Long ticketId,
        @Valid @RequestBody TicketComment comment) {

    TicketCommentResponse savedComment =
            commentService.addComment(ticketId, comment);

    return ResponseEntity.status(HttpStatus.CREATED)
            .body(savedComment);
}

@GetMapping
public List<TicketCommentResponse> getComments(
        @PathVariable Long ticketId) {

    return commentService.getCommentsByTicketId(ticketId);
}

@DeleteMapping("/{commentId}")
public ResponseEntity<Void> deleteComment(
        @PathVariable Long ticketId,
        @PathVariable Long commentId) {

    commentService.deleteComment(ticketId, commentId);

    return ResponseEntity.noContent().build();
}

}

