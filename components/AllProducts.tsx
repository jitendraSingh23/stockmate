"use client";
import React, { useEffect, useState } from "react";
import { Product, Brand, Type } from "@prisma/client";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";
import { GridApi, ColDef, GridReadyEvent } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

type ProductWithRelations = Product & {
  brand: Brand;
  type: Type;
};

type APIError = {
  message: string;
  status?: number;
};

const AllProducts = () => {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithRelations | null>(null);
  const [quantityChange, setQuantityChange] = useState<number>(0);
  const [isIncrement, setIsIncrement] = useState<boolean>(true);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);
    // ...
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        const error = err as Error | APIError;
        setError(error.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const handleResize = () => {
      if (gridApi) {
        gridApi.sizeColumnsToFit();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [gridApi]);

  // for button purchase(increments the quantity)
  const handleIncrement = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsIncrement(true);
    setShowModal(true);
    setQuantityChange(0);
  };

  // for button sell(decrements the quantity)
  const handleDecrement = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsIncrement(false);
    setShowModal(true);
    setQuantityChange(0);
  };

  const updateQuantity = async () => {
    if (!selectedProduct) return;
    const updatedQuantity = isIncrement
      ? selectedProduct.quantity + quantityChange
      : selectedProduct.quantity - quantityChange;

    if (updatedQuantity < 0) {
      alert("Quantity cannot be less than 0");
      return;
    }

    if (
      !isIncrement &&
      (!selectedProduct.unitPrice || selectedProduct.unitPrice <= 0)
    ) {
      alert("Please enter a valid unit price for sale");
      return;
    }

    const transactionType = isIncrement ? "purchase" : "sale";

    try {
      const response = await fetch("/api/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedProduct.id,
          quantity: quantityChange,
          transactionType,
          unitPrice: selectedProduct.unitPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      const updatedProducts = products.map((product) =>
        product.id === selectedProduct.id
          ? { ...product, quantity: updatedQuantity }
          : product
      );

      setProducts(updatedProducts);
      setShowModal(false);

      const data = await response.json();
      console.log("Transaction created:", data);
    } catch (err) {
      const error = err as Error | APIError;
      console.error("Error creating transaction:", error.message);
      alert(`Failed to update product: ${error.message}`);
    }
  };

  //buttons for purchse and sell in every row
  const CustomButtonComponent: React.FC<{ data: ProductWithRelations }> = ({
    data: product,
  }) => {
    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 justify-center items-center py-2 h-full">
        <button
          onClick={() => handleIncrement(product)}
          className="bg-blue-500 hover:bg-blue-700 hover:scale-95 transition-transform  px-2 py-1 rounded text-white text-sm sm:text-base whitespace-nowrap"
        >
          Purchase
        </button>
        <button
          onClick={() => handleDecrement(product)}
          className="bg-blue-500 hover:bg-blue-700 hover:scale-95 transition-transform px-6 py-1 rounded text-white text-sm sm:text-base whitespace-nowrap"
        >
          sold
        </button>
      </div>
    );
  };

  //theme for style of table
  const myTheme = themeQuartz.withParams({
    spacing: 20,
    foregroundColor: isDarkMode ? "white" : "black",
    backgroundColor: isDarkMode ? "rgb(2, 6, 23 )" : "white",
    headerBackgroundColor: "slate",
    rowHoverColor: isDarkMode ? "rgb(146 161 185)" : "rgb(216, 226, 255)",
  });

  const colDefs: ColDef[] = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 150,
      flex: 1,
      suppressSizeToFit: true,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return params.value.charAt(0).toUpperCase() + params.value.slice(1);
      },
    },
    {
      field: "quantity",
      headerName: "Qty",
      minWidth: 100,
      flex: 0.5,
      suppressSizeToFit: true,

    },
    {
      field: "button",
      headerName: "Actions",
      cellRenderer: CustomButtonComponent,
      minWidth: 200,
      flex: 1,
      suppressSizeToFit: true,
    },
    {
      field: "brand.name",
      headerName: "Brand",
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return params.value.charAt(0).toUpperCase() + params.value.slice(1);
      },
    },
    {
      field: "type.name",
      headerName: "Type",
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "";
        return params.value.charAt(0).toUpperCase() + params.value.slice(1);
      },
    },

    {
      field: "unitPrice",
      headerName: "Price",
      minWidth: 100,
      flex: 0.5,
      suppressSizeToFit: true,
    },
    {
      field: "inStock",
      headerName: "In-Stock",
      valueFormatter: (params) => (params.value ? "YES" : "NO"),
      minWidth: 100,
      flex: 0.5,
      suppressSizeToFit: true,
    },
  ];

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="w-full h-full">
      <div className="w-full h-full max-w-[95vw] mx-auto " id="myGrid">
        <AgGridReact
          theme={myTheme}
          rowData={products}
          columnDefs={colDefs}
          pagination={true}
          domLayout="autoHeight"
          onGridReady={onGridReady}
          defaultColDef={{
            resizable: true,
            sortable: true,
          }}
          className="w-full ag-theme-quartz bg-white dark:bg-slate-950 "
        />
      </div>

      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isIncrement
                ? `Increment Quantity for ${selectedProduct.name}`
                : `Decrement Quantity for ${selectedProduct.name}`}
            </h3>
            <div className="space-y-4">
              <label htmlFor="Quantity">Quantity</label>
              <input
                type="number"
                name="Quantity"
                value={quantityChange}
                onChange={(e) => setQuantityChange(Number(e.target.value))}
                min="0"
                className="w-full border-2 border-gray-300 rounded px-3 py-2 bg-white dark:bg-slate-600"
                placeholder="Enter quantity"
              />
              {!isIncrement && (
                <div>
                  <label htmlFor="unitPrice">Unit Price</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={selectedProduct.unitPrice}
                    onChange={(e) =>
                      setSelectedProduct({
                        ...selectedProduct,
                        unitPrice: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    className="w-full border-2 border-gray-300 rounded px-3 py-2 bg-white dark:bg-slate-600"
                    placeholder="Enter unit price for sale"
                  />
                </div>
              )}
            </div>
            <div className="flex md:flex-col gap-4 mt-6">
              <button
                onClick={updateQuantity}
                className="flex-1 bg-blue-400 py-2 rounded text-white hover:bg-blue-00"
              >
                Update
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border-2 border-gray-300 rounded hover:bg-gray-100 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
