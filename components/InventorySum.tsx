"use client";

import React, { useCallback, useEffect, useState } from "react";
import product from "../img/Grocery store milk.svg";
import brand from "../img/brand.svg";
import category from "../img/category.svg";
import OverviewComp from "./OverviewCom";

// Define interfaces for the data structure
interface DayData {
  brand: number;
  type: number;
  product: number;
}

interface MonthData {
  [day: string]: DayData;
}

interface YearData {
  [month: string]: MonthData;
}

interface ApiData {
  data: {
    [year: string]: YearData;
  };
  totalCounts: {
    brands: number;
    types: number;
    products: number;
  };
}

interface FilteredCounts {
  brands: number;
  types: number;
  products: number;
}

export default function InventorySum({ title }: { title: string }) {
  // const [apiData, setApiData] = useState<ApiData | null>(null);
  const [filteredData, setFilteredData] = useState<FilteredCounts>({
    brands: 0,
    types: 0,
    products: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState<string>("alltime");
  const [month, setMonth] = useState<string>("alltime");
  const [day, setDay] = useState<string>("alltime");

  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);

  const aggregateDayData = useCallback(
    (dayData: DayData): FilteredCounts => ({
      brands: dayData.brand || 0,
      types: dayData.type || 0,
      products: dayData.product || 0,
    }),
    []
  );

  const aggregateMonthData = useCallback(
    (monthData: MonthData): FilteredCounts => {
      return Object.values(monthData).reduce(
        (acc: FilteredCounts, dayData) => ({
          brands: acc.brands + (dayData.brand || 0),
          types: acc.types + (dayData.type || 0),
          products: acc.products + (dayData.product || 0),
        }),
        { brands: 0, types: 0, products: 0 }
      );
    },
    []
  );

  const aggregateYearData = useCallback(
    (yearData: YearData): FilteredCounts => {
      return Object.values(yearData).reduce(
        (acc: FilteredCounts, monthData) => {
          const monthTotal = aggregateMonthData(monthData);
          return {
            brands: acc.brands + monthTotal.brands,
            types: acc.types + monthTotal.types,
            products: acc.products + monthTotal.products,
          };
        },
        { brands: 0, types: 0, products: 0 }
      );
    },
    [aggregateMonthData]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/counts");
      if (!response.ok) {
        throw new Error("Failed to fetch inventory summary");
      }
      const result: ApiData = await response.json();
      console.log("API Response:", result);

      // Extract available years
      const availableYears = Object.keys(result.data || {});
      setYears(availableYears);

      if (year !== "alltime" && result.data[year]) {
        const yearData = result.data[year];
        const availableMonths = Object.keys(yearData);
        setMonths(availableMonths);

        if (month !== "alltime" && yearData[month]) {
          const monthData = yearData[month];
          const availableDays = Object.keys(monthData);
          setDays(availableDays);

          if (day !== "alltime" && monthData[day]) {
            // Specific day data
            setFilteredData(aggregateDayData(monthData[day]));
          } else {
            // Aggregate month data
            setFilteredData(aggregateMonthData(monthData));
          }
        } else {
          // Aggregate year data
          setFilteredData(aggregateYearData(yearData));
        }
      } else {
        // If no filters are applied, show all-time totals
        setFilteredData(result.totalCounts);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    year,
    month,
    day,
    aggregateDayData,
    aggregateMonthData,
    aggregateYearData,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col gap-5 mt-10 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-500 px-2 md:px-10 py-5 rounded-lg">
      <div className="flex justify-between items-center gap-2">
        <div className="capitalize font-semibold">{title}</div>
        <div className="flex gap-2 ">
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setMonth("alltime");
              setDay("alltime");
            }}
            className="border border-gray-300 dark:border-gray-500 dark:bg-slate-600 rounded px-2 py-1 text-xs md:text-sm"
          >
            <option value="alltime">All Time</option>
            {years.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
          {year !== "alltime" && (
            <select
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setDay("alltime");
              }}
              className="border border-gray-300 dark:border-gray-500 dark:bg-slate-600 rounded px-2 py-1 text-xs md:text-sm"
            >
              <option value="alltime">All Months</option>
              {months.map((monthOption) => (
                <option key={monthOption} value={monthOption}>
                  {monthOption}
                </option>
              ))}
            </select>
          )}
          {year !== "alltime" && month !== "alltime" && (
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="border border-gray-300 dark:border-gray-500 dark:bg-slate-600 rounded px-2 py-1 text-xs md:text-sm"
            >
              <option value="alltime">All Days</option>
              {days.map((dayOption) => (
                <option key={dayOption} value={dayOption}>
                  {dayOption}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <OverviewComp
          title="Products"
          value={filteredData.products.toString()}
          iconpath={product}
        />
        <OverviewComp
          title="Brands"
          value={filteredData.brands.toString()}
          iconpath={brand}
        />
        <OverviewComp
          title="Types"
          value={filteredData.types.toString()}
          iconpath={category}
        />
      </div>
    </div>
  );
}
