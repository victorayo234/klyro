"use client";

import * as React from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import {
  Package,
  Search,
  Plus,
  Download,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Trash2,
  Edit2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Product } from "@/types/database";
import {
  getProducts,
  createProduct,
  adjustStock,
  deleteProduct,
} from "@/lib/actions/products";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterView, setFilterView] = React.useState<"all" | "low_stock">("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);

  // Add/Edit Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [formSku, setFormSku] = React.useState("");
  const [formCategory, setFormCategory] = React.useState("Office Furniture");
  const [formCostPrice, setFormCostPrice] = React.useState<number>(100);
  const [formSalePrice, setFormSalePrice] = React.useState<number>(199);
  const [formQuantity, setFormQuantity] = React.useState<number>(10);
  const [formThreshold, setFormThreshold] = React.useState<number>(5);
  const [formDescription, setFormDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Quick Stock Adjustment Modal
  const [isStockModalOpen, setIsStockModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [adjustmentQty, setAdjustmentQty] = React.useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = React.useState("Received shipment");

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setFormName("");
    setFormSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategory("Office Furniture");
    setFormCostPrice(50);
    setFormSalePrice(99);
    setFormQuantity(15);
    setFormThreshold(5);
    setFormDescription("");
    setIsProductModalOpen(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createProduct({
        name: formName,
        sku: formSku,
        category: formCategory,
        cost_price: Number(formCostPrice),
        sale_price: Number(formSalePrice),
        quantity: Number(formQuantity),
        reorder_threshold: Number(formThreshold),
        description: formDescription,
      });
      toast.success("Product created in catalog");
      setIsProductModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create product";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStockModal = (prod: Product) => {
    setSelectedProduct(prod);
    setAdjustmentQty(prod.quantity);
    setAdjustmentReason("Inventory recount / audit");
    setIsStockModalOpen(true);
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await adjustStock(selectedProduct.id, adjustmentQty, adjustmentReason);
      toast.success(`Updated stock for ${selectedProduct.name}`);
      setIsStockModalOpen(false);
      loadData();
    } catch {
      toast.error("Failed to update stock");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from inventory?`)) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      loadData();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  // CSV Export via PapaParse
  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.error("No inventory data to export.");
      return;
    }

    const csvData = products.map((p) => ({
      ID: p.id,
      Name: p.name,
      SKU: p.sku,
      Category: p.category,
      Quantity: p.quantity,
      ReorderThreshold: p.reorder_threshold,
      CostPrice: p.cost_price,
      SalePrice: p.sale_price,
      GrossMargin: ((p.sale_price - p.cost_price) / p.sale_price * 100).toFixed(1) + "%",
      Status: p.quantity <= p.reorder_threshold ? "LOW STOCK" : "IN STOCK",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `klyro-inventory-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Inventory catalog exported to CSV");
  };

  const lowStockCount = products.filter((p) => p.quantity <= p.reorder_threshold).length;

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLowStock = filterView === "low_stock" ? p.quantity <= p.reorder_threshold : true;
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

    return matchesSearch && matchesLowStock && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Inventory & Products
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time stock depletion tracking, SKU catalog, and low-threshold alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={openCreateModal} className="gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product title or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Low Stock Filter Pill */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterView("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterView === "all"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setFilterView("low_stock")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                filterView === "low_stock"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              Low Stock ({lowStockCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {filteredProducts.length === 0 ? (
          <EmptyState
            type="inventory"
            title="No inventory items found"
            description="Add products to your catalog to track stock counts and receive automatic low-stock notifications."
            actionLabel="Add Product"
            onAction={openCreateModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3.5">Product Name & Details</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Stock Level</th>
                  <th className="px-6 py-3.5">Sale Price</th>
                  <th className="px-6 py-3.5">Margin</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProducts.map((prod) => {
                  const isLow = prod.quantity <= prod.reorder_threshold;
                  const marginPercent =
                    prod.sale_price > 0
                      ? (((prod.sale_price - prod.cost_price) / prod.sale_price) * 100).toFixed(0)
                      : "0";

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                          {prod.name}
                        </span>
                        {prod.description && (
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {prod.description}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">{prod.sku}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                          {prod.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold font-mono text-sm ${
                              isLow ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {prod.quantity}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (Min: {prod.reorder_threshold})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 font-mono">
                        {formatCurrency(prod.sale_price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-600 font-semibold">{marginPercent}%</span>
                      </td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <Badge variant="warning" className="gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openStockModal(prod)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Adjust Stock Quantity"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Product */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Add Product to Catalog"
        description="Configure pricing, SKU code, and minimum reorder alert threshold"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            label="Product Title"
            placeholder="e.g. Ergonomic Office Desk Stand"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              placeholder="FUR-DSK-001"
              required
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="Office Furniture">Office Furniture</option>
                <option value="Hardware & Tech">Hardware & Tech</option>
                <option value="Acoustics & Partition">Acoustics & Partition</option>
                <option value="Lighting & Power">Lighting & Power</option>
                <option value="General Supplies">General Supplies</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cost Price ($)"
              type="number"
              step="0.01"
              required
              value={formCostPrice}
              onChange={(e) => setFormCostPrice(Number(e.target.value))}
            />
            <Input
              label="Sale / Retail Price ($)"
              type="number"
              step="0.01"
              required
              value={formSalePrice}
              onChange={(e) => setFormSalePrice(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Initial Quantity"
              type="number"
              required
              value={formQuantity}
              onChange={(e) => setFormQuantity(Number(e.target.value))}
            />
            <Input
              label="Reorder Alert Threshold"
              type="number"
              required
              value={formThreshold}
              onChange={(e) => setFormThreshold(Number(e.target.value))}
            />
          </div>

          <Input
            label="Product Description"
            placeholder="Specs, dimensions, or supplier notes..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Add Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Quick Stock Adjustment */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title="Adjust Inventory Stock"
        description={selectedProduct ? `Updating inventory for ${selectedProduct.name}` : ""}
      >
        <form onSubmit={handleStockAdjustment} className="space-y-4">
          <Input
            label="New Current Quantity"
            type="number"
            required
            value={adjustmentQty}
            onChange={(e) => setAdjustmentQty(Number(e.target.value))}
          />

          <Input
            label="Reason for Adjustment"
            placeholder="e.g. Supplier delivery, damaged goods, physical count"
            required
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
