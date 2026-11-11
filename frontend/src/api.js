
const API_URL = "http://localhost:8080/api";

// Get the saved JWT token.
const getToken = () => {
  return sessionStorage.getItem("resolveai_token");
};

// Common headers for authenticated requests.
const getHeaders = (includeJson = false) => {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
    ...(includeJson && {
      "Content-Type": "application/json",
    }),
  };
};

// Handle API responses.
const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || `Request failed: ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Get comments for a ticket.
export const getTicketComments = async (ticketId) => {
  const response = await fetch(
    `${API_URL}/tickets/${ticketId}/comments`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};

// Add a comment to a ticket.
export const addTicketComment = async (
  ticketId,
  message
) => {
  const response = await fetch(
    `${API_URL}/tickets/${ticketId}/comments`,
    {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ message }),
    }
  );

  return handleResponse(response);
};
