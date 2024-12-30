"use client";
import { useState } from "react";
import AddProduct from "@/components/AddProduct";
import AllProducts from "@/components/AllProducts";
import NavBar from "@/components/NavBar";

export default function Inventory() {
  const [showAddProduct, setShowAddProduct] = useState(false);

  return (
    <div className="min-h-screen ">
      <NavBar />
      <div>
        {showAddProduct && (
          <AddProduct onClose={() => setShowAddProduct(false)} />
        )}
        <div className="w-full p-4">
          <div className="flex w-full justify-end">
            <button
              className="p-2 bg-blue-500 rounded m-5 hover:bg-blue-700 transition-transform duration-300 hover:scale-95 text-white "
              onClick={() => setShowAddProduct(true)}
            >
              Add product
            </button>
          </div>
          <AllProducts />
        </div>
      </div>{" "}
    </div>
  );
}
