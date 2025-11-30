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

export type DocumentStatus = "PENDING" | "SIGNED" | "COMPLETED";

export interface DocumentUser {
  id: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  title: string;
  status: string;
  requestedAt: Date;
  signedAt: Date | null;
  senderId: string;
  recipientId: string;
  fileData?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  sender?: DocumentUser;
  recipient?: DocumentUser;
}

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
  signatureData?: string;
}

export interface SignDocumentResponse {
  document: Document;
  message: string;
}

export type EventActionType =
  | "LOGIN"
  | "DOCUMENT_REQUESTED"
  | "SIGN_ACTION"
  | "DASHBOARD_VIEW"
  | "CUSTOM";

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

export interface ApiErrorResponse {
  error: string;
  message: string;
}

export interface DocumentCardProps {
  document: Document;
  onSign?: (documentId: string) => void;
  onView?: (documentId: string) => void;
}

export interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signature: string, initials: string) => void;
  initialName?: string;
  initialInitials?: string;
}
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
