import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Invalid invitation code" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: {
        organization: true,
        team: true,
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation code" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation code has expired" },
        { status: 400 }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Invitation code has already been used" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        code: invitation.code,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
          slug: invitation.organization.slug,
          logo: invitation.organization.logo,
        },
        team: invitation.team
          ? {
              id: invitation.team.id,
              name: invitation.team.name,
            }
          : null,
        inviter: {
          name: invitation.inviter.name,
          email: invitation.inviter.email,
        },
      },
    });
  } catch (error) {
    console.error("Error getting invitation info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
