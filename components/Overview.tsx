"use client";

import React, { useCallback, useEffect, useState } from "react";
import purchase from "../img/Profitt.svg";
import profit from "../img/Sales.svg";
import sales from "../img/Revenue.svg";
import OverviewComp from "./OverviewCom";

interface TransactionData {
  purchase: number;
  sale: number;
}

interface YearData {
  [month: string]: {
    [day: string]: TransactionData;
  };
}

interface APIResponse {
  data: {
    [year: string]: YearData;
  };
  totals: TransactionData;
}

export default function Overview({ title }: { title: string }) {
  const [totals, setTotals] = useState<TransactionData | null>(null);
  const [filteredData, setFilteredData] = useState<TransactionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string>("alltime");
  const [month, setMonth] = useState<string>("alltime");
  const [day, setDay] = useState<string>("alltime");

  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);

  const fetchTransactionTotals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/transactions`);
      if (!response.ok) {
        throw new Error("Failed to fetch transaction totals");
      }

      const data: APIResponse = await response.json();
      console.log("API Response:", data);

      if (data?.data) {
        let filteredData: TransactionData | null = null;
        const availableYears = Object.keys(data.data);
        setYears(availableYears);

        if (year !== "alltime" && data.data[year]) {
          const yearData = data.data[year];
          const availableMonths = Object.keys(yearData);
          setMonths(availableMonths);

          if (month !== "alltime" && yearData[month]) {
            const monthData = yearData[month];
            const availableDays = Object.keys(monthData);
            setDays(availableDays);

            if (day !== "alltime" && monthData[day]) {
              filteredData = monthData[day];
            } else {
              filteredData = Object.values(monthData).reduce(
                (acc, curr) => ({
                  purchase: acc.purchase + (curr.purchase || 0),
                  sale: acc.sale + (curr.sale || 0),
                }),
                { purchase: 0, sale: 0 }
              );
            }
          } else {
            filteredData = Object.values(yearData).reduce(
              (acc, monthData) =>
                Object.values(monthData).reduce(
                  (acc, curr) => ({
                    purchase: acc.purchase + (curr.purchase || 0),
                    sale: acc.sale + (curr.sale || 0),
                  }),
                  acc
                ),
              { purchase: 0, sale: 0 }
            );
          }
        }

        setFilteredData(filteredData);
        setTotals(data.totals);
      } else {
        console.error("Invalid data structure:", data);
        setError("Invalid data structure");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [year, month, day]);

  useEffect(() => {
    fetchTransactionTotals();
  }, [fetchTransactionTotals]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const displayData = filteredData || totals;

  return (
    <div className="flex flex-col gap-5  mt-10 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-500 px-2 md:px-10 py-5 rounded-lg ">
      <div className="flex justify-between items-center">
        <h2 className="capitalize font-semibold">{title}</h2>
        <div className="flex gap-2">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 dark:border-gray-500  dark:bg-slate-600  rounded px-2 py-1 text-xs md:text-sm"
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
              onChange={(e) => setMonth(e.target.value)}
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
      <div className="flex gap-2 justify-center">
        {displayData ? (
          <>
            <OverviewComp
              title="Purchase"
              value={displayData.purchase.toString()}
              iconpath={purchase}
              rupee="₹"
            />
            <OverviewComp
              title="Sales"
              value={displayData.sale.toString()}
              iconpath={sales}
              rupee="₹"
            />
            <OverviewComp
              title="Profit"
              value={(displayData.sale - displayData.purchase).toString()}
              iconpath={profit}
              rupee="₹"
            />
          </>
        ) : (
          <p>No transactions available</p>
        )}
      </div>
    </div>
  );
}
