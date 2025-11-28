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

    return NextResponse.json<Document[]>(documents, { status: 200 });
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

    const body: CreateDocumentRequest = await request.json();
    const { title, recipientId } = body;

    if (!title || !recipientId) {
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
        status: "PENDING",
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
  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json<ApiErrorResponse>(
      { error: "SERVER_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
