import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Verify user is a member of this organization
    const userMember = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
    });

    if (!userMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all teams the user belongs to in this organization
    const userTeams = await prisma.member.findMany({
      where: {
        userId: session.user.id,
        organizationId,
        teamId: {
          not: null, // Only get team memberships, not organization-wide memberships
        },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        team: {
          name: "asc",
        },
      },
    });

    return NextResponse.json({
      success: true,
      teams: userTeams.map((membership) => ({
        id: membership.team!.id,
        name: membership.team!.name,
        role: membership.role,
        createdAt: membership.createdAt.toISOString(),
        teamCreatedAt: membership.team!.createdAt.toISOString(),
        teamUpdatedAt: membership.team!.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching user teams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
