# compl.io

<div align="center">

**Stay ahead of policy shifts in your community.**

A comprehensive compliance management platform designed to help small businesses navigate local, state, and federal regulations with confidence.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Google Calendar Integration](#google-calendar-integration)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
  - [Document Management](#document-management)
  - [AI Assistant](#ai-assistant)
  - [Calendar Sync](#calendar-sync)
  - [Compliance Alerts](#compliance-alerts)
- [API Routes](#api-routes)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**compl.io** is a modern compliance management platform that helps small businesses stay on top of regulatory changes and deadlines. Built with Next.js 15 and Supabase, it provides:

- **Intelligent Document Management** - Upload, organize, and analyze compliance documents with AI-powered categorization
- **AI-Powered Assistant** - Get instant answers to regulatory questions tailored to your business
- **Calendar Integration** - Sync compliance deadlines directly to Google Calendar
- **Compliance Alerts** - Stay informed about policy changes that impact your business
- **Community Features** - Share insights and collaborate with other business owners

---

## ✨ Features

### 🔐 Authentication & User Management
- Secure password-based authentication via Supabase Auth
- User profile management with photo uploads
- Onboarding flow for new users
- Password reset and account recovery

### 📄 Document Management
- **Upload & Store** - Support for PDF, DOCX, XLSX, PNG, and JPG files
- **AI-Powered Analysis** - Automatic categorization and tagging using OpenAI
- **Smart Organization** - Categories, tags, and custom descriptions
- **Expiration Tracking** - Visual alerts for expiring licenses and permits
- **Document Sharing** - Share documents with team members and advisors
- **Preview & Download** - In-app preview for PDFs and images
- **Search & Filter** - Full-text search and advanced filtering options

### 🤖 AI Assistant
- Conversational interface for regulatory questions
- Business-tailored responses based on context
- Step-by-step checklists for compliance tasks
- Integration with document analysis

### 📅 Calendar Sync
- Google Calendar integration for deadline tracking
- Automatic event creation for compliance deadlines
- Customizable reminders
- Bidirectional sync capabilities

### 📊 Compliance Tracking
- Real-time compliance alerts
- Deadline prioritization
- Policy change notifications
- Local, state, and federal regulation tracking

### 👥 Community Features
- Community discussion boards
- Knowledge sharing
- Collaborative document management

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Next.js API Routes

### Integrations
- **AI**: [OpenAI API](https://openai.com/) (GPT-4o-mini)
- **Calendar**: [Google Calendar API](https://developers.google.com/calendar)
- **Document Parsing**: 
  - [mammoth](https://github.com/mwilliamson/mammoth.js) (DOCX)
  - [pdf-parse](https://github.com/mozilla/pdf.js) (PDF)
  - [xlsx](https://github.com/SheetJS/sheetjs) (Excel)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Build Tool**: Turbopack (Next.js)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Supabase](https://supabase.com/) account and project
- (Optional) [Google Cloud Platform](https://console.cloud.google.com/) account for Calendar integration
- (Optional) [OpenAI](https://openai.com/) API key for AI features

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/social-impact.git
   cd social-impact
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # OpenAI (Optional - for AI features)
   OPENAI_API_KEY=your_openai_api_key

   # Google Calendar (Optional - for calendar sync)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Supabase Service Role (for server-side operations)
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | ❌ Optional |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ❌ Optional |
| `NEXT_PUBLIC_APP_URL` | Your application URL | ✅ Yes |

### Database Setup

1. **Create a Supabase project**

   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project or use an existing one
   - Copy your project URL and API keys

2. **Run database migrations**

   The easiest way is to use the all-in-one setup script:

   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Open `supabase/ALL_IN_ONE_SETUP.sql`
   - Copy and paste the entire contents into the SQL Editor
   - Click **Run**

   This will create:
   - All required database tables
   - Storage buckets for documents and avatars
   - Row Level Security (RLS) policies
   - Storage policies
   - Indexes for performance

   **Alternative: Run migrations individually**

   If you prefer to run migrations step by step:

   ```sql
   -- Run in order:
   1. supabase/migrations/001_create_documents_table.sql
   2. supabase/migrations/002_add_document_features.sql
   3. supabase/migrations/003_add_summary_column.sql
   4. supabase/migrations/004_create_avatars_bucket.sql
   5. supabase/migrations/005_create_calendar_sync.sql
   6. supabase/migrations/006_add_calendar_event_id.sql
   7. supabase/migrations/007_add_onboarding.sql
   ```

3. **Verify setup**

   - Check that all tables exist in **Table Editor**
   - Verify storage buckets in **Storage**
   - Ensure RLS policies are enabled

### Google Calendar Integration

For calendar sync functionality, follow these steps:

1. **Enable Google Calendar API**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or select a project
   - Enable **Google Calendar API**

2. **Create OAuth 2.0 credentials**

   - Navigate to **APIs & Services** > **Credentials**
   - Create OAuth client ID (Web application)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/calendar/callback` (development)
     - `https://yourdomain.com/api/calendar/callback` (production)
   - Add test users (if using external user type)

3. **Configure environment variables**

   Add your Google OAuth credentials to `.env.local`:

  ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   See [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) for detailed instructions.

---

## 📁 Project Structure

```
social-impact/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── assistant/            # AI assistant endpoints
│   │   ├── calendar/             # Calendar sync endpoints
│   │   ├── documents/            # Document management endpoints
│   │   ├── profile/              # User profile endpoints
│   │   └── reminders/            # Reminder management
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── update-password/
│   ├── Assistant/                # AI Assistant page
│   ├── Community/                # Community page
│   ├── Documents/                # Document management page
│   ├── Profile/                  # User profile page
│   ├── onboarding/               # Onboarding flow
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── assistant/                # AI Assistant components
│   ├── ui/                       # shadcn/ui components
│   ├── auth-button.tsx
│   ├── calendar-sync.tsx
│   ├── document-upload.tsx
│   ├── document-preview.tsx
│   └── ...
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client configuration
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── calendar-sync-utils.ts    # Calendar sync utilities
│   └── utils.ts                  # General utilities
├── supabase/                     # Database migrations
│   ├── migrations/               # SQL migration files
│   ├── storage-policies.sql      # Storage bucket policies
│   └── ALL_IN_ONE_SETUP.sql     # Complete setup script
├── middleware.ts                 # Next.js middleware
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

---

## 🎨 Key Features

### Document Management

The document management system provides comprehensive file handling with AI-powered organization:

- **Supported Formats**: PDF, DOCX, XLSX, PNG, JPG
- **AI Analysis**: Automatic categorization and tagging
- **Organization**: Categories, tags, expiration dates, descriptions
- **Sharing**: Share documents with team members
- **Preview**: In-app preview for PDFs and images
- **Security**: Row Level Security ensures users only access their own documents

**Usage:**

1. Navigate to `/Documents`
2. Click "Upload Document"
3. Select a file
4. (Optional) Click the sparkles icon to analyze with AI
5. Edit metadata, set expiration dates, or share with others

### AI Assistant

The AI Assistant provides intelligent responses to regulatory questions:

- **Contextual Responses**: Tailored to your business and location
- **Step-by-Step Guidance**: Break down complex regulations
- **Document Integration**: References uploaded documents when relevant

**Usage:**

1. Navigate to `/Assistant`
2. Ask questions about regulations, compliance, or business operations
3. Receive tailored responses with actionable next steps

### Calendar Sync

Sync compliance deadlines directly to Google Calendar:

- **Automatic Sync**: Convert document expiration dates to calendar events
- **Customizable Reminders**: Email and popup notifications
- **Secure OAuth**: Tokens stored securely in database

**Usage:**

1. Connect your Google Calendar from the homepage
2. Authorize the application
3. Click "Sync deadlines" to create calendar events
4. Manage synced events from your calendar

### Compliance Alerts

Stay informed about policy changes:

- **Real-time Updates**: Latest compliance alerts
- **Localized Information**: Tailored to your location and industry
- **Priority Sorting**: Most important alerts first

---

## 🔌 API Routes

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/update-password` - Update password

### Documents
- `GET /api/documents` - List user documents
- `POST /api/documents/upload` - Upload a document
- `POST /api/documents/analyze` - AI document analysis
- `POST /api/documents/share` - Share document with users
- `PUT /api/documents/update` - Update document metadata
- `DELETE /api/documents` - Delete a document

### Calendar
- `GET /api/calendar/auth?action=connect` - Initiate OAuth flow
- `GET /api/calendar/auth?action=disconnect` - Disconnect calendar
- `GET /api/calendar/callback` - OAuth callback handler
- `GET /api/calendar/status` - Get connection status
- `POST /api/calendar/sync` - Sync deadlines to calendar

### Assistant
- `POST /api/assistant` - Chat with AI assistant

### Profile
- `GET /api/profile/stats` - Get user statistics
- `POST /api/profile/update` - Update user profile
- `POST /api/profile/upload-photo` - Upload profile photo
- `DELETE /api/profile/remove-photo` - Remove profile photo

---

## 💻 Development

### Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Test locally**

   ```bash
   npm run dev
   ```

4. **Run linter**

   ```bash
   npm run lint
   ```

5. **Commit and push**

   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Follow the existing file structure
- Use Tailwind CSS for styling
- Follow the shadcn/ui component patterns

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel**

   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**

   Add all environment variables from your `.env.local` file in the Vercel dashboard.

4. **Deploy**

   Vercel will automatically deploy your application.

### Deploy to Other Platforms

This application can be deployed to any platform that supports Next.js:

- **Netlify**: Use the Next.js build preset
- **Railway**: Connect your GitHub repository
- **AWS Amplify**: Configure for Next.js SSR
- **Self-hosted**: Use Docker or a Node.js server

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

4. **Commit your changes**

   ```bash
   git commit -m 'Add some amazing feature'
   ```

5. **Push to the branch**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

Please ensure:
- Code follows the existing style
- All tests pass
- Documentation is updated
- Commit messages are clear

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📚 Additional Documentation

- [Quick Setup Guide](./QUICK_SETUP_GUIDE.md) - Get started in 5 minutes
- [Enhanced Features](./ENHANCED_FEATURES.md) - Detailed feature documentation
- [Supabase Setup](./SUPABASE_SETUP.md) - Database configuration guide
- [Google Calendar Setup](./GOOGLE_CALENDAR_SETUP.md) - Calendar integration guide
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md) - OAuth configuration

---

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](#-additional-documentation) files
2. Search existing [GitHub Issues](https://github.com/yourusername/social-impact/issues)
3. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [OpenAI](https://openai.com/) - AI capabilities

---

<div align="center">

**Built with ❤️ for small businesses**

[Report Bug](https://github.com/yourusername/social-impact/issues) · [Request Feature](https://github.com/yourusername/social-impact/issues) · [Documentation](./docs)

</div>
