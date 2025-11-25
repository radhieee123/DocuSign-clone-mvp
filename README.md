# DocuSign MVP - Document Workflow Simulator

A functional multi-user document signing workflow simulator built with Next.js, TypeScript, Prisma, and React-PDF.

## Features

- ✅ Multi-persona authentication (2 dummy users)
- ✅ Document request creation and tracking
- ✅ Status management (PENDING, SIGNED, COMPLETED)
- ✅ PDF viewer with react-pdf
- ✅ Mock signature collection (Type & Draw)
- ✅ Event logging system
- ✅ Clean, DocuSign-inspired UI

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma with SQLite
- **PDF Viewing**: react-pdf
- **Authentication**: Mock JWT-based auth

## Project Structure

```
docusign-mvp/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data for dummy users
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/login/    # Login endpoint
│   │   │   └── documents/     # Document CRUD endpoints
│   │   ├── dashboard/         # Main dashboard
│   │   ├── documents/
│   │   │   ├── create/        # Create document request
│   │   │   └── [id]/review/   # Review & sign document
│   │   ├── login/             # Login page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── PDFViewer.tsx      # PDF viewer component
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/
│   │   ├── apiClient.ts       # API client utility
│   │   ├── auth.ts            # JWT utilities
│   │   ├── db.ts              # Prisma client
│   │   └── eventLogger.ts     # Event logging utility
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── public/
│   └── sample-contract.pdf    # (Optional) Sample PDF for testing
├── .env                       # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or create the project**

```bash
mkdir docusign-mvp
cd docusign-mvp
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up the database**

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed dummy users
npm run prisma:seed
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Dummy User Credentials

The application comes pre-seeded with two test users:

### Sender Alex
- **Email**: alex@acme.com
- **Password**: password123
- **Role**: Primary document requester

### Signer Blake
- **Email**: blake@acme.com
- **Password**: password123
- **Role**: Primary recipient of signing requests

## Usage Flow

1. **Login** as either Alex or Blake
2. **Dashboard**: View documents to sign (Inbox) and sent documents (Sent)
3. **Create Request**: Click "New Request" to send a document to the other user
4. **Sign Document**: Click "Review & Sign" on pending documents
5. **Complete Signature**: Choose "Type" or "Draw" signature and click "Finish"

## API Endpoints

### Authentication

- `POST /api/auth/login` - Authenticate user

### Documents

- `GET /api/documents` - Retrieve all documents for logged-in user
- `POST /api/documents` - Create new document request
- `POST /api/documents/:id/sign` - Sign a document

## Database Schema

### User Model
```prisma
model User {
  id            String      @id @default(cuid())
  name          String
  email         String      @unique
  mockPassword  String
  // ... relations
}
```

### Document Model
```prisma
model Document {
  id           String    @id @default(cuid())
  title        String
  status       String    @default("PENDING")
  requestedAt  DateTime  @default(now())
  signedAt     DateTime?
  senderId     String
  recipientId  String
  // ... relations
}
```

### EventLog Model
```prisma
model EventLog {
  id          String   @id @default(cuid())
  actionType  String
  userId      String?
  documentId  String?
  payload     String
  timestamp   DateTime @default(now())
  // ... relations
}
```

## Event Logging

The system logs the following events:
- **LOGIN**: User authentication
- **DOCUMENT_REQUESTED**: New document creation
- **SIGN_ACTION**: Document signing
- **DASHBOARD_VIEW**: Dashboard access
- **CUSTOM**: Custom application events

## PDF Viewer

The application uses `react-pdf` to display documents. For full functionality:

1. Place a sample PDF at `/public/sample-contract.pdf`
2. The PDF viewer will automatically load and display it
3. If no PDF is found, a placeholder document is shown

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Prisma commands
npm run prisma:generate    # Generate Prisma client
npm run prisma:push        # Push schema to database
npm run prisma:seed        # Seed database with dummy data
npm run prisma:studio      # Open Prisma Studio GUI
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

## Limitations & MVP Scope

This is an MVP implementation with the following limitations:

- **No actual file uploads**: Documents are mocked
- **No real signing**: Signature data is not persisted
- **No email notifications**: Notifications are not implemented
- **2 fixed users**: Only Alex and Blake can interact
- **Mock authentication**: No password hashing or refresh tokens
- **No document versioning**: Single version per document

## Future Enhancements

Potential improvements for a production version:

- [ ] Real file upload and storage
- [ ] Multiple user support with registration
- [ ] Email notifications
- [ ] Document templates
- [ ] Advanced signature fields and placement
- [ ] Audit trail and compliance features
- [ ] Team/organization support
- [ ] Real authentication with OAuth
- [ ] Document expiration and reminders

## Troubleshooting

### Database Issues

```bash
# Reset database
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed
```

### React-PDF Issues

If PDF rendering fails:
1. Check that PDF.js worker is correctly loaded
2. Ensure `sample-contract.pdf` exists in `/public` directory
3. Check browser console for errors

### Port Already in Use

```bash
# Use a different port
PORT=3001 npm run dev
```

## License

This is a demonstration project for educational purposes.

## Support

For issues or questions, please check:
- Next.js documentation: https://nextjs.org/docs
- Prisma documentation: https://www.prisma.io/docs
- React-PDF documentation: https://github.com/wojtekmaj/react-pdf

---

Built with ❤️ for learning and demonstration purposes.
