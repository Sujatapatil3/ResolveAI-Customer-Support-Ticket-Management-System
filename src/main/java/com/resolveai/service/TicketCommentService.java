
package com.resolveai.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.resolveai.dto.TicketCommentResponse;
import com.resolveai.entity.AppUser;
import com.resolveai.entity.Ticket;
import com.resolveai.entity.TicketComment;
import com.resolveai.entity.UserRole;
import com.resolveai.exception.ResourceNotFoundException;
import com.resolveai.repository.AppUserRepository;
import com.resolveai.repository.TicketCommentRepository;
import com.resolveai.repository.TicketRepository;

@Service
@Transactional
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final AppUserRepository userRepository;

    public TicketCommentService(
            TicketCommentRepository commentRepository,
            TicketRepository ticketRepository,
            AppUserRepository userRepository) {

        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // Get the currently logged-in user using the JWT email.
    private AppUser getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("User not found");
        }

        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    // Check whether the logged-in user can access this ticket.
    private void checkTicketAccess(Ticket ticket, AppUser user) {

        if (user.getRole() == UserRole.AGENT) {
            return;
        }

        if (user.getRole() == UserRole.CUSTOMER
                && ticket.getCreatedBy() != null
                && ticket.getCreatedBy().getId().equals(user.getId())) {
            return;
        }

        // Return 404 rather than revealing another customer's ticket.
        throw new ResourceNotFoundException("Ticket not found");
    }

    public TicketCommentResponse addComment(
            Long ticketId, TicketComment comment) {

        AppUser user = getLoggedInUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket not found"));

        checkTicketAccess(ticket, user);

        // Always use the logged-in user and requested ticket.
        // Never trust author or ticket details sent by the frontend.
        comment.setId(null);
        comment.setTicket(ticket);
        comment.setCreatedBy(user);
        comment.setCreatedAt(null);

        TicketComment savedComment =
                commentRepository.save(comment);

        return toResponse(savedComment);
    }

    @Transactional(readOnly = true)
    public List<TicketCommentResponse> getCommentsByTicketId(
            Long ticketId) {

        AppUser user = getLoggedInUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket not found"));

        checkTicketAccess(ticket, user);

        return commentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TicketCommentResponse toResponse(TicketComment comment) {

        AppUser author = comment.getCreatedBy();

        String authorEmail =
                author != null ? author.getEmail() : "Unknown";

        UserRole authorRole =
                author != null ? author.getRole() : null;

        return new TicketCommentResponse(
                comment.getId(),
                comment.getMessage(),
                comment.getCreatedAt(),
                comment.getTicket().getId(),
                authorEmail,
                authorRole
        );
    }
    
    public void deleteComment(Long ticketId, Long commentId) {

        AppUser user = getLoggedInUser();

        // Only agents can delete comments.
        if (user.getRole() != UserRole.AGENT) {
            throw new AccessDeniedException(
                    "Only agents can delete comments");
        }

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Comment not found"));

        // Ensure the comment belongs to the requested ticket.
        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new ResourceNotFoundException(
                    "Comment not found for this ticket");
        }

        commentRepository.delete(comment);
    }
}
