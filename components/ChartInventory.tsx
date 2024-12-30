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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

type FilterType = "Year" | "Month" | "Day";

const InventoryChart = () => {
  const [filter, setFilter] = useState<FilterType>("Year");
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const createDatasets = useCallback((
    brandsData: number[],
    typesData: number[],
    productsData: number[]
  ): ChartDataset[] => {
    return [
      {
        label: "Products",
        data: productsData,
        backgroundColor: "rgba(219,163,98, 0.2)",
        borderColor: "rgba(219,163,98, 1)",
        borderWidth: 1,
      },
      {
        label: "Brands",
        data: brandsData,
        backgroundColor: "rgba(98,159,244, 0.2)",
        borderColor: "rgba(98,159,244, 1)",
        borderWidth: 1,
      },
      {
        label: "Types",
        data: typesData,
        backgroundColor: "rgba(88,211,101, 0.2)",
        borderColor: "rgba(88,211,101, 1)",
        borderWidth: 1,
      },
    ];
  }, []);

  const prepareChartData = useCallback((apiData: ApiData) => {
    const years = Object.keys(apiData.data);
    const currentDate = new Date();
    const selectedYear = currentDate.getFullYear().toString();
    const selectedMonth = currentDate.toLocaleString("default", { month: "long" });

    if (filter === "Year") {
      const brandsData = years.map((year) =>
        Object.values(apiData.data[year]).reduce((sum, month) => {
          return Object.values(month).reduce(
            (innerSum, day) => innerSum + day.brand,
            sum
          );
        }, 0)
      );

      const typesData = years.map((year) =>
        Object.values(apiData.data[year]).reduce((sum, month) => {
          return Object.values(month).reduce(
            (innerSum, day) => innerSum + day.type,
            sum
          );
        }, 0)
      );

      const productsData = years.map((year) =>
        Object.values(apiData.data[year]).reduce((sum, month) => {
          return Object.values(month).reduce(
            (innerSum, day) => innerSum + day.product,
            sum
          );
        }, 0)
      );

      setChartData({
        labels: years,
        datasets: createDatasets(brandsData, typesData, productsData),
      });
    } else if (filter === "Month") {
      const months = Object.keys(apiData.data[years[0]]);
      
      const brandsData = months.map((month) =>
        years.reduce((sum, year) => {
          return sum + (apiData.data[year][month]
            ? Object.values(apiData.data[year][month]).reduce(
                (innerSum, day) => innerSum + day.brand,
                0
              )
            : 0);
        }, 0)
      );

      const typesData = months.map((month) =>
        years.reduce((sum, year) => {
          return sum + (apiData.data[year][month]
            ? Object.values(apiData.data[year][month]).reduce(
                (innerSum, day) => innerSum + day.type,
                0
              )
            : 0);
        }, 0)
      );

      const productsData = months.map((month) =>
        years.reduce((sum, year) => {
          return sum + (apiData.data[year][month]
            ? Object.values(apiData.data[year][month]).reduce(
                (innerSum, day) => innerSum + day.product,
                0
              )
            : 0);
        }, 0)
      );

      setChartData({
        labels: months,
        datasets: createDatasets(brandsData, typesData, productsData),
      });
    } else {
      const days = Object.keys(apiData.data[selectedYear]?.[selectedMonth] || {});

      if (days.length === 0) {
        console.error(`No data found for ${selectedYear} ${selectedMonth}`);
        return;
      }

      const brandsData = days.map((day) => apiData.data[selectedYear][selectedMonth][day].brand);
      const typesData = days.map((day) => apiData.data[selectedYear][selectedMonth][day].type);
      const productsData = days.map((day) => apiData.data[selectedYear][selectedMonth][day].product);

      setChartData({
        labels: days,
        datasets: createDatasets(brandsData, typesData, productsData),
      });
    }
  }, [filter, createDatasets]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/counts", { method: "GET" });
      const data: ApiData = await response.json();

      if (response.ok) {
        prepareChartData(data);
      } else {
        console.error("Failed to fetch data:", data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [prepareChartData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-5 mt-10 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-500 px-2 md:px-10 py-5 rounded-lg">
      <div className="flex justify-between">
        <h2>Brands, Types, and Products Chart ({filter})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="px-2 py-1 md:px-4 md:py-2 dark:border-gray-500  dark:bg-slate-600  border rounded text-xs md:text-sm"
        >
          <option value="Year">Year</option>
          <option value="Month">Month</option>
          <option value="Day">Day</option>
        </select>
      </div>
      
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              // title: {
              //   display: true,
              //   text: `Brands, Types, and Products (${filter})`,
              // },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
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

export default InventoryChart;