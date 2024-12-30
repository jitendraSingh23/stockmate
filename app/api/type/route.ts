import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    //check if session is valid or not
    if (!session || !session.user || !session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: No valid session" }),
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const types = await prisma.type.findMany({
      where: {
        userId,
      },
    });
    return NextResponse.json({ types }, { status: 200 });
  } catch (error) {
    console.error("Error fetching types:", error);
    return NextResponse.json(
      { errror: "failed to fetch to types" },
      { status: 500 }
    );
  }
}

