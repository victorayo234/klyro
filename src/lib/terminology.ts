export interface TerminologyConfig {
  productsLabel: string;
  singleProductLabel: string;
  customersLabel: string;
  singleCustomerLabel: string;
  salesLabel: string;
  singleSaleLabel: string;
  inventoryLabel: string;
  stockThresholdLabel: string;
}

const DEFAULT_TERMINOLOGY: TerminologyConfig = {
  productsLabel: "Products",
  singleProductLabel: "Product",
  customersLabel: "Customers",
  singleCustomerLabel: "Customer",
  salesLabel: "Sales",
  singleSaleLabel: "Sale",
  inventoryLabel: "Inventory",
  stockThresholdLabel: "Reorder Threshold",
};

export function getTerminology(industry?: string | null): TerminologyConfig {
  if (!industry) return DEFAULT_TERMINOLOGY;
  const ind = industry.toLowerCase();

  // Restaurant & Food Service / Hospitality
  if (ind.includes("restaurant") || ind.includes("food") || ind.includes("hospitality")) {
    return {
      productsLabel: "Menu & Items",
      singleProductLabel: "Menu Item",
      customersLabel: "Guests & Accounts",
      singleCustomerLabel: "Guest",
      salesLabel: "Orders & Receipts",
      singleSaleLabel: "Order",
      inventoryLabel: "Kitchen Stock",
      stockThresholdLabel: "Low Stock Alert",
    };
  }

  // Agency, Consulting, Legal, Professional Services
  if (
    ind.includes("consulting") ||
    ind.includes("agency") ||
    ind.includes("professional") ||
    ind.includes("legal")
  ) {
    return {
      productsLabel: "Services & Retainers",
      singleProductLabel: "Service",
      customersLabel: "Clients",
      singleCustomerLabel: "Client",
      salesLabel: "Contracts & Engagements",
      singleSaleLabel: "Contract",
      inventoryLabel: "Service Catalog",
      stockThresholdLabel: "Capacity Alert",
    };
  }

  // Healthcare, Medical, Clinic, Wellness
  if (ind.includes("health") || ind.includes("medical") || ind.includes("wellness") || ind.includes("clinic")) {
    return {
      productsLabel: "Treatments & Supplies",
      singleProductLabel: "Treatment",
      customersLabel: "Patients & Clients",
      singleCustomerLabel: "Patient",
      salesLabel: "Consultations & Billing",
      singleSaleLabel: "Consultation",
      inventoryLabel: "Medical Supplies",
      stockThresholdLabel: "Restock Minimum",
    };
  }

  // Manufacturing, Wholesale, Distribution
  if (ind.includes("manufacturing") || ind.includes("wholesale") || ind.includes("distribution") || ind.includes("production")) {
    return {
      productsLabel: "SKUs & Materials",
      singleProductLabel: "SKU",
      customersLabel: "Distributors & Buyers",
      singleCustomerLabel: "Buyer",
      salesLabel: "Shipments & Orders",
      singleSaleLabel: "Shipment",
      inventoryLabel: "Warehouse Inventory",
      stockThresholdLabel: "Reorder Level",
    };
  }

  // Retail & E-commerce
  if (ind.includes("retail") || ind.includes("ecommerce") || ind.includes("commerce") || ind.includes("fashion")) {
    return {
      productsLabel: "Products & SKUs",
      singleProductLabel: "Product",
      customersLabel: "Shoppers & Customers",
      singleCustomerLabel: "Customer",
      salesLabel: "Sales & Orders",
      singleSaleLabel: "Sale",
      inventoryLabel: "Merchandise Stock",
      stockThresholdLabel: "Reorder Threshold",
    };
  }

  // Technology & Software (SaaS, IT Services)
  if (ind.includes("software") || ind.includes("saas") || ind.includes("tech") || ind.includes("cloud")) {
    return {
      productsLabel: "Plans & Add-ons",
      singleProductLabel: "Plan",
      customersLabel: "Subscribers & Accounts",
      singleCustomerLabel: "Account",
      salesLabel: "Subscriptions & Deals",
      singleSaleLabel: "Deal",
      inventoryLabel: "Product Catalog",
      stockThresholdLabel: "License Limit",
    };
  }

  return DEFAULT_TERMINOLOGY;
}
