import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

//for all the products
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
    //Find in database
    const products = await prisma.product.findMany({
      where: { userId: Number(session.user.id) },
      include: {
        brand: true,
        type: true,
      },
    });

    return new Response(JSON.stringify({ products }), { status: 200 });
  } catch (error) {
    console.error(
      "Error fetching products:",
      error instanceof Error ? error.message : error
    );
    return new Response(
      JSON.stringify({
        error: "Failed to fetch Products",
        details: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}

//creation of a product
export async function POST(req: Request) {
  console.log("API Route hit with method:", req.method);

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: No valid session" }),
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const body = await req.json();
    const { name, brand, type, quantity, unitPrice } = body;

    let brandId: number | null = null;
    let typeId: number | null = null;

    // Brand: check if exists, if not create
    if (brand) {
      const existingBrand = await prisma.brand.findFirst({
        where: { name: brand },
      });
      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        const newBrand = await prisma.brand.create({
          data: { name: brand, userId },
        });
        brandId = newBrand.id;
      }
    }

    // Type: check if exists, if not create
    if (type) {
      const existingType = await prisma.type.findFirst({
        where: { name: type },
      });
      if (existingType) {
        typeId = existingType.id;
      } else {
        const newType = await prisma.type.create({
          data: { name: type, userId },
        });
        typeId = newType.id;
      }
    }

    //check if all the required feilds are provided or not
    if (!name || !brandId || !typeId || quantity < 0 || unitPrice < 0) {
      return NextResponse.json(
        { error: "All  fields are required" },
        { status: 400 }
      );
    }

    // // remove from comment if you don't want same named product
    // // but it would be better if it's allowed because may be we bought same product
    // // with different unitprice or brand

    // const existingProduct = await prisma.product.findFirst({
    //   where: { name, brandId, typeId, userId },
    // });
    // if (existingProduct) {
    //   return NextResponse.json(
    //     { error: "product already exists" },
    //     { status: 400 }
    //   );
    // }

    //product creation in DB
    const product = await prisma.product.create({
      data: {
        name,
        brandId,
        typeId,
        quantity,
        unitPrice,
        inStock: quantity > 0,
        userId,
      },
    });

    //transaction creation in DB
    await prisma.transaction.create({
      data: {
        productId: product.id,
        type: "PURCHASE",
        quantity,
        unitPrice,
        userId,
      },
    });
    return NextResponse.json(
      {
        message: "Product added successfully!",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error adding product:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
