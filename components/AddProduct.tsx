"use client";
import React, { useState, useEffect } from "react";

interface AddProductProps {
  onClose: () => void;
}

interface Brand {
  id: number;
  name: string;
}

interface Type {
  id: number;
  name: string;
}

export default function AddProduct({ onClose }: AddProductProps) {
  const [formData, setFormData] = useState({
    name: "",
    brandId: "",
    typeId: "",
    quantity: 0,
    unitPrice: 0,
    newBrand: "",
    newType: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [types, setTypes] = useState<Type[]>([]);

  useEffect(() => {
    const fetchBrandsAndTypes = async () => {
      try {
        const res = await fetch("/api/brand");
        const data = await res.json();
        setBrands(data.brands);

        const resTypes = await fetch("/api/type");
        const dataTypes = await resTypes.json();
        setTypes(dataTypes.types);
      } catch (err) {
        console.error("Error fetching brands or types:", err);
      }
    };
    fetchBrandsAndTypes();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "unitPrice" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Find the selected brand and type names if IDs are selected
    const selectedBrand = brands.find(
      (b) => b.id.toString() === formData.brandId
    );
    const selectedType = types.find((t) => t.id.toString() === formData.typeId);

    const dataToSend = {
      name: formData.name,
      brand: formData.brandId ? selectedBrand?.name : formData.newBrand,
      type: formData.typeId ? selectedType?.name : formData.newType,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
    };

    //send for creation of product
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add product");
      }

      setSuccess("Product added successfully!");
      setFormData({
        name: "",
        brandId: "",
        typeId: "",
        newType: "",
        quantity: 0,
        unitPrice: 0,
        newBrand: "",
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-96 p-8 bg-white dark:bg-slate-900 shadow-xl rounded-lg relative  overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold mb-4">Add Product</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              placeholder="Biscuit"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 bg-white dark:bg-slate-600 dark:text-slate-50 rounded px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Brand</label>
            <select
              name="brandId"
              value={formData.brandId}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-white dark:bg-slate-600 dark:text-slate-50 rounded px-3 py-2"
            >
              <option value="">Select a Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <h1 className="flex justify-center font-semibold text-slate-500 my-2">
              OR
            </h1>
            <input
              type="text"
              name="newBrand"
              placeholder="Enter a new brand"
              value={formData.newBrand}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2  bg-white dark:bg-slate-600 dark:text-slate-50"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Type</label>
            <select
              name="typeId"
              value={formData.typeId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2  bg-white dark:bg-slate-600 dark:text-slate-50"
            >
              <option value="">Select a Type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <h1 className="flex justify-center font-semibold text-slate-500 my-2">
              OR
            </h1>
            <input
              type="text"
              name="newType"
              placeholder="Enter a new type"
              value={formData.newType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2  bg-white dark:bg-slate-600 dark:text-slate-50"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              min={0}
              value={formData.quantity}
              onChange={handleChange}
              required
              placeholder="10"
              step={5}
              className="w-full border border-gray-300 rounded px-3 py-2  bg-white dark:bg-slate-600 dark:text-slate-50"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Unit Price</label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              required
              min={0}
              step={5}
              placeholder="10"
              className="w-full border border-gray-300 rounded px-3 py-2  bg-white dark:bg-slate-600 dark:text-slate-50"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
