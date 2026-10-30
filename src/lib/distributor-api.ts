export type Distributor = {
  id: number;
  accountId: number;
  username: string;
  distributorCode: string;
  sponsorId?: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  sponsorCode?: string | null;
  status: string;
  membershipAmount?: number;
  membershipStatus?: string;
  membershipCurrentStatus?: string;
  membershipPaymentStatus?: string;
  membershipStartsAt?: string | null;
  membershipExpiresAt?: string | null;
};

export type DistributorNetworkMember = Distributor & {
  networkLevel: number;
  networkPath: string;
  totalIds: number;
  completedLevel: number;
  nextLevel?: number | null;
  remainingIds?: number;
};

export type DistributorNetwork = {
  root: Distributor;
  network: DistributorNetworkMember[];
  summary: {
    totalMembers: number;
    directMembers: number;
    deepestLevel: number;
    byLevel: Record<string, number>;
  };
};

async function distributorApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { credentials: "include", ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.error || "Request failed.");
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return payload.data as T;
}

export async function getDistributorMe(): Promise<Distributor | null> {
  try {
    const data = await distributorApi<{ distributor: Distributor }>("/api/distributor/auth/me");
    return data.distributor;
  } catch {
    return null;
  }
}

export async function registerDistributor(payload: {
  name: string;
  username: string;
  email: string;
  phone: string;
  city: string;
  sponsorCode?: string;
  packageValue: number;
  password: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}) {
  const data = await distributorApi<{ distributor: Distributor }>(
    "/api/distributor/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return data.distributor;
}

export type DistributorPaymentOrder = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  packageValue: number;
};

export async function createDistributorPaymentOrder(packageValue: number) {
  const data = await distributorApi<DistributorPaymentOrder>("/api/distributor/payments/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packageValue }),
  });
  return data;
}

export async function loginDistributor(username: string, password: string) {
  const data = await distributorApi<{ distributor: Distributor }>("/api/distributor/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return data.distributor;
}

export async function resetDistributorPassword(identifier: string, newPassword: string) {
  await distributorApi("/api/distributor/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, newPassword }),
  });
}

export async function logoutDistributor() {
  await distributorApi("/api/distributor/auth/logout", { method: "POST" });
}

export async function changeDistributorPassword(currentPassword: string, newPassword: string) {
  await distributorApi("/api/distributor/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getDistributorNetwork() {
  return distributorApi<DistributorNetwork>("/api/distributor/network");
}
