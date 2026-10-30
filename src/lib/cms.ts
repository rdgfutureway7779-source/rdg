export type PublicCmsConfig = {
  settings: Record<string, string>;
  banners: {
    title: string;
    description?: string | null;
    ctaLabel?: string | null;
    ctaUrl?: string | null;
    imageUrl?: string | null;
    altText?: string | null;
  }[];
};

export type PublicDownload = {
  id: number | string;
  slug: string;
  title: string;
  description?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  sizeBytes?: number | null;
  sizeLabel?: string | null;
};

export type PublicEvent = {
  id: number | string;
  slug: string;
  title: string;
  description?: string | null;
  eventDate: string;
  city: string;
  eventType: string;
  seats: number;
  registrationUrl?: string | null;
};

export type PublicProduct = {
  id: number | string;
  name: string;
  slug: string;
  category?: string | null;
  subtitle?: string | null;
  description?: string | null;
  highlights: string[];
  price?: number | null;
  dpPrice?: number | null;
  netContent?: string | null;
  stockQuantity?: number | null;
  isServiceable?: boolean;
  imageUrl?: string | null;
};

export type PublicBlogPost = {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  date: string;
  read: number;
};

export async function getPublicCmsConfig(): Promise<PublicCmsConfig | null> {
  try {
    const response = await fetch("/api/public/site-config");
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.success ? payload.data : null;
  } catch {
    return null;
  }
}

export async function getPublicDownloads(): Promise<PublicDownload[] | null> {
  try {
    const response = await fetch("/api/public/downloads");
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.success ? payload.data : null;
  } catch {
    return null;
  }
}

export async function getPublicEvents(): Promise<PublicEvent[] | null> {
  try {
    const response = await fetch("/api/public/events");
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.success ? payload.data : null;
  } catch {
    return null;
  }
}

export async function getPublicProducts(): Promise<PublicProduct[] | null> {
  try {
    const response = await fetch("/api/public/products");
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.success ? payload.data : null;
  } catch {
    return null;
  }
}

export async function getPublicBlogPosts(): Promise<PublicBlogPost[] | null> {
  try {
    const response = await fetch("/api/public/blog-posts");
    if (!response.ok) return null;
    const payload = await response.json();
    return payload.success ? payload.data : null;
  } catch {
    return null;
  }
}
