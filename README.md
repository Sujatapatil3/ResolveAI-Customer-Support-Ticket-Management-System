# ResolveAI – AI-Powered Customer Support Ticket Management System

ResolveAI is a full-stack customer support ticket management application built using React, Spring Boot, and MySQL. It helps customers raise and track support tickets while allowing support agents to manage tickets and communicate with customers.

The application also integrates Google Gemini AI to analyze ticket descriptions, suggest categories, and recommend ticket priorities.

## Features

### Authentication and Authorization
- Customer and Agent login.
- User registration.
- JWT-based authentication.
- Password encryption using BCrypt.
- Role-based access control.

### Ticket Management
- Create and manage support tickets.
- Update ticket details.
- Track ticket status.
- Set ticket priority.
- View customer-specific tickets.
- Agents can manage customer tickets.

### AI-Powered Ticket Classification
- Integrates Google Gemini API.
- Analyzes ticket titles and descriptions.
- Automatically suggests ticket categories.
- Recommends ticket priority.
- Saves AI-generated category and priority in MySQL.

### Communication
- Ticket comments and conversations.
- Customer-Agent communication.

### Dashboard
- Separate Customer and Agent dashboards.
- Search tickets.
- Filter tickets by status and priority.
- View ticket details and updates.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, JavaScript, HTML, CSS |
| Backend | Java 21, Spring Boot |
| Database | MySQL 8 |
| ORM | Spring Data JPA, Hibernate |
| Security | Spring Security, JWT, BCrypt |
| AI Integration | Google Gemini API |
| API Testing | Postman |
| IDE | Spring Tool Suite, VS Code |
| Build Tool | Maven |
| Version Control | Git, GitHub |

## Project Structure

```text
resolveai-1/
│
├── src/
│   ├── main/
│   │   ├── java/com/resolveai/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   └── service/
│   │   │
│   │   └── resources/
│   │
│   └── test/java/
│
├── frontend/
│
├── screenshots/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md
```

## Application Architecture

The application follows a layered backend architecture:

1. React Frontend – Provides the user interface.
2. Controller Layer – Handles incoming REST API requests.
3. Service Layer – Implements business logic.
4. Repository Layer – Performs database operations.
5. Entity Layer – Represents database tables.
6. MySQL Database – Stores users, tickets, categories, priorities, and conversations.

Google Gemini API is integrated into the backend for AI-powered ticket classification.

## Getting Started

### Prerequisites

- Java 21
- MySQL 8
- Node.js and npm
- Spring Tool Suite or another Java IDE
- Postman (optional, for API testing)

### Backend Setup

1. Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

2. Open the project in Spring Tool Suite.

3. Create a MySQL database.

4. Configure the database connection and application secrets in `application.properties` using environment variables.

5. Configure the Gemini API key and JWT secret.

6. Run the Spring Boot application.

Backend URL:

******************

### Frontend Setup

1. Open a terminal inside the frontend folder.

2. Install dependencies:

```bash
npm install
```

3. Start the React development server:

```bash
npm run dev
```

Frontend URL:

**********

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/tickets` | Retrieve tickets |
| POST | `/api/tickets` | Create a ticket |
| POST | `/api/ai/classify` | Classify a ticket using AI |

Protected endpoints require JWT authentication.

## Future Improvements

- Display AI-generated categories throughout the dashboards.
- Add advanced ticket analytics.
- Improve automated testing.
- Deploy the application to cloud infrastructure.
- Add further AI-powered customer support capabilities.

## Author

**Sujata Jitendra Patil**

Computer Engineering Graduate | Java Developer

