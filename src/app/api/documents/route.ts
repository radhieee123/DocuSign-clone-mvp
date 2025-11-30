import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/db";
import { verifyToken, extractTokenFromHeader } from "@/services/auth";
import { EventLogger } from "@/services/eventLogger";
import {
  CreateDocumentRequest,
  CreateDocumentResponse,
  Document,
  ApiErrorResponse,
} from "@/types";
import { DOCUMENT_STATUS } from "@/constants";

export async function GET(request: NextRequest) {
  try {
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

    const documents = await prisma.document.findMany({
      where: {
        OR: [{ senderId: user.id }, { recipientId: user.id }],
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
      orderBy: {
        requestedAt: "desc",
      },
    });

    return NextResponse.json(documents as Document[], { status: 200 });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json<ApiErrorResponse>(
      { error: "SERVER_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(
      request.headers.get("Authorization") || ""
    );

    if (!token) {
      console.error("No token provided");
      return NextResponse.json<ApiErrorResponse>(
        { error: "UNAUTHORIZED", message: "No authorization token provided" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      console.error("Invalid token");
      return NextResponse.json<ApiErrorResponse>(
        { error: "UNAUTHORIZED", message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body: CreateDocumentRequest = await request.json();
    const { title, recipientId, fileData, fileName, fileType } = body;

    if (!title || !recipientId) {
      console.error("Missing required fields:", { title, recipientId });
      return NextResponse.json<ApiErrorResponse>(
        {
          error: "VALIDATION_ERROR",
          message: "Title and recipientId are required",
        },
        { status: 400 }
      );
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      console.error("Recipient not found:", recipientId);
      return NextResponse.json<ApiErrorResponse>(
        { error: "VALIDATION_ERROR", message: "Recipient not found" },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        title,
        senderId: user.id,
        recipientId,
        status: DOCUMENT_STATUS.PENDING,
        fileData: fileData || null,
        fileName: fileName || null,
        fileType: fileType || null,
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

    await EventLogger.documentRequested(
      user.id,
      document.id,
      recipientId,
      title
    );

    return NextResponse.json<CreateDocumentResponse>(
      {
        document,
        message: "Document request created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create document error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json<ApiErrorResponse>(
      {
        error: "SERVER_ERROR",
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
