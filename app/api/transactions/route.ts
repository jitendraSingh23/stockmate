import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();
type GroupedData = {
  [year: string]: {
    [month: string]: {
      [day: string]: {
        purchase: number;
        sale: number;
      };
    };
  };
};

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

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      select: {
        type: true,
        quantity: true,
        unitPrice: true,
        createdAt: true,
      },
    });

    //Return transaction data according to year, months and date 
    const groupedData = transactions.reduce<GroupedData>((acc, transaction) => {
      const date = new Date(transaction.createdAt);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();

      if (!acc[year]) acc[year] = {};
      if (!acc[year][month]) acc[year][month] = {};
      if (!acc[year][month][day])
        acc[year][month][day] = { purchase: 0, sale: 0 };

      const totalPrice = transaction.quantity * transaction.unitPrice;

      if (transaction.type === "PURCHASE") {
        acc[year][month][day].purchase += totalPrice;
      } else if (transaction.type === "SALE") {
        acc[year][month][day].sale += totalPrice;
      }

      return acc;
    }, {});

    const totals = transactions.reduce(
      (acc, transaction) => {
        const totalPrice = transaction.quantity * transaction.unitPrice;
        if (transaction.type === "PURCHASE") acc.purchase += totalPrice;
        if (transaction.type === "SALE") acc.sale += totalPrice;
        return acc;
      },
      { purchase: 0, sale: 0 }
    );

    return NextResponse.json({ data: groupedData, totals });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
