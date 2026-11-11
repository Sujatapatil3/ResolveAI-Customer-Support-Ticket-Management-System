
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Search,
  LogOut,
  Menu,
  X,
  CircleHelp,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
} from "lucide-react";

import {
  getTicketComments,
  addTicketComment,
} from "../api";

import "./Dashboard.css";

const API_URL = "http://localhost:8080/api";

function Dashboard({ role }) {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Create ticket states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("MEDIUM");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  // AI classification states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCategory, setAiCategory] = useState("");
  const [aiError, setAiError] = useState("");

  // Agent update state
  const [updatingTicketId, setUpdatingTicketId] = useState(null);

  // Customer edit states
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Ticket conversation states
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  const token = sessionStorage.getItem("resolveai_token");

  // Read logged-in user's email from JWT.
  let userEmail = "User";

  try {
    if (token) {
      const encodedPayload = token.split(".")[1];
      const base64 = encodedPayload
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const payload = JSON.parse(
        atob(
          base64.padEnd(
            Math.ceil(base64.length / 4) * 4,
            "="
          )
        )
      );

      userEmail = payload.sub || "User";
    }
  } catch {
    userEmail = "User";
  }

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("resolveai_token");
    navigate("/login", { replace: true });
  };

  // Handle expired or invalid token
  const handleUnauthorized = () => {
    sessionStorage.removeItem("resolveai_token");
    navigate("/login", { replace: true });
  };

  // Fetch tickets
  const fetchTickets = async () => {
    if (!token) {
      handleUnauthorized();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load tickets. Please try again."
        );
      }

      const data = await response.json();

      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [role]);
  // Automatically refresh the open conversation every 5 seconds
  useEffect(() => {
    if (selectedTicketId === null) {
      return;
    }

    let isActive = true;

    const refreshConversation = async () => {
      try {
        const data = await getTicketComments(selectedTicketId);

        if (isActive) {
          setComments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isActive) {
          setCommentError(
            err.message || "Unable to refresh conversation."
          );
        }
      }
    };

    const intervalId = setInterval(
      refreshConversation,
      5000
    );

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [selectedTicketId]);


  // CUSTOMER: AI ticket classification
  const handleAIClassify = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      setAiError("Please enter the ticket title and description first.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiCategory("");

    try {
      const response = await fetch(`${API_URL}/ai/classify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI classification failed.");
      }

      const result = JSON.parse(data.result);

      setAiCategory(result.category);
      setNewPriority(result.priority);

    } catch (err) {
      setAiError(err.message || "Unable to classify ticket.");
    } finally {
      setAiLoading(false);
    }
  };

  // CUSTOMER: Create a new ticket

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    setFormError("");
    setFormMessage("");
    setCreating(true);

    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          
          status: "OPEN",
        }),
      });

      const responseText = await response.text();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseText || "Unable to create ticket."
        );
      }

      setNewTitle("");
      setNewDescription("");
      setNewPriority("MEDIUM");
      setAiCategory("");
      setAiError("");
      setShowCreateForm(false);

      setFormMessage(
        "Your support ticket was created successfully."
      );

      await fetchTickets();
    } catch (err) {
      setFormError(
        err.message || "Unable to create ticket."
      );
    } finally {
      setCreating(false);
    }
  };

  // AGENT: Update ticket status or priority
  const handleAgentUpdate = async (
    ticket,
    field,
    value
  ) => {
    const updatedTicket = {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      [field]: value,
    };

    setUpdatingTicketId(ticket.id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/tickets/${ticket.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTicket),
        }
      );

      const responseText = await response.text();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseText || "Unable to update ticket."
        );
      }

      await fetchTickets();
    } catch (err) {
      setError(
        err.message || "Unable to update ticket."
      );
    } finally {
      setUpdatingTicketId(null);
    }
  };

  // CUSTOMER: Update ticket title and description
  const handleCustomerUpdate = async (
    event,
    ticketId
  ) => {
    event.preventDefault();

    setEditError("");
    setSavingEdit(true);

    const ticket = tickets.find(
      (item) => item.id === ticketId
    );

    if (!ticket) {
      setEditError("Ticket not found.");
      setSavingEdit(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/tickets/${ticketId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            status: ticket.status,
            priority: ticket.priority,
          }),
        }
      );

      const responseText = await response.text();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseText || "Unable to update ticket."
        );
      }

      setEditingTicketId(null);
      setEditTitle("");
      setEditDescription("");

      await fetchTickets();
    } catch (err) {
      setEditError(
        err.message || "Unable to update ticket."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // Open a ticket conversation
  const handleOpenConversation = async (ticketId) => {
    setSelectedTicketId(ticketId);
    setComments([]);
    setCommentError("");
    setNewComment("");
    setCommentsLoading(true);

    try {
      const data = await getTicketComments(ticketId);

      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setCommentError(
        err.message || "Unable to load conversation."
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  // Send a new message
  const handleSendComment = async (event) => {
    event.preventDefault();

    const message = newComment.trim();

    if (!message || selectedTicketId === null) {
      return;
    }

    setSendingComment(true);
    setCommentError("");

    try {
      const savedComment = await addTicketComment(
        selectedTicketId,
        message
      );

      setComments((previousComments) => [
        ...previousComments,
        savedComment,
      ]);

      setNewComment("");
    } catch (err) {
      setCommentError(
        err.message || "Unable to send message."
      );
    } finally {
      setSendingComment(false);
    }
  };

  // Ticket statistics
  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "OPEN"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "RESOLVED"
  ).length;


  // Search, status and priority filtering
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (ticket.title || "")
          .toLowerCase()
          .includes(searchText) ||
        (ticket.description || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);


  // Priority badge styling
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "HIGH":
        return "priority-high";
      case "MEDIUM":
        return "priority-medium";
      case "LOW":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  // Status badge styling
  const getStatusClass = (status) => {
    switch (status) {
      case "OPEN":
        return "status-open";
      case "IN_PROGRESS":
        return "status-progress";
      case "RESOLVED":
        return "status-resolved";
      default:
        return "status-default";
    }
  };

  return (
    <div className="dashboard-layout">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""
          }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo">R</div>
          <span>ResolveAI</span>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="sidebar-section-label">
          WORKSPACE
        </p>

        <nav className="sidebar-nav">
          <a href="#overview" className="nav-link active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>

          <a href="#tickets" className="nav-link">
            <Ticket size={19} />
            <span>
              {role === "AGENT"
                ? "All Tickets"
                : "My Tickets"}
            </span>
            <span className="nav-count">
              {totalTickets}
            </span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <CircleHelp size={20} />
            <div>
              <strong>Need help?</strong>
              <span>
                Manage your support workspace
              </span>
            </div>
          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main dashboard */}
      <main className="dashboard-main">

        {/* Topbar */}
        <header className="dashboard-topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> Dashboard
          </div>

          <div className="topbar-right">
            <div className="user-avatar">
              {userEmail.charAt(0).toUpperCase()}
            </div>

            <span className="user-label">
              {userEmail}
            </span>
          </div>
        </header>

        <div className="dashboard-content">

          {/* Welcome section */}
          <section
            className="welcome-section"
            id="overview"
          >
            <div>
              <p className="welcome-eyebrow">
                {role === "AGENT"
                  ? "AGENT WORKSPACE"
                  : "CUSTOMER WORKSPACE"}
              </p>

              <h1>
                {role === "AGENT"
                  ? "Agent Dashboard"
                  : "My Dashboard"}
              </h1>

              <p className="welcome-description">
                {role === "AGENT"
                  ? "View and manage customer support tickets."
                  : "Create support requests and track their progress."}
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={fetchTickets}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </section>

          {/* Statistics */}
          <section className="stats-grid">

            <div className="stat-card">
              <div className="stat-top">
                <span>Total Tickets</span>
                <div className="stat-icon icon-purple">
                  <Ticket size={20} />
                </div>
              </div>

              <h2>{loading ? "—" : totalTickets}</h2>

              <p>
                {role === "AGENT"
                  ? "All customer tickets"
                  : "Your support tickets"}
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Open Tickets</span>
                <div className="stat-icon icon-blue">
                  <AlertCircle size={20} />
                </div>
              </div>

              <h2>{loading ? "—" : openTickets}</h2>
              <p>Waiting for attention</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>In Progress</span>
                <div className="stat-icon icon-orange">
                  <Clock3 size={20} />
                </div>
              </div>

              <h2>{loading ? "—" : inProgressTickets}</h2>
              <p>Currently being handled</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Resolved</span>
                <div className="stat-icon icon-green">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <h2>{loading ? "—" : resolvedTickets}</h2>
              <p>Successfully completed</p>
            </div>

          </section>

          {/* Customer create ticket section */}
          {role === "CUSTOMER" && (
            <section className="create-ticket-section">
              <div>
                <h2>Need help with something?</h2>
                <p>
                  Create a support ticket and our team will assist you.
                </p>
              </div>

              <button
                className="create-ticket-button"
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setFormError("");
                  setFormMessage("");
                  setAiCategory("");
                  setAiError("");
                }}
              >
                <Plus size={17} />
                Create Ticket
              </button>
            </section>
          )}

          {formMessage && (
            <p className="form-success-message">
              {formMessage}
            </p>
          )}

          {/* Create ticket form */}
          {showCreateForm && role === "CUSTOMER" && (
            <section className="ticket-form-section">
              <h2>Create a Support Ticket</h2>

              <form onSubmit={handleCreateTicket}>
                <label htmlFor="ticket-title">
                  Ticket title
                </label>

                <input
                  id="ticket-title"
                  type="text"
                  placeholder="Briefly describe your issue"
                  value={newTitle}
                  onChange={(event) =>
                    setNewTitle(event.target.value)
                  }
                  maxLength={150}
                  required
                />

                <label htmlFor="ticket-description">
                  Description
                </label>

                <textarea
                  id="ticket-description"
                  placeholder="Explain your issue in detail..."
                  value={newDescription}
                  onChange={(event) =>
                    setNewDescription(event.target.value)
                  }
                  rows={4}
                  required
                />

                <button
                  type="button"
                  className="create-ticket-button"
                  onClick={handleAIClassify}
                  disabled={aiLoading}
                >
                  {aiLoading ? "Analyzing..." : "✨ AI Classify"}
                </button>

                {aiError && (
                  <p className="form-error-message">
                    {aiError}
                  </p>
                )}

                {aiCategory && (
                  <div className="ai-result">
                    <strong>AI Classification Result</strong>
                    <p>Category: {aiCategory}</p>
                    <p>Suggested Priority: {newPriority}</p>
                  </div>
                )}


                <label htmlFor="ticket-priority">
                  Priority
                </label>

                <select
                  id="ticket-priority"
                  value={newPriority}
                  onChange={(event) =>
                    setNewPriority(event.target.value)
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>

                {formError && (
                  <p className="form-error-message">
                    {formError}
                  </p>
                )}

                <div className="ticket-form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="create-ticket-button"
                    disabled={creating}
                  >
                    {creating
                      ? "Submitting..."
                      : "Submit Ticket"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Tickets section */}
          <section
            className="tickets-section"
            id="tickets"
          >
            <div className="tickets-heading">
              <div>
                <h2>
                  {role === "AGENT"
                    ? "Customer Tickets"
                    : "My Support Tickets"}
                </h2>

                <p>
                  {role === "AGENT"
                    ? "Review and manage incoming customer requests."
                    : "View and track your support requests."}
                </p>
              </div>

              <span className="ticket-total">
                {filteredTickets.length} tickets
              </span>
            </div>


            {/* Search and filter */}
            <div className="ticket-toolbar">
              <div className="search-box">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="status-filter"
                aria-label="Filter tickets by status"
              >
                <option value="ALL">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
                className="status-filter"
                aria-label="Filter tickets by priority"
              >
                <option value="ALL">All priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="dashboard-message">
                <RefreshCw
                  className="loading-icon"
                  size={22}
                />
                <p>Loading tickets...</p>
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div className="dashboard-message error-message">
                <AlertCircle size={22} />
                <p>{error}</p>
                <button onClick={fetchTickets}>
                  Try again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading &&
              !error &&
              filteredTickets.length === 0 && (
                <div className="dashboard-message">
                  <Ticket size={28} />
                  <h3>No tickets found</h3>

                  <p>
                    {tickets.length === 0
                      ? "Your support tickets will appear here."
                      : "Try changing your search or status filter."}
                  </p>
                </div>
              )}

            {/* Ticket table */}
            {!loading &&
              !error &&
              filteredTickets.length > 0 && (
                <div className="ticket-table-wrapper">
                  <table className="ticket-table">

                    <thead>
                      <tr>
                        <th>Ticket</th>
                        <th>Description</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Conversation</th>

                        {role === "CUSTOMER" && (
                          <th>Actions</th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id}>

                          {/* 1. Ticket column */}
                          <td>
                            <div className="ticket-title">
                              <span className="ticket-id">
                                #{ticket.id}
                              </span>

                              <strong>{ticket.title}</strong>
                            </div>
                          </td>

                          {/* 2. Description column */}
                          <td className="ticket-description">
                            {ticket.description ||
                              "No description provided"}
                          </td>

                          {/* 3. Priority column */}
                          <td>
                            {role === "AGENT" ? (
                              <select
                                className="agent-ticket-select"
                                value={ticket.priority || "MEDIUM"}
                                disabled={
                                  updatingTicketId === ticket.id
                                }
                                onChange={(event) =>
                                  handleAgentUpdate(
                                    ticket,
                                    "priority",
                                    event.target.value
                                  )
                                }
                                aria-label={`Change priority for ticket ${ticket.id}`}
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                              </select>
                            ) : (
                              <span
                                className={`priority-badge ${getPriorityClass(
                                  ticket.priority
                                )}`}
                              >
                                {ticket.priority || "N/A"}
                              </span>
                            )}
                          </td>

                          {/* 4. Status column */}
                          <td>
                            {role === "AGENT" ? (
                              <select
                                className="agent-ticket-select"
                                value={ticket.status || "OPEN"}
                                disabled={
                                  updatingTicketId === ticket.id
                                }
                                onChange={(event) =>
                                  handleAgentUpdate(
                                    ticket,
                                    "status",
                                    event.target.value
                                  )
                                }
                                aria-label={`Change status for ticket ${ticket.id}`}
                              >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">
                                  In Progress
                                </option>
                                <option value="RESOLVED">
                                  Resolved
                                </option>
                              </select>
                            ) : (
                              <span
                                className={`status-badge ${getStatusClass(
                                  ticket.status
                                )}`}
                              >
                                {ticket.status
                                  ? ticket.status.replace("_", " ")
                                  : "UNKNOWN"}
                              </span>
                            )}
                          </td>

                          {/* 5. Conversation column */}
                          <td>
                            <button
                              type="button"
                              className="edit-ticket-button"
                              onClick={() =>
                                handleOpenConversation(ticket.id)
                              }
                            >
                              View Conversation
                            </button>
                          </td>

                          {/* 6. Customer Actions column */}
                          {role === "CUSTOMER" && (
                            <td>
                              <button
                                type="button"
                                className="edit-ticket-button"
                                onClick={() => {
                                  setEditingTicketId(ticket.id);
                                  setEditTitle(ticket.title);
                                  setEditDescription(
                                    ticket.description || ""
                                  );
                                  setEditError("");
                                }}
                              >
                                Edit
                              </button>
                            </td>
                          )}

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}

            {/* Customer edit popup */}
            {role === "CUSTOMER" &&
              filteredTickets.map((ticket) =>
                editingTicketId === ticket.id ? (
                  <div
                    key={ticket.id}
                    className="edit-modal-overlay"
                    onClick={() => {
                      setEditingTicketId(null);
                      setEditError("");
                    }}
                  >
                    <form
                      className="edit-ticket-form edit-ticket-modal"
                      onClick={(event) => event.stopPropagation()}
                      onSubmit={(event) =>
                        handleCustomerUpdate(event, ticket.id)
                      }
                    >
                      <div className="edit-modal-heading">
                        <div>
                          <span className="modal-eyebrow">TICKET DETAILS</span>
                          <h3>Edit Ticket #{ticket.id}</h3>
                        </div>
                        <button
                          type="button"
                          className="modal-close-button"
                          onClick={() => {
                            setEditingTicketId(null);
                            setEditError("");
                          }}
                          aria-label="Close edit popup"
                        >
                          <X size={19} />
                        </button>
                      </div>

                      <label htmlFor={`edit-title-${ticket.id}`}>
                        Ticket Title
                      </label>
                      <input
                        id={`edit-title-${ticket.id}`}
                        type="text"
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        maxLength={150}
                        required
                      />

                      <label htmlFor={`edit-description-${ticket.id}`}>
                        Description
                      </label>
                      <textarea
                        id={`edit-description-${ticket.id}`}
                        value={editDescription}
                        onChange={(event) => setEditDescription(event.target.value)}
                        rows={5}
                        required
                      />

                      {editError && (
                        <p className="form-error-message">{editError}</p>
                      )}

                      <div className="ticket-form-actions">
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => {
                            setEditingTicketId(null);
                            setEditError("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="create-ticket-button"
                          disabled={savingEdit}
                        >
                          {savingEdit ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null
              )}

          </section>

          {/* Ticket conversation side drawer */}
          {selectedTicketId !== null && (
            <div
              className="conversation-drawer-overlay"
              onClick={() => {
                setSelectedTicketId(null);
                setComments([]);
                setCommentError("");
                setNewComment("");
              }}
            >
              <section
                className="conversation-section conversation-drawer"
                onClick={(event) => event.stopPropagation()}
              >
                {(() => {
                  const activeTicket = tickets.find(
                    (ticket) => ticket.id === selectedTicketId
                  );

                  return (
                    <>
                      <div className="conversation-topbar">
                        <div className="conversation-heading">
                          <div className="conversation-heading-icon">
                            <Ticket size={20} />
                          </div>
                          <div className="conversation-title">
                            <span className="conversation-eyebrow">SUPPORT THREAD</span>
                            <h2>{activeTicket?.title || "Ticket conversation"}</h2>
                            <div className="conversation-ticket-meta">
                              <span className="conversation-ticket-number">Ticket #{selectedTicketId}</span>
                              {activeTicket?.status && (
                                <span className={`conversation-status ${getStatusClass(activeTicket.status)}`}>
                                  {activeTicket.status.replace("_", " ")}
                                </span>
                              )}
                              {activeTicket?.priority && (
                                <span className={`conversation-priority ${getPriorityClass(activeTicket.priority)}`}>
                                  {activeTicket.priority} PRIORITY
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="conversation-close-button"
                          onClick={() => {
                            setSelectedTicketId(null);
                            setComments([]);
                            setCommentError("");
                            setNewComment("");
                          }}
                          aria-label="Close conversation"
                        >
                          <X size={16} />
                          <span>Close</span>
                        </button>
                      </div>

                      <div className="conversation-body">
                        <div className="conversation-date-divider"><span>MESSAGES</span></div>
                        {commentsLoading ? (
                          <div className="conversation-empty-state">
                            <span className="conversation-loading-dot" />
                            <p>Loading conversation...</p>
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="conversation-empty-state">
                            <div className="conversation-empty-icon"><Ticket size={22} /></div>
                            <strong>No messages yet</strong>
                            <p>Send a message below to start the conversation with support.</p>
                          </div>
                        ) : (
                          <div className="conversation-messages" aria-label="Ticket messages">
                            {comments.map((comment) => {
                              const isAgent = comment.authorRole === "AGENT";
                              return (
                                <div
                                  key={comment.id}
                                  className={`conversation-message-row ${isAgent ? "message-row-agent" : "message-row-customer"}`}
                                >
                                  <div className={`message-avatar ${isAgent ? "avatar-agent" : "avatar-customer"}`}>
                                    {isAgent ? "A" : "C"}
                                  </div>
                                  <div className={`conversation-message ${isAgent ? "agent-message" : "customer-message"}`}>
                                    <div className="message-author">
                                      <strong>{isAgent ? "Support Agent" : "Customer"}</strong>
                                      <span>{comment.authorEmail}</span>
                                    </div>
                                    <p>{comment.message}</p>
                                    <small>
                                      {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                                    </small>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {commentError && (
                          <p className="form-error-message conversation-error">{commentError}</p>
                        )}
                      </div>

                      <form className="conversation-composer" onSubmit={handleSendComment}>
                        <div className="composer-label-row">
                          <label htmlFor="new-comment">Your message</label>
                          <span>Press Send Message when you're ready</span>
                        </div>
                        <div className="composer-input-row">
                          <textarea
                            id="new-comment"
                            value={newComment}
                            onChange={(event) => setNewComment(event.target.value)}
                            placeholder="Write your message to the support team..."
                            rows={2}
                            maxLength={2000}
                            required
                          />
                          <button
                            type="submit"
                            className="composer-send-button"
                            disabled={sendingComment || !newComment.trim() || commentsLoading}
                          >
                            {sendingComment ? "Sending..." : "Send Message"}
                            <span aria-hidden="true">➤</span>
                          </button>
                        </div>
                        <div className="composer-helper">
                          <span>Messages are visible to the customer and support agent.</span>
                          <span>{newComment.length}/2000</span>
                        </div>
                      </form>
                    </>
                  );
                })()}
              </section>
            </div>
          )}

          {/* Footer */}
          <footer className="dashboard-footer">
            <span>
              © 2026 ResolveAI. All rights reserved.
            </span>
            <span>Support made simpler.</span>
          </footer>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
