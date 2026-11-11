
package com.resolveai.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.resolveai.entity.Ticket;
import com.resolveai.service.TicketService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

//    @GetMapping
//    public List<Ticket> getAllTickets(
//            @RequestParam(required = false) String status,
//            @RequestParam(required = false) String priority) {
//
//        return ticketService.getTicketsByFilters(status, priority);
//    }
    

//        @GetMapping
//       public List<Ticket> getAllTickets(
//            @RequestParam(required = false) String status,
//            @RequestParam(required = false) String priority,
//            @RequestParam(defaultValue = "createdAt") String sortBy,
//             @RequestParam(defaultValue = "desc") String direction) {
//
//         return ticketService.getTicketsByFiltersAndSort(
//               status, priority, sortBy, direction);
//}
     
    @GetMapping
    public List<Ticket> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            Authentication authentication) {

        String email = authentication.getName();

        List<Ticket> tickets = ticketService.getTicketsForUser(email);

        // Apply filters
        if (status != null) {
            tickets.removeIf(ticket ->
                    !ticket.getStatus().equalsIgnoreCase(status));
        }

        if (priority != null) {
            tickets.removeIf(ticket ->
                    !ticket.getPriority().equalsIgnoreCase(priority));
        }

        // Apply sorting
        tickets.sort((first, second) -> {
            int result;

            switch (sortBy) {
                case "title":
                    result = first.getTitle()
                            .compareToIgnoreCase(second.getTitle());
                    break;

                case "priority":
                    result = first.getPriority()
                            .compareToIgnoreCase(second.getPriority());
                    break;

                case "createdAt":
                default:
                    result = first.getCreatedAt()
                            .compareTo(second.getCreatedAt());
                    break;
            }

            return direction.equalsIgnoreCase("desc") ? -result : result;
        });

        return tickets;
    }
    
    
    @PostMapping
    public ResponseEntity<Ticket> createTicket(
            @Valid @RequestBody Ticket ticket,
            Authentication authentication) {

        String email = authentication.getName();

        Ticket createdTicket =
                ticketService.createTicket(ticket, email);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdTicket);
    }

    @GetMapping("/{id}")
    public Ticket getTicketById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        return ticketService.getTicketForUser(id, email);
    }
    
    
    @PutMapping("/{id}")
    public Ticket updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody Ticket ticket,
            Authentication authentication) {

        String email = authentication.getName();

        return ticketService.updateTicketForUser(
                id, ticket, email);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        ticketService.deleteTicketForUser(id, email);

        return ResponseEntity.noContent().build();
    }
}
