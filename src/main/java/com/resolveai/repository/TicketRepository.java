
package com.resolveai.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.resolveai.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByStatus(String status);

    List<Ticket> findByPriority(String priority);

    List<Ticket> findByStatusAndPriority(String status, String priority);
    
    List<Ticket> findByCreatedById(Long userId);
    Optional<Ticket> findByIdAndCreatedById(Long ticketId, Long userId);
}

