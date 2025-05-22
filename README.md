# MasterTicket - Modern Support Ticket Management System

MasterTicket is a comprehensive ticket management system built with Next.js 15, Prisma, and PostgreSQL. It enables organizations to efficiently track, manage, and resolve support tickets with a beautiful UI and powerful features.

![MasterTicket Dashboard](https://via.placeholder.com/800x400?text=MasterTicket+Dashboard)

## 🚀 Features

- **Multi-tenant architecture** with organization support
- **Authentication system** with email/password and GitHub OAuth
- **Ticket management** with filtering, searching, and sorting
- **Priority levels** (Low, Medium, High, Critical)
- **Status tracking** (Open, In Progress, On Hold, Closed)
- **Response time tracking** and analytics
- **Comment system** for ticket discussions
- **Dashboard** with ticket statistics and visualizations

## 📋 Table of Contents

- [Architecture](#architecture)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Application Flow](#application-flow)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## 🏗️ Architecture

MasterTicket follows a modern Next.js application architecture with the App Router pattern.

```mermaid
graph TD
    Client[Client Browser] -->|HTTP Requests| NextJS[Next.js App]
    NextJS -->|API Routes| API[API Layer]
    API -->|Queries/Mutations| Prisma[Prisma ORM]
    Prisma -->|SQL| Database[(PostgreSQL Database)]

    subgraph "Frontend Layer"
        NextJS --> Pages[Pages]
        NextJS --> Components[Components]
        NextJS --> Hooks[Custom Hooks]
    end

    subgraph "Backend Layer"
        API --> Auth[Authentication]
        API --> TicketAPI[Ticket API]
        API --> OrganizationAPI[Organization API]
    end
```

## 🔄 Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email
        boolean emailVerified
        string image
        datetime createdAt
        datetime updatedAt
    }

    Organization {
        string id PK
        string name
        string slug
        string logo
        json metadata
        datetime createdAt
    }

    Ticket {
        string id PK
        string title
        string description
        enum status
        enum priority
        datetime createdAt
        datetime updatedAt
        float responseTime
        string organizationId FK
    }

    TicketComment {
        string id PK
        string content
        datetime createdAt
        datetime updatedAt
        string ticketId FK
        string authorId FK
    }

    Member {
        string id PK
        string userId FK
        string organizationId FK
        string role
        datetime createdAt
    }

    Invitation {
        string id PK
        string email
        string inviterId FK
        string organizationId FK
        string role
        string status
        datetime expiresAt
        datetime createdAt
    }

    Session {
        string id PK
        string userId FK
        string token
        datetime expiresAt
        string ipAddress
        string userAgent
        string activeOrganizationId FK
        datetime createdAt
        datetime updatedAt
    }

    Account {
        string id PK
        string userId FK
        string accountId
        string providerId
        string accessToken
        string refreshToken
        datetime accessTokenExpiresAt
        datetime refreshTokenExpiresAt
        string scope
        string idToken
        string password
        datetime createdAt
        datetime updatedAt
    }

    User ||--o{ Session : has
    User ||--o{ Account : has
    User ||--o{ Member : has
    User ||--o{ Invitation : invites
    User ||--o{ TicketComment : authors

    Organization ||--o{ Member : has
    Organization ||--o{ Invitation : has
    Organization ||--o{ Ticket : has
    Organization ||--o{ Session : activeIn

    Ticket ||--o{ TicketComment : has
```

## 🔄 Application Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Database

    User->>Frontend: Login
    Frontend->>API: Authentication Request
    API->>Database: Validate Credentials
    Database-->>API: Authentication Result
    API-->>Frontend: Auth Token + User Data
    Frontend-->>User: Dashboard View

    User->>Frontend: Create Ticket
    Frontend->>API: POST /api/v1/ticket
    API->>Database: Insert Ticket
    Database-->>API: Ticket Created
    API-->>Frontend: Ticket Data
    Frontend-->>User: Updated Ticket List

    User->>Frontend: View Ticket
    Frontend->>API: GET /api/v1/ticket/:id
    API->>Database: Query Ticket
    Database-->>API: Ticket Data
    API-->>Frontend: Ticket Details
    Frontend-->>User: Ticket Detail View

    User->>Frontend: Add Comment
    Frontend->>API: POST /api/v1/ticket/:id/comment
    API->>Database: Insert Comment
    Database-->>API: Comment Created
    API-->>Frontend: Updated Comments
    Frontend-->>User: Updated Ticket Thread
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: better-auth with email/password and GitHub OAuth
- **State Management**: React Hooks
- **Charts & Visualization**: Recharts
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **API Client**: Axios

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/masterticket.git
   cd masterticket
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   bun install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your database connection string and other required variables.

4. Set up the database:

   ```bash
   npx prisma migrate dev
   # or
   bunx prisma migrate dev
   ```

5. Run the development server:

   ```bash
   npm run dev
   # or
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/masterticket"

# Authentication
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 API Documentation

### Tickets API

#### Get all tickets

```
GET /api/v1/ticket?organizationId={organizationId}
```

#### Get ticket by ID

```
GET /api/v1/ticket/{id}
```

#### Create ticket

```
POST /api/v1/ticket
```

Body:

```json
{
  "title": "Ticket title",
  "description": "Ticket description",
  "priority": "HIGH",
  "status": "OPEN",
  "organizationId": "org_id"
}
```

#### Update ticket

```
PUT /api/v1/ticket/{id}
```

Body:

```json
{
  "id": "ticket_id",
  "title": "Updated title",
  "description": "Updated description",
  "priority": "MEDIUM",
  "status": "IN_PROGRESS"
}
```

#### Delete ticket

```
DELETE /api/v1/ticket/{id}
```

Body:

```json
{
  "id": "ticket_id"
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
