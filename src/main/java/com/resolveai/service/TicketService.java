package com.resolveai.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.resolveai.entity.Ticket;
import com.resolveai.exception.ResourceNotFoundException;
import com.resolveai.repository.TicketRepository;
import org.springframework.data.domain.Sort;
import com.resolveai.entity.AppUser;
import com.resolveai.repository.AppUserRepository;
import com.resolveai.entity.UserRole;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final AppUserRepository appUserRepository;
    

    public TicketService(
            TicketRepository ticketRepository,
            AppUserRepository appUserRepository) {

        this.ticketRepository = ticketRepository;
        this.appUserRepository = appUserRepository;
    }
    
    public List<Ticket> getTicketsForUser(String email) {

        AppUser user = getUserByEmail(email);

        if (user.getRole() == UserRole.AGENT) {
            return ticketRepository.findAll();
        }

        return ticketRepository.findByCreatedById(user.getId());
    }
    
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByFilters(String status, String priority) {

        if (status != null && priority != null) {
            return ticketRepository.findByStatusAndPriority(status, priority);
        }

        if (status != null) {
            return ticketRepository.findByStatus(status);
        }

        if (priority != null) {
            return ticketRepository.findByPriority(priority);
        }

        return ticketRepository.findAll();
    }

    public Ticket createTicket(Ticket ticket, String email) {

        AppUser user = getUserByEmail(email);

        if (user.getRole() != UserRole.CUSTOMER) {
            throw new IllegalArgumentException(
                    "Only customers can create tickets");
        }

        ticket.setCreatedBy(user);

        return ticketRepository.save(ticket);
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ticket not found with id: " + id));
    }

    public Ticket updateTicket(Long id, Ticket updatedTicket) {
        Ticket existingTicket = getTicketById(id);

        existingTicket.setTitle(updatedTicket.getTitle());
        existingTicket.setDescription(updatedTicket.getDescription());
        existingTicket.setStatus(updatedTicket.getStatus());
        existingTicket.setPriority(updatedTicket.getPriority());

        return ticketRepository.save(existingTicket);
    }

    public void deleteTicket(Long id) {
        Ticket ticket = getTicketById(id);
        ticketRepository.delete(ticket);
    }
    public List<Ticket> getSortedTickets(String sortBy, String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return ticketRepository.findAll(sort);
    }
    
    private AppUser getUserByEmail(String email) {
        return appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email));
    }
    
    
    public Ticket getTicketForUser(Long ticketId, String email) {

        AppUser user = getUserByEmail(email);

        if (user.getRole() == UserRole.AGENT) {
            return getTicketById(ticketId);
        }

        return ticketRepository
                .findByIdAndCreatedById(ticketId, user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ticket not found with id: " + ticketId));
    }

public List<Ticket> getTicketsByFiltersAndSort(
        String status, String priority, String sortBy, String direction) {

    List<Ticket> tickets = getTicketsByFilters(status, priority);

    tickets.sort((first, second) -> {
        int result;

        switch (sortBy) {
            case "title":
                result = first.getTitle().compareToIgnoreCase(second.getTitle());
                break;

            case "priority":
                result = first.getPriority().compareToIgnoreCase(second.getPriority());
                break;

            case "createdAt":
            default:
                result = first.getCreatedAt().compareTo(second.getCreatedAt());
                break;
        }

        return direction.equalsIgnoreCase("desc") ? -result : result;
    });

    return tickets;
}




public Ticket updateTicketForUser(
        Long ticketId, Ticket updatedTicket, String email) {

    AppUser user = getUserByEmail(email);

    Ticket existingTicket;

    if (user.getRole() == UserRole.AGENT) {
        existingTicket = getTicketById(ticketId);

        existingTicket.setStatus(updatedTicket.getStatus());
        existingTicket.setPriority(updatedTicket.getPriority());

    } else {
        existingTicket = ticketRepository
                .findByIdAndCreatedById(ticketId, user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ticket not found with id: " + ticketId));
    }

    existingTicket.setTitle(updatedTicket.getTitle());
    existingTicket.setDescription(updatedTicket.getDescription());

    return ticketRepository.save(existingTicket);
}



public void deleteTicketForUser(Long ticketId, String email) {

    AppUser user = getUserByEmail(email);

    Ticket ticket;

    if (user.getRole() == UserRole.AGENT) {
        ticket = getTicketById(ticketId);
    } else {
        ticket = ticketRepository
                .findByIdAndCreatedById(ticketId, user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ticket not found with id: " + ticketId));
    }

    ticketRepository.delete(ticket);
}


    
}
