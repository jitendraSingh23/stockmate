import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: No valid session" }),
        { status: 401 }
      );
    }
    const userId = Number(session.user.id);

    const { id, quantity, transactionType, unitPrice } = await req.json();

    if (!id || !quantity || !transactionType) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const uppercasedTransactionType = transactionType.toUpperCase();

    // Get current product to check quantity
    const currentProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate new quantity for transaction
    const newQuantity =
      transactionType === "purchase"
        ? currentProduct.quantity + quantity
        : currentProduct.quantity - quantity;

    // Check if quantity of transaction (sale) <= quantity in stock
    if (transactionType === "sale" && newQuantity < 0) {
      return NextResponse.json(
        {
          error: "Insufficient stock for this transaction",
        },
        { status: 400 }
      );
    }

    // Create a transaction in the database
    const transaction = await prisma.transaction.create({
      data: {
        productId: id,
        quantity,
        type: uppercasedTransactionType,
        unitPrice,
        userId,
      },
    });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        quantity: newQuantity,
        inStock: newQuantity > 0, //update instock
      },
    });

    return NextResponse.json(
      {
        transaction,
        updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing transaction:", errorMessage);
    return NextResponse.json(
      {
        error: "Failed to process transaction",
      },
      { status: 500 }
    );
  }
}

//look
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: No valid session" }),
        { status: 401 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: Number(session.user.id),
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify({ transactions }), { status: 200 });
  } catch (error) {
    console.error(
      "Error fetching transactions:",
      error instanceof Error ? error.message : error
    );
    return new Response(
      JSON.stringify({
        error: "Failed to fetch transactions",
        details: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}
