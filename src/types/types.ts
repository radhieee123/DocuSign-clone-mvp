// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  mockPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  requestedAt: Date;
  signedAt: Date | null;
  senderId: string;
  recipientId: string;
  fileData?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  sender?: User;
  recipient?: User;
}

export type DocumentStatus = 'PENDING' | 'SIGNED' | 'COMPLETED';

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserPayload;
}

export interface CreateDocumentRequest {
  title: string;
  recipientId: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
}

export interface CreateDocumentResponse {
  document: Document;
  message: string;
}

export interface SignDocumentRequest {
  signatureData?: string; // Mock signature data
}

export interface SignDocumentResponse {
  document: Document;
  message: string;
}

// Event Logging Types
export type EventActionType = 
  | 'LOGIN'
  | 'DOCUMENT_REQUESTED'
  | 'SIGN_ACTION'
  | 'DASHBOARD_VIEW'
  | 'CUSTOM';

export interface EventLogPayload {
  user_id?: string;
  user_email?: string;
  document_id?: string;
  recipient_id?: string;
  document_title?: string;
  signer_id?: string;
  status_updated_to?: string;
  page_url?: string;
  text?: string;
  custom_action?: string;
  data?: Record<string, any>;
}

export interface EventLog {
  id: string;
  actionType: EventActionType;
  userId: string | null;
  documentId: string | null;
  payload: string;
  timestamp: Date;
}

// API Error Response
export interface ApiErrorResponse {
  error: string;
  message: string;
}
