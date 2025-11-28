import { prisma } from "./db";
import { EventActionType, EventLogPayload } from "@/types";

export async function logEvent(
  actionType: EventActionType,
  payload: EventLogPayload,
  userId?: string,
  documentId?: string
): Promise<void> {
  try {
    await prisma.eventLog.create({
      data: {
        actionType,
        userId: userId || null,
        documentId: documentId || null,
        payload: JSON.stringify(payload),
      },
    });
  } catch (error) {
    console.error("Failed to log event:", error);
  }
}

export const EventLogger = {
  login: async (userId: string, userEmail: string) => {
    await logEvent("LOGIN", { user_id: userId, user_email: userEmail }, userId);
  },

  documentRequested: async (
    userId: string,
    documentId: string,
    recipientId: string,
    documentTitle: string
  ) => {
    await logEvent(
      "DOCUMENT_REQUESTED",
      {
        document_id: documentId,
        recipient_id: recipientId,
        document_title: documentTitle,
      },
      userId,
      documentId
    );
  },

  signAction: async (
    userId: string,
    documentId: string,
    statusUpdatedTo: string
  ) => {
    await logEvent(
      "SIGN_ACTION",
      {
        document_id: documentId,
        signer_id: userId,
        status_updated_to: statusUpdatedTo,
      },
      userId,
      documentId
    );
  },

  dashboardView: async (userId: string, pageUrl: string) => {
    await logEvent(
      "DASHBOARD_VIEW",
      {
        page_url: pageUrl,
        user_id: userId,
      },
      userId
    );
  },

  custom: async (
    customAction: string,
    text: string,
    data?: Record<string, any>,
    userId?: string
  ) => {
    await logEvent(
      "CUSTOM",
      {
        custom_action: customAction,
        text,
        data,
      },
      userId
    );
  },
};
