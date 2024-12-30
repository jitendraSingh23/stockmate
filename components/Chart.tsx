"use client";

import { useCallback, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DayData {
  purchase: number;
  sale: number;
}

interface MonthData {
  [day: string]: DayData;
}

interface YearData {
  [month: string]: MonthData;
}

interface TransactionData {
  data: {
    [year: string]: YearData;
  };
  totals: {
    purchase: number;
    sale: number;
  };
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

const SalesChart = () => {
  const [filter, setFilter] = useState<"Year" | "Month" | "Day">("Year");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prepareChartData = useCallback(
    (data: TransactionData) => {
      const years = Object.keys(data.data);
      const currentDate = new Date();
      const selectedYear = currentDate.getFullYear().toString();
      const selectedMonth = currentDate.toLocaleString("default", {
        month: "long",
      });

      if (filter === "Year") {
        const purchaseData = years.map((year) =>
          Object.values(data.data[year]).reduce((sum, month) => {
            return Object.values(month).reduce(
              (innerSum, day) => innerSum + day.purchase,
              sum
            );
          }, 0)
        );

        const saleData = years.map((year) =>
          Object.values(data.data[year]).reduce((sum, month) => {
            return Object.values(month).reduce(
              (innerSum, day) => innerSum + day.sale,
              sum
            );
          }, 0)
        );

        setChartData({
          labels: years,
          datasets: [
            {
              label: "Purchases",
              data: purchaseData,
              backgroundColor: "rgba(219,163,98, 0.2)",
              borderColor: "rgba(219,163,98, 1)",
              borderWidth: 1,
            },
            {
              label: "Sales",
              data: saleData,
              backgroundColor: "rgba(129,122,243, 0.2)",
              borderColor: "rgba(129,122,243, 1)",
              borderWidth: 1,
            },
          ],
        });
      } else if (filter === "Month") {
        const months = Object.keys(data.data[years[0]] || {});
        const purchaseData = months.map((month) =>
          years.reduce((sum, year) => {
            return (
              sum +
              (data.data[year][month]
                ? Object.values(data.data[year][month]).reduce(
                    (innerSum, day) => innerSum + day.purchase,
                    0
                  )
                : 0)
            );
          }, 0)
        );

        const saleData = months.map((month) =>
          years.reduce((sum, year) => {
            return (
              sum +
              (data.data[year][month]
                ? Object.values(data.data[year][month]).reduce(
                    (innerSum, day) => innerSum + day.sale,
                    0
                  )
                : 0)
            );
          }, 0)
        );

        setChartData({
          labels: months,
          datasets: [
            {
              label: "Purchases",
              data: purchaseData,
              backgroundColor: "rgba(219,163,98, 0.2)",
              borderColor: "rgba(219,163,98, 1)",
              borderWidth: 1,
            },
            {
              label: "Sales",
              data: saleData,
              backgroundColor: "rgba(129,122,243, 0.2)",
              borderColor: "rgba(129,122,243, 1)",
              borderWidth: 1,
            },
          ],
        });
      } else if (filter === "Day") {
        if (!data.data[selectedYear]?.[selectedMonth]) {
          setError(`No data found for ${selectedYear} ${selectedMonth}`);
          setChartData(null);
          return;
        }

        const days = Object.keys(data.data[selectedYear][selectedMonth]);
        const purchaseData = days.map(
          (day) => data.data[selectedYear][selectedMonth][day].purchase
        );
        const saleData = days.map(
          (day) => data.data[selectedYear][selectedMonth][day].sale
        );

        setChartData({
          labels: days,
          datasets: [
            {
              label: "Purchases",
              data: purchaseData,
              backgroundColor: "rgba(219,163,98, 0.2)",
              borderColor: "rgba(219,163,98, 1)",
              borderWidth: 1,
            },
            {
              label: "Sales",
              data: saleData,
              backgroundColor: "rgba(129,122,243, 0.2)",
              borderColor: "rgba(129,122,243, 1)",
              borderWidth: 1,
            },
          ],
        });
      }
    },
    [filter]
  );
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/transactions", { method: "GET" });
      const data = (await response.json()) as TransactionData;

      if (response.ok) {
        prepareChartData(data);
      } else {
        console.error("Failed to fetch data:", data);
        setError("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    }
  }, [prepareChartData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); 

  return (
    <div className="flex flex-col gap-5 mt-10 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-500 px-2 md:px-10 py-5 rounded-lg">
      <div className="flex justify-between">
        <h2>Purchases and Sales Chart ({filter})</h2>
        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "Year" | "Month" | "Day")
          }
          className="px-2 py-1 md:px-4 md:py-2  dark:border-gray-500  dark:bg-slate-600  border rounded text-xs md:text-sm"
        >
          <option value="Year">Year</option>
          <option value="Month">Month</option>
          <option value="Day">Day</option>
        </select>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {chartData ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
                // title: {
                //   display: true,
                //   text: `Purchases vs Sales (${filter})`,
                // },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    return `₹ ${tooltipItem.raw}`;
                  },
                },
              },
            },
          }}
        />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default SalesChart;
