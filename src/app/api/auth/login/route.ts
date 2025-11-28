import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/services/db";
import { generateToken } from "@/services/auth";
import { EventLogger } from "@/services/eventLogger";
import { LoginRequest, LoginResponse, ApiErrorResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: "VALIDATION_ERROR",
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.mockPassword !== password) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "UNAUTHORIZED", message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    await EventLogger.login(user.id, user.email);

    return NextResponse.json<LoginResponse>(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<ApiErrorResponse>(
      { error: "SERVER_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
