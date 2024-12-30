import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

type GroupedData = {
  [year: string]: {
    [month: string]: {
      [day: string]: {
        brand: number;
        type: number;
        product: number;
      };
    };
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // Check if session is valid or not
    if (!session || !session.user || !session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: No valid session" }),
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    // find brands, types, and products
    const brands = await prisma.brand.findMany({
      where: { userId: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    const types = await prisma.type.findMany({
      where: { userId: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    const products = await prisma.product.findMany({
      where: { userId: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // Group data by year, month, day
    const groupByDate = (data: { createdAt: Date }[]) => {
      return data.reduce<GroupedData>((acc, item) => {
        const date = new Date(item.createdAt);
        const year = date.getFullYear().toString();
        const month = date.toLocaleString("default", { month: "long" });
        const day = date.getDate().toString();

        if (!acc[year]) acc[year] = {};
        if (!acc[year][month]) acc[year][month] = {};
        if (!acc[year][month][day])
          acc[year][month][day] = { brand: 0, type: 0, product: 0 };

        acc[year][month][day].brand += 1;
        acc[year][month][day].type += 1;
        acc[year][month][day].product += 1;

        return acc;
      }, {});
    };

    // Group brands, types, and products
    const groupedBrands = groupByDate(brands);
    const groupedTypes = groupByDate(types);
    const groupedProducts = groupByDate(products);

    // Merge the counts for brand, type, and product
    const mergeCounts = (
      groupedBrands: GroupedData,
      groupedTypes: GroupedData,
      groupedProducts: GroupedData
    ): GroupedData => {
      const result: GroupedData = {};

      for (const year in groupedBrands) {
        if (!result[year]) result[year] = {};

        for (const month in groupedBrands[year]) {
          if (!result[year][month]) result[year][month] = {};

          for (const day in groupedBrands[year][month]) {
            if (!result[year][month][day]) {
              result[year][month][day] = { brand: 0, type: 0, product: 0 };
            }

            result[year][month][day] = {
              brand: groupedBrands[year][month][day].brand,
              type: groupedTypes[year][month][day].type,
              product: groupedProducts[year][month][day].product,
            };
          }
        }
      }

      return result;
    };

    const mergedGroupedData = mergeCounts(
      groupedBrands,
      groupedTypes,
      groupedProducts
    );

    // Calculate total all-time counts for brands, products, and types
    const totalCounts = {
      brands: brands.length,
      types: types.length,
      products: products.length,
    };

    // Return the merged data along with total counts
    return NextResponse.json({
      success: true,
      data: mergedGroupedData,
      totalCounts: totalCounts,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch counts" },
      { status: 500 }
    );
  }
}
