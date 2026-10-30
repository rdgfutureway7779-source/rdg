export type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

export type CustomerCartItem = {
  cartItemId: number;
  productId: number;
  quantity: number;
  name: string;
  slug: string;
  category?: string | null;
  subtitle?: string | null;
  description?: string | null;
  highlights: string[];
  price?: number | null;
  imageUrl?: string | null;
};

export function getCustomerCartLineTotal(
  item: Pick<CustomerCartItem, "name" | "price" | "quantity">,
) {
  const quantity = Number(item.quantity);
  if (item.name === "Anmol Ratan Juice" && quantity >= 5 && quantity % 5 === 0) {
    return quantity * 700;
  }
  const unitPrice = item.price ?? (item.name === "Anmol Ratan Juice" ? 1200 : 0);
  return Number(unitPrice) * quantity;
}

export const customerCartSyncKey = "rdg-customer-cart-sync";

export function broadcastCustomerCartChange(productId: number, quantity: number | null) {
  try {
    localStorage.setItem(
      customerCartSyncKey,
      JSON.stringify({ productId, quantity, changedAt: Date.now() }),
    );
  } catch {
    // Storage can be unavailable in private browsing; the current page still updates normally.
  }
}

export type CustomerOrderSummary = {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingCity: string;
  shippingState: string;
  createdAt: string;
  itemCount: number;
};

export type CustomerOrder = CustomerOrderSummary & {
  paymentMethod: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingPostalCode: string;
  shippingCountry: string;
  customerNote?: string | null;
  updatedAt: string;
  items: {
    productId: number;
    productName: string;
    productSlug?: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
};

async function customerApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { credentials: "include", ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.error || "Request failed.");
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return payload.data as T;
}

export async function getCustomerMe(): Promise<Customer | null> {
  try {
    const data = await customerApi<{ customer: Customer }>("/api/customer/auth/me");
    return data.customer;
  } catch {
    return null;
  }
}

export async function loginCustomer(email: string, password: string) {
  const data = await customerApi<{ customer: Customer }>("/api/customer/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return data.customer;
}

export async function registerCustomer(payload: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const data = await customerApi<{ customer: Customer }>("/api/customer/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.customer;
}

export async function logoutCustomer() {
  await customerApi("/api/customer/auth/logout", { method: "POST" });
}

export async function changeCustomerPassword(currentPassword: string, newPassword: string) {
  await customerApi("/api/customer/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getCustomerCart() {
  return customerApi<CustomerCartItem[]>("/api/customer/cart");
}

export async function addToCustomerCart(productId: number, quantity = 1) {
  return customerApi<CustomerCartItem[]>("/api/customer/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCustomerCart(productId: number, quantity: number) {
  return customerApi<CustomerCartItem[]>(`/api/customer/cart/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCustomerCart(productId: number) {
  return customerApi<CustomerCartItem[]>(`/api/customer/cart/${productId}`, {
    method: "DELETE",
  });
}

export async function createCustomerOrder(payload: {
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry?: string;
  customerNote?: string;
  paymentMethod?: "cash_on_delivery";
}) {
  const data = await customerApi<{ order: CustomerOrderSummary }>("/api/customer/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.order;
}

export type CustomerPaymentOrder = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  shippingFee: number;
  total: number;
};

export async function createCustomerPaymentOrder() {
  const data = await customerApi<CustomerPaymentOrder>("/api/customer/payments/order", {
    method: "POST",
  });
  return data;
}

export async function verifyCustomerPayment(payload: {
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry?: string;
  customerNote?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const data = await customerApi<{ order: CustomerOrderSummary }>("/api/customer/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return data.order;
}

export async function getCustomerOrders() {
  return customerApi<CustomerOrderSummary[]>("/api/customer/orders");
}

export async function getCustomerOrder(id: number) {
  return customerApi<CustomerOrder>(`/api/customer/orders/${id}`);
}
