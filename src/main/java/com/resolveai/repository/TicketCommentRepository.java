
package com.resolveai.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.resolveai.entity.TicketComment;

public interface TicketCommentRepository
        extends JpaRepository<TicketComment, Long> {

    List<TicketComment> findByTicketId(Long ticketId);
}
