import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/db";
import { verifyToken, extractTokenFromHeader } from "@/services/auth";
import { EventLogger } from "@/services/eventLogger";
import {
  SignDocumentRequest,
  SignDocumentResponse,
  ApiErrorResponse,
} from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;

    const token = extractTokenFromHeader(
      request.headers.get("Authorization") || ""
    );

    if (!token) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "UNAUTHORIZED", message: "No authorization token provided" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "UNAUTHORIZED", message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "NOT_FOUND", message: "Document not found" },
        { status: 404 }
      );
    }

    if (document.recipientId !== user.id) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: "FORBIDDEN",
          message: "Only the recipient can sign this document",
        },
        { status: 403 }
      );
    }

    if (document.status !== "PENDING") {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: "VALIDATION_ERROR",
          message: `Document is already ${document.status}`,
        },
        { status: 400 }
      );
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await EventLogger.signAction(user.id, documentId, "SIGNED");

    return NextResponse.json<SignDocumentResponse>(
      {
        document: updatedDocument,
        message: "Document signed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sign document error:", error);
    return NextResponse.json<ApiErrorResponse>(
      { error: "SERVER_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
