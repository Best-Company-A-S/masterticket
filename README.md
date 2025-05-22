# MasterTicket - Modern Support Ticket Management System

MasterTicket is a comprehensive ticket management system built with Next.js 15, Prisma, and PostgreSQL. It enables organizations to efficiently track, manage, and resolve support tickets with a beautiful UI and powerful features.

![MasterTicket Dashboard](https://github.com/Best-Company-A-S/masterticket/blob/main/screenshot.png)

## 🚀 Features

- **Multi-tenant architecture** with organization support
- **Authentication system** with email/password and GitHub OAuth
- **Ticket management** with filtering, searching, and sorting
- **Priority levels** (Low, Medium, High, Critical)
- **Status tracking** (Open, In Progress, On Hold, Closed)
- **Response time tracking** and analytics
- **Comment system** for ticket discussions with nested replies
- **Dashboard** with ticket statistics and visualizations
- **AI-powered ticket assistant** for improved support efficiency
- **Team-based assignments** and internal ticketing
- **Admin panel** with user management, roles, and session monitoring
- **User impersonation** for troubleshooting and support
- **Organization invitations** with code-based and email-based systems
- **Real-time markdown rendering** for rich text support
- **Modern UI/UX** with dark/light theme support
- **Mobile-responsive design** optimized for all devices

## 📋 Table of Contents

- [Architecture](#architecture)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Application Flow](#application-flow)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [AI Assistant](#ai-assistant)
- [Admin Features](#admin-features)
- [Team Management](#team-management)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

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
        API --> AIAssistant[AI Assistant]
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

    Team {
        string id PK
        string name
        string organizationId FK
        datetime createdAt
        datetime updatedAt
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
        string parentId FK
    }

    Member {
        string id PK
        string userId FK
        string organizationId FK
        string teamId FK
        string role
        datetime createdAt
    }

    Invitation {
        string id PK
        string email
        string code
        string inviterId FK
        string organizationId FK
        string teamId FK
        string role
        string status
        json metadata
        datetime expiresAt
        datetime createdAt
    }

    Verification {
        string id PK
        string identifier
        string value
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
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
    Organization ||--o{ Team : has
    Organization ||--o{ Session : activeIn

    Team ||--o{ Member : has
    Team ||--o{ Invitation : has

    Ticket ||--o{ TicketComment : has
    TicketComment ||--o{ TicketComment : replies
```

## 🔄 Application Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Database
    participant AIAssistant

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

    User->>Frontend: Use AI Assistant
    Frontend->>AIAssistant: Query with ticket context
    AIAssistant-->>Frontend: AI-generated suggestions
    Frontend-->>User: Assistant recommendations
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
- **AI Features**: Google Gemini API integration for ticket assistance
- **Animations**: Framer Motion
- **Markdown**: React Markdown with syntax highlighting
- **Analytics**: Vercel Analytics
- **Icons**: Lucide React, React Icons
- **Themes**: next-themes for dark/light mode
- **Deployment**: Vercel (optimized for Edge Runtime)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Best-Company-A-S/masterticket.git
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

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

### Development with Turbopack

MasterTicket uses Next.js 15 with Turbopack for faster development builds. The development server will automatically reload when you make changes to your code.

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/masterticket"
DEVDATABASE_URL="postgresql://username:password@localhost:5432/masterticket_dev"
DIRECT_URL="postgresql://username:password@localhost:5432/masterticket"

# Authentication
BETTER_AUTH_SECRET="your-better-auth-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Features
GEMINI_API_KEY="your-google-gemini-api-key"

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-vercel-analytics-id"
```

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string for production
- `DEVDATABASE_URL`: PostgreSQL connection string for development
- `DIRECT_URL`: Direct PostgreSQL connection (for Prisma migrations)
- `BETTER_AUTH_SECRET`: Secret key for authentication (generate a random string)
- `BETTER_AUTH_URL`: Your application URL

### Optional Variables

- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: For GitHub OAuth integration
- `GEMINI_API_KEY`: For AI assistant features (get from Google AI Studio)
- `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`: For Vercel Analytics integration

## 🗄️ Database Setup

MasterTicket uses PostgreSQL with Prisma ORM. The database schema includes support for multi-tenancy, authentication, and comprehensive ticket management.

### Local Development

1. **Install PostgreSQL** on your system
2. **Create a database**:

   ```sql
   CREATE DATABASE masterticket;
   CREATE DATABASE masterticket_dev;
   ```

3. **Configure your `.env.local`** with the database URLs
4. **Run Prisma migrations**:

   ```bash
   npx prisma migrate dev
   # or
   bunx prisma migrate dev
   ```

5. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   # or
   bunx prisma generate
   ```

### Database Schema Overview

The application uses the following main entities:

- **User**: Authentication and user management
- **Organization**: Multi-tenant organization support
- **Team**: Team-based organization within organizations
- **Member**: User-organization-team relationships
- **Ticket**: Core ticket entity with status and priority
- **TicketComment**: Threaded comments with nested replies
- **Invitation**: Organization and team invitation system
- **Session**: User session management with impersonation support

### Seeding (Optional)

To populate your database with sample data for development:

```bash
npx prisma db seed
# or
bunx prisma db seed
```

### Project Structure

```
masterticket/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── roadmap/           # Public roadmap
├── components/            # Reusable React components
│   ├── ai/               # AI assistant components
│   ├── auth/             # Authentication components
│   ├── organization/     # Organization management
│   ├── tickets/          # Ticket management
│   └── ui/               # Base UI components (shadcn/ui)
├── lib/                  # Utility functions and configurations
│   ├── generated/        # Generated Prisma client
│   └── hooks/            # Custom React hooks
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── hooks/                # Global React hooks
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

#### Add comment to ticket

```
POST /api/v1/ticket/{id}/comment
```

Body:

```json
{
  "content": "Comment content with markdown support",
  "isInternal": false
}
```

### AI Assistant API

```
POST /api/ai/chat
```

Body:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Create a new high priority ticket for server issues"
    }
  ],
  "organizationId": "org_id"
}
```

### Organization API

#### Create Team

```
POST /api/organization/create-team
```

#### Join with Code

```
POST /api/organization/join-with-code
```

#### Generate Invitation Code

```
POST /api/organization/generate-code
```

#### Update Member Role

```
POST /api/organization/update-member-role
```

## 🤖 AI Assistant

MasterTicket includes a powerful AI assistant powered by Google Gemini that helps users manage tickets more efficiently.

### Features

- **Ticket Creation**: Ask the AI to create tickets with natural language
- **Ticket Search**: Find tickets by priority, keywords, or specific criteria
- **Smart Suggestions**: Get recommendations for ticket management
- **Context-Aware**: Understands your organization's ticket data

### Usage Examples

#### Creating Tickets

```
"Create a new high priority ticket for a login issue affecting mobile users"
```

#### Searching Tickets

```
"Show me all critical tickets"
"Find tickets about payment processing"
```

#### Getting Help

```
"What are the different priority levels?"
"How do I assign a ticket to a team member?"
```

### Quick Commands

The AI assistant supports quick commands using the `/` key:

- `/` - Open command palette
- **Create new ticket** - Start ticket creation flow
- **Search tickets** - Search by keywords
- **Find by priority** - Filter tickets by priority level

### Integration

The AI assistant is available in:

- **Dedicated AI Assistant page** (`/dashboard/ai-assistant`)
- **Direct URL queries** (`/dashboard/ai-assistant?q=your-query`)
- **Contextual help** throughout the application

### AI-Powered Features

- **Function Calling**: The AI can directly create tickets, search by priority, and perform database operations
- **Context Awareness**: Understands your organization's structure and ticket history
- **Markdown Support**: Responses include properly formatted ticket links and rich text
- **Command Palette**: Quick keyboard shortcuts for efficient interaction

## 👥 Admin Features

MasterTicket includes comprehensive admin functionality powered by the better-auth admin plugin.

### User Management

- **Create Users**: Admins can create new user accounts
- **List Users**: View all users with search and filtering
- **User Roles**: Assign and manage user roles
- **Ban/Unban Users**: Temporarily or permanently restrict access

### Session Management

- **Active Sessions**: View all active user sessions
- **Session Details**: IP address, user agent, and activity tracking
- **Revoke Sessions**: Force logout specific users or sessions
- **Impersonation**: Login as other users for troubleshooting

### Organization Control

- **Multi-tenant Support**: Manage multiple organizations
- **Role-based Access**: Different permission levels
- **Invitation Management**: Control organization access

### Admin Panel Routes

- `/admin` - Main admin dashboard
- `/admin/users` - User management
- `/admin/sessions` - Session monitoring
- `/admin/roles` - Role management
- `/admin/banned` - Banned users management
- `/admin/impersonate` - User impersonation
- `/admin/create-user` - Create new users

## 👥 Team Management

MasterTicket supports team-based organization for better ticket assignment and collaboration.

### Team Features

- **Create Teams**: Organize users into teams within organizations
- **Team Assignments**: Assign tickets to specific teams
- **Role-based Permissions**: Different roles within teams
- **Team Invitations**: Invite users to specific teams

### Team Roles

- **Admin**: Full team management permissions
- **Member**: Standard team access
- **Viewer**: Read-only access

### Team Operations

- Create and manage teams within organizations
- Invite members via email or invitation codes
- Assign tickets to teams for better workflow
- Track team performance and ticket resolution

## 🗺️ Roadmap

MasterTicket has a public roadmap showing upcoming features and development plans. Visit the [roadmap page](/roadmap) to see:

### Current Developments (Q3 2024)

- **AI Integration**: Enhanced AI capabilities for ticket processing
- **Advanced Analytics**: Comprehensive reporting and insights
- **Performance Improvements**: Optimizations for larger organizations

### Upcoming Features (Q4 2024 - Q3 2025)

- **Enterprise Features**: Advanced role-based access control and SLA management
- **Integration Ecosystem**: Slack, Teams, and third-party integrations
- **Mobile Applications**: Dedicated iOS and Android apps
- **Advanced Workflow Automation**: Custom workflows and triggers

Visit [/roadmap](/roadmap) to see the complete development timeline and vote on upcoming features.

## 🚀 Deployment

MasterTicket is optimized for deployment on Vercel but can be deployed on any platform that supports Next.js.

### Vercel Deployment (Recommended)

1. **Fork the repository** or clone it to your GitHub account

2. **Connect to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure environment variables

3. **Environment Variables**:
   Set all required environment variables in the Vercel dashboard

4. **Database**:

   - Use a hosted PostgreSQL service (Supabase, PlanetScale, etc.)
   - Run migrations: `npx prisma migrate deploy`

5. **Deploy**:
   Vercel will automatically build and deploy your application

### Manual Deployment

1. **Build the application**:

   ```bash
   npm run build
   # or
   bun run build
   ```

2. **Start the production server**:
   ```bash
   npm run start
   # or
   bun run start
   ```

### Docker Deployment

A `Dockerfile` can be created for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Configuration

For production deployment, ensure you have:

- PostgreSQL database (hosted)
- All environment variables configured
- Proper CORS settings for your domain
- SSL/TLS certificates for HTTPS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write clear commit messages
- Add tests for new features when applicable
- Update documentation as needed
- Use TypeScript for all new code

### Issues and Bug Reports

If you encounter any issues or have suggestions:

1. Check existing [GitHub Issues](https://github.com/Best-Company-A-S/masterticket/issues)
2. Create a new issue with detailed information
3. Include steps to reproduce for bugs
4. Use appropriate issue labels

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Reset database connection
npx prisma db push
npx prisma generate
```

#### Authentication Problems

- Verify `BETTER_AUTH_SECRET` is set and unique
- Check `BETTER_AUTH_URL` matches your domain
- Clear browser cookies and try again

#### AI Assistant Not Working

- Ensure `GEMINI_API_KEY` is valid
- Check API quotas in Google AI Studio
- Verify network connectivity

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: [GitHub Issues](https://github.com/Best-Company-A-S/masterticket/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Best-Company-A-S/masterticket/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**MasterTicket** - Built with ❤️ using Next.js 15, React 19, and modern web technologies.
