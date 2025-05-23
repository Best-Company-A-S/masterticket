import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    // Verify user is member of the organization
    const membership = await prisma.member.findFirst({
      where: {
        userId: session.user.id,
        organizationId: organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied to this organization" },
        { status: 403 }
      );
    }

    // Get all teams of the organization
    const teams = await prisma.team.findMany({
      where: {
        organizationId: organizationId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format response for assignment purposes
    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      memberCount: team._count.members,
      createdAt: team.createdAt,
    }));

    // Ensure no duplicate team IDs by using a Map
    const uniqueTeams = Array.from(
      new Map(formattedTeams.map((team) => [team.id, team])).values()
    );

    return NextResponse.json({
      success: true,
      teams: uniqueTeams,
    });
  } catch (error) {
    console.error("Error fetching organization teams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
