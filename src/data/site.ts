import agricultureGardenImage from "@/assets/optimized/catalog-mobile/agriculture-garden.webp";
import ayurvedicHerbalImage from "@/assets/optimized/catalog-mobile/ayurvedic-herbal.webp";
import beautyHealthGroceryImage from "@/assets/optimized/catalog-mobile/beauty-health-grocery.webp";
import booksImage from "@/assets/optimized/catalog-mobile/books.webp";
import carIndustrialImage from "@/assets/optimized/catalog-mobile/car-industrial.webp";
import footwearImage from "@/assets/optimized/catalog-mobile/footwear.webp";
import homeKitchenPetsImage from "@/assets/optimized/catalog-mobile/home-kitchen-pets.webp";
import menFashionImage from "@/assets/optimized/catalog-mobile/mens-fashion.webp";
import mobilesComputersImage from "@/assets/optimized/catalog-mobile/mobiles-computers.webp";
import moviesMusicImage from "@/assets/optimized/catalog-mobile/movies-music.webp";
import personalCareImage from "@/assets/optimized/catalog-mobile/personal-care.webp";
import sportsFitnessImage from "@/assets/optimized/catalog-mobile/sports-fitness.webp";
import toysKidsImage from "@/assets/optimized/catalog-mobile/toys-kids.webp";
import tvElectronicsImage from "@/assets/optimized/catalog-mobile/tv-electronics.webp";
import wellnessNutritionImage from "@/assets/optimized/catalog-mobile/wellness-nutrition.webp";
import womensFashionImage from "@/assets/optimized/catalog-mobile/womens-fashion.webp";

export const company = {
  name: "RDG Future Way Pvt. Ltd.",
  short: "RDG Future Way",
  tagline: "Empowering Every Family Through Quality Products & Business Opportunities",
  phone: "+91 73979 67779",
  secondaryPhone: "+91 79729 73775",
  email: "rdgfutureway7779@gmail.com",
  website: "rdgfutureway.com",
  address: "RDG Future Way Pvt. Ltd. • 20°18′14.0″N, 75°39′00.3″E, India",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3741.912430736575!2d75.64750937523705!3d20.303891481170155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjDCsDE4JzE0LjAiTiA3NcKwMzknMDAuMyJF!5e0!3m2!1sen!2sin!4v1791863665730!5m2!1sen!2sin",
  branches: ["Bhopal", "Jaipur", "Lucknow", "Nagpur", "Patna"],
};

export type NavItem = {
  label: string;
  to: string;
  children?: { label: string; to: string; desc?: string }[];
};

export const navigation: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "Company",
    to: "/about",
    children: [
      { label: "About Us", to: "/about", desc: "Our story, vision & mission" },
      { label: "Success Stories", to: "/success-stories", desc: "Leaders who built their future" },
      { label: "Events", to: "/events", desc: "Seminars & product launches" },
      { label: "Gallery", to: "/gallery", desc: "Photos from the field" },
      { label: "Career", to: "/career", desc: "Work with us" },
    ],
  },
  {
    label: "Products",
    to: "/products",
  },
  {
    label: "Opportunity",
    to: "/business-opportunity",
    children: [
      {
        label: "Business Opportunity",
        to: "/business-opportunity",
        desc: "How direct selling works",
      },
      { label: "Generation Plan", to: "/generation-plan", desc: "Income levels & bonuses" },
      { label: "Income Calculator", to: "/income-calculator", desc: "Estimate your earnings" },
      { label: "Become a Distributor", to: "/become-distributor", desc: "Join in minutes" },
      { label: "Franchise Opportunity", to: "/franchise", desc: "Explore local franchise options" },
    ],
  },
  {
    label: "Resources",
    to: "/downloads",
    children: [
      { label: "Downloads", to: "/downloads", desc: "Brochures, catalogue, forms" },
      { label: "Blog", to: "/blog", desc: "Health, business & lifestyle" },
      { label: "FAQs", to: "/faqs", desc: "Everything you asked" },
    ],
  },
  { label: "Contact", to: "/contact" },
];

export const stats = [
  { value: 50000, suffix: "+", label: "Happy Customers" },
  { value: 5000, suffix: "+", label: "Active Distributors" },
  { value: 1, suffix: "", label: "Signature Product" },
  { value: 25, suffix: "+", label: "Cities Served" },
];

export type Product = {
  id: string;
  slug?: string;
  name: string;
  category: string;
  subtitle: string;
  description: string;
  highlights: string[];
  badge?: string;
  price?: number | null;
  dpPrice?: number | null;
  stockQuantity?: number | null;
  isServiceable?: boolean;
  imageUrl?: string | null;
};

export const catalogImageByCategory: Record<string, string> = {
  "Mobiles & Computers": mobilesComputersImage,
  "TV, Appliances & Electronics": tvElectronicsImage,
  "Men's Fashion": menFashionImage,
  "Women's Fashion": womensFashionImage,
  Footwear: footwearImage,
  "Toys, Baby Products & Kids' Fashion": toysKidsImage,
  "Car, Motorbike & Industrial": carIndustrialImage,
  Books: booksImage,
  "Movies, Music & Video Games": moviesMusicImage,
  "Ayurvedic & Herbal": ayurvedicHerbalImage,
  "Wellness & Nutrition": wellnessNutritionImage,
  "Personal Care": personalCareImage,
  "Home, Kitchen & Pets": homeKitchenPetsImage,
  "Beauty, Health & Grocery": beautyHealthGroceryImage,
  "Sports, Fitness, Bags & Luggage": sportsFitnessImage,
  "Agriculture & Garden": agricultureGardenImage,
};

export function getCatalogImageForCategory(category?: string | null) {
  if (!category) return null;
  return catalogImageByCategory[category.trim()] || null;
}

export const catalogDemoProducts: Product[] = [
  {
    id: "demo-mobiles-computers",
    slug: "demo-mobiles-computers",
    name: "Smart Fitness Band",
    category: "Mobiles & Computers",
    subtitle: "Step tracking, heart-rate monitoring, sleep insights and daily activity reminders.",
    description:
      "A market-style demo listing for a lightweight fitness band with a colour display and everyday activity tracking.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Popular demo",
    price: 2499,
  },
  {
    id: "demo-tv-appliances-electronics",
    slug: "demo-tv-appliances-electronics",
    name: "Smart LED TV 43-inch",
    category: "TV, Appliances & Electronics",
    subtitle:
      "Full HD smart television with streaming apps, built-in speakers and screen mirroring.",
    description:
      "A market-style demo listing for a family entertainment television with smart connectivity.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "New demo",
    price: 28999,
  },
  {
    id: "demo-mens-fashion",
    slug: "demo-mens-fashion",
    name: "Men's Active Dry-Fit T-Shirt",
    category: "Men's Fashion",
    subtitle:
      "Breathable quick-dry training T-shirt for gym sessions, running and everyday movement.",
    description: "A market-style demo listing for a comfortable men's performance T-shirt.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Bestseller demo",
    price: 899,
  },
  {
    id: "demo-womens-fashion",
    slug: "demo-womens-fashion",
    name: "Women's Cotton Kurta Set",
    category: "Women's Fashion",
    subtitle:
      "Soft cotton kurta set with a comfortable fit for workdays, errands and casual occasions.",
    description: "A market-style demo listing for an everyday women's cotton outfit.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Trending demo",
    price: 1499,
  },
  {
    id: "demo-footwear",
    slug: "demo-footwear",
    name: "Everyday Comfort Sneakers",
    category: "Footwear",
    subtitle: "Lightweight everyday sneakers designed for comfortable walking and active routines.",
    description:
      "A market-style demo listing for versatile everyday sneakers with cushioned support.",
    highlights: ["Demo product", "₹1,999 sample price", "Category placeholder"],
    badge: "Footwear demo",
    price: 1999,
  },
  {
    id: "demo-toys-baby-kids",
    slug: "demo-toys-baby-kids",
    name: "STEM Building Blocks Set",
    category: "Toys, Baby Products & Kids' Fashion",
    subtitle: "Colourful construction blocks designed for creative play and early problem solving.",
    description: "A market-style demo listing for an educational building set for children.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Kids demo",
    price: 799,
  },
  {
    id: "demo-car-motorbike-industrial",
    slug: "demo-car-motorbike-industrial",
    name: "Magnetic Car Phone Holder",
    category: "Car, Motorbike & Industrial",
    subtitle:
      "Dashboard-mounted mobile holder with one-hand fitting for daily commutes and road trips.",
    description: "A market-style demo listing for a compact vehicle phone-mount accessory.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Auto demo",
    price: 699,
  },
  {
    id: "demo-books",
    slug: "demo-books",
    name: "Everyday Wellness Guide",
    category: "Books",
    subtitle:
      "A practical guide to balanced routines, mindful habits and family wellness planning.",
    description: "A market-style demo listing for a personal wellness and lifestyle paperback.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Book demo",
    price: 399,
  },
  {
    id: "demo-movies-music-games",
    slug: "demo-movies-music-games",
    name: "Wireless Headphones",
    category: "Movies, Music & Video Games",
    subtitle:
      "Comfort-fit wireless headphones with deep bass, hands-free calling and long battery life.",
    description: "A market-style demo listing for everyday music, podcasts and entertainment.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Audio demo",
    price: 1799,
  },
  {
    id: "demo-ayurvedic-herbal",
    slug: "demo-ayurvedic-herbal",
    name: "Herbal Immunity Care Kit",
    category: "Ayurvedic & Herbal",
    subtitle: "A curated herbal care bundle for everyday family wellness routines.",
    description: "A market-style demo listing for an ayurvedic-inspired herbal wellness bundle.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Wellness demo",
    price: 1299,
  },
  {
    id: "demo-wellness-nutrition",
    slug: "demo-wellness-nutrition",
    name: "Daily Protein Nutrition Mix",
    category: "Wellness & Nutrition",
    subtitle:
      "A convenient nutrition mix for smoothies, breakfast bowls and post-workout routines.",
    description:
      "A market-style demo listing for a daily nutrition supplement with a family-friendly format.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Nutrition demo",
    price: 1599,
  },
  {
    id: "demo-personal-care",
    slug: "demo-personal-care",
    name: "Herbal Shampoo & Body Wash Set",
    category: "Personal Care",
    subtitle: "Gentle everyday cleansing set with refreshing herbal fragrance and easy family use.",
    description: "A market-style demo listing for a personal-care cleansing duo.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Care demo",
    price: 699,
  },
  {
    id: "demo-home-kitchen-pets",
    slug: "demo-home-kitchen-pets",
    name: "Non-Stick Cookware Starter Set",
    category: "Home, Kitchen & Pets",
    subtitle: "Practical everyday cookware set for quick family meals and compact kitchens.",
    description: "A market-style demo listing for an everyday kitchen cookware starter set.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Home demo",
    price: 2199,
  },
  {
    id: "demo-beauty-health-grocery",
    slug: "demo-beauty-health-grocery",
    name: "Vitamin C Face Care Kit",
    category: "Beauty, Health & Grocery",
    subtitle: "A simple cleanser, serum and moisturiser routine for daily personal care.",
    description: "A market-style demo listing for a compact beauty and self-care routine.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Beauty demo",
    price: 1199,
  },
  {
    id: "demo-sports-fitness-bags",
    slug: "demo-sports-fitness-bags",
    name: "Home Gym Starter Kit",
    category: "Sports, Fitness, Bags & Luggage",
    subtitle: "Resistance bands, skipping rope and training mat for simple home workouts.",
    description: "A market-style demo listing for a compact home fitness starter kit.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Fitness demo",
    price: 1899,
  },
  {
    id: "demo-agriculture-garden",
    slug: "demo-agriculture-garden",
    name: "Organic Plant Growth Kit",
    category: "Agriculture & Garden",
    subtitle: "Seed starter mix, compost support and basic tools for a home kitchen garden.",
    description: "A market-style demo listing for beginner-friendly gardening and plant care.",
    highlights: ["Demo product", "₹1,200 sample price", "Category placeholder"],
    badge: "Garden demo",
    price: 999,
  },
].map((product) => ({
  ...product,
  imageUrl: getCatalogImageForCategory(product.category),
}));

export const products: Product[] = [
  {
    id: "anmol-ratan-juice",
    name: "Anmol Ratan Juice",
    category: "Herbal & Mixed Berry Juice",
    subtitle: "A refreshing herbal wellness drink with a mixed berry blend.",
    description:
      "Anmol Ratan Juice brings together a bright mixed-berry taste and a herbal wellness positioning for everyday family routines. The product label presents it as a natural choice for people who want a simple, fruit-forward drink as part of a balanced lifestyle.",
    highlights: [
      "100% natural positioning shown on the product label",
      "Herbal and mixed berry blend",
      "Rich berry flavour with a refreshing finish",
      "Designed for everyday family wellness routines",
    ],
    badge: "Signature Product",
    price: 1200,
  },
];

export const featuredOfferings = [
  {
    name: "Anmol Ratan Juice",
    category: "Ayurvedic wellness",
    description: "Herbal mixed-berry juice featured in RDG's company material.",
    note: "Natural ingredients • no added sugar • no preservatives",
  },
  {
    name: "Ayurvedic ID Package",
    category: "Business package",
    description: "A 15-level package structure using the published ID × 100 formula.",
    note: "Packages from ₹100 to ₹50,00,000",
  },
  {
    name: "15-Level Award & Reward Plan",
    category: "Recognition",
    description:
      "A recognition ladder featuring welcome kits, apparel, gadgets, vehicles, homes and travel rewards.",
    note: "Eligibility depends on plan terms and performance",
  },
];

export const incomePackages = [
  { level: 1, package: "₹100", network: "₹10,000" },
  { level: 2, package: "₹250", network: "₹25,000" },
  { level: 3, package: "₹500", network: "₹50,000" },
  { level: 4, package: "₹1,000", network: "₹1,00,000" },
  { level: 5, package: "₹2,500", network: "₹2,50,000" },
  { level: 6, package: "₹5,000", network: "₹5,00,000" },
  { level: 7, package: "₹10,000", network: "₹10,00,000" },
  { level: 8, package: "₹25,000", network: "₹25,00,000" },
  { level: 9, package: "₹50,000", network: "₹50,00,000" },
  { level: 10, package: "₹1,00,000", network: "₹1,00,00,000" },
  { level: 11, package: "₹2,50,000", network: "₹2,50,00,000" },
  { level: 12, package: "₹5,00,000", network: "₹5,00,00,000" },
  { level: 13, package: "₹10,00,000", network: "₹10,00,00,000" },
  { level: 14, package: "₹25,00,000", network: "₹25,00,00,000" },
  { level: 15, package: "₹50,00,000", network: "₹50,00,00,000" },
];

export const awardRewards = [
  { level: 1, qualification: "₹10,000", reward: "Certificate + welcome kit" },
  { level: 2, qualification: "₹25,000", reward: "RDG T-shirt + badge" },
  { level: 3, qualification: "₹50,000", reward: "Smart watch" },
  { level: 4, qualification: "₹1,00,000", reward: "Bluetooth earbuds" },
  { level: 5, qualification: "₹2,50,000", reward: "Smartphone" },
  { level: 6, qualification: "₹5,00,000", reward: "LED TV" },
  { level: 7, qualification: "₹10,00,000", reward: "Laptop" },
  { level: 8, qualification: "₹25,00,000", reward: "Bike" },
  { level: 9, qualification: "₹50,00,000", reward: "20 gm gold coin" },
  { level: 10, qualification: "₹1,00,00,000", reward: "Hatchback car" },
  { level: 11, qualification: "₹2,50,00,000", reward: "SUV car" },
  { level: 12, qualification: "₹5,00,00,000", reward: "Luxury car" },
  { level: 13, qualification: "₹10,00,00,000", reward: "2 BHK flat" },
  { level: 14, qualification: "₹25,00,00,000", reward: "Luxury villa" },
  {
    level: 15,
    qualification: "₹50,00,00,000",
    reward: "Dream house + international tour + chairman award",
  },
];

export const planLevels = [
  { level: 1, packageValue: 100, networkValue: 10000, reward: "Certificate + welcome kit" },
  { level: 2, packageValue: 250, networkValue: 25000, reward: "RDG T-shirt + badge" },
  { level: 3, packageValue: 500, networkValue: 50000, reward: "Smart watch" },
  { level: 4, packageValue: 1000, networkValue: 100000, reward: "Bluetooth earbuds" },
  { level: 5, packageValue: 2500, networkValue: 250000, reward: "Smartphone" },
  { level: 6, packageValue: 5000, networkValue: 500000, reward: "LED TV" },
  { level: 7, packageValue: 10000, networkValue: 1000000, reward: "Laptop" },
  { level: 8, packageValue: 25000, networkValue: 2500000, reward: "Bike" },
  { level: 9, packageValue: 50000, networkValue: 5000000, reward: "20 gm gold coin" },
  { level: 10, packageValue: 100000, networkValue: 10000000, reward: "Hatchback car" },
  { level: 11, packageValue: 250000, networkValue: 25000000, reward: "SUV car" },
  { level: 12, packageValue: 500000, networkValue: 50000000, reward: "Luxury car" },
  { level: 13, packageValue: 1000000, networkValue: 100000000, reward: "2 BHK flat" },
  { level: 14, packageValue: 2500000, networkValue: 250000000, reward: "Luxury villa" },
  {
    level: 15,
    packageValue: 5000000,
    networkValue: 500000000,
    reward: "Dream house + international tour + chairman award",
  },
] as const;

export const directReferralPlans = [
  { packageCount: 1, packageValue: 3500 },
  { packageCount: 2, packageValue: 7000 },
  { packageCount: 3, packageValue: 10500 },
  { packageCount: 4, packageValue: 14000 },
] as const;

export const whyChoose = [
  {
    title: "Quality Assurance",
    desc: "GMP, ISO and FSSAI certified manufacturing with batch-level testing.",
  },
  {
    title: "Affordable Pricing",
    desc: "Factory-to-family pricing removes every unnecessary middleman.",
  },
  {
    title: "Direct Company Products",
    desc: "The signature product is presented, supported and dispatched through RDG.",
  },
  {
    title: "Income Opportunity",
    desc: "A transparent generation plan with lifetime repurchase income.",
  },
  { title: "Training Support", desc: "Weekly online and on-ground training in 7 languages." },
  { title: "Fast Delivery", desc: "48–96 hour dispatch to 25+ cities and 400+ pin codes." },
  {
    title: "Customer Satisfaction",
    desc: "A 4.8/5 average rating across 18,000+ verified reviews.",
  },
  { title: "Trusted Brand", desc: "A registered Indian company with full compliance and audits." },
];

export const journey = [
  {
    step: "Join",
    desc: "Register with a valid ID and pay the ₹599 annual distributor membership to start your RDG ID.",
  },
  { step: "Buy Products", desc: "Purchase at distributor price and build product experience." },
  { step: "Refer Members", desc: "Share products and enrol customers you already know." },
  { step: "Build Team", desc: "Duplicate the system across generations of your network." },
  { step: "Earn Income", desc: "Retail profit, performance and matching bonuses each month." },
  { step: "Leadership Rewards", desc: "Royalty, car fund, house fund and foreign tours." },
];

export const bonuses = [
  { name: "Retail Profit", detail: "15–30% margin on every product you sell.", value: "Up to 30%" },
  {
    name: "Performance Bonus",
    detail: "Paid on personal and group performance each month.",
    value: "5% – 25%",
  },
  {
    name: "Generation Bonus",
    detail: "Income across 15 active generations deep.",
    value: "15 Levels",
  },
  {
    name: "2-Year Retirement Benefit",
    detail: "After 2 years of qualification, receive ₹8 lakh per month, including TDS.",
    value: "₹8L / month",
  },
];

export const ranks = [
  {
    rank: "Star",
    qualification: "5,000 network value",
    reward: "Welcome kit + digital certificate",
  },
  { rank: "Silver", qualification: "25,000 network value", reward: "Leadership bonus pool entry" },
  { rank: "Gold", qualification: "1,00,000 network value", reward: "Domestic tour + gadget fund" },
  { rank: "Platinum", qualification: "5,00,000 network value", reward: "Car fund ₹15,000/month" },
  {
    rank: "Diamond",
    qualification: "20,00,000 network value",
    reward: "House fund + foreign tour",
  },
  {
    rank: "Crown",
    qualification: "1,00,00,000 network value",
    reward: "Royalty pool + Hall of Fame",
  },
];

export const testimonials = [
  {
    name: "Sunita Verma",
    role: "Diamond Distributor, Indore",
    quote:
      "I started with a ₹1,200 product order for my family. Four years later my team spans three states and my monthly income replaced my husband's salary.",
    rating: 5,
  },
  {
    name: "Ramesh Patidar",
    role: "Platinum Distributor, Ujjain",
    quote:
      "The agriculture range genuinely improved my soybean yield. Selling what I already trusted made building a team effortless.",
    rating: 5,
  },
  {
    name: "Dr. Neha Sharma",
    role: "Customer, Bhopal",
    quote:
      "I recommend the ayurvedic line to my patients. Consistent quality, honest labelling and prices families can actually sustain.",
    rating: 5,
  },
  {
    name: "Ajay Kushwaha",
    role: "Gold Distributor, Jaipur",
    quote:
      "The training academy taught me digital prospecting. I closed 42 customers in my first 90 days without leaving my town.",
    rating: 4,
  },
];

export const events = [
  {
    title: "National Leadership Summit 2026",
    date: "2026-09-12",
    city: "Indore",
    type: "Seminar",
    seats: 1200,
  },
  {
    title: "Ayurveda Product Launch — Immunity Series",
    date: "2026-08-22",
    city: "Bhopal",
    type: "Launch",
    seats: 400,
  },
  {
    title: "Kisan Samriddhi Business Meet",
    date: "2026-10-05",
    city: "Nagpur",
    type: "Business Meet",
    seats: 600,
  },
  {
    title: "Rewards & Recognition Night",
    date: "2026-11-18",
    city: "Jaipur",
    type: "Award Night",
    seats: 900,
  },
];

export const trainings = [
  {
    title: "Anmol Ratan Product Training",
    desc: "Know the product story, label highlights, usage notes and responsible communication.",
    modules: 14,
  },
  {
    title: "Sales Training",
    desc: "Prospecting, objection handling and closing frameworks.",
    modules: 11,
  },
  {
    title: "Leadership Training",
    desc: "Build, duplicate and retain a productive team.",
    modules: 9,
  },
  {
    title: "Motivation",
    desc: "Habits, goal-setting and mindset sessions with top leaders.",
    modules: 8,
  },
  {
    title: "Digital Marketing",
    desc: "WhatsApp, Instagram and content that converts.",
    modules: 12,
  },
  {
    title: "Compliance",
    desc: "Direct selling guidelines and ethical selling practices.",
    modules: 6,
  },
];

export const posts = [
  {
    slug: "immunity-monsoon",
    title: "7 Ayurvedic Habits That Keep Immunity Strong Through Monsoon",
    category: "Health Tips",
    date: "2026-07-18",
    read: 6,
  },
  {
    slug: "first-90-days",
    title: "Your First 90 Days as an RDG Distributor: A Practical Playbook",
    category: "Business Tips",
    date: "2026-07-04",
    read: 9,
  },
  {
    slug: "soil-health",
    title: "Soil Health 101: Why Organic Inputs Outperform in Year Three",
    category: "Agriculture",
    date: "2026-06-21",
    read: 7,
  },
  {
    slug: "protein-gap",
    title: "The Indian Protein Gap and How to Close It at Home",
    category: "Wellness",
    date: "2026-06-09",
    read: 5,
  },
  {
    slug: "family-budget",
    title: "Cutting a Family Grocery Bill by 18% With Direct Purchase",
    category: "Lifestyle",
    date: "2026-05-27",
    read: 4,
  },
  {
    slug: "rdg-expansion",
    title: "RDG Future Way Expands to 25 Cities With New Logistics Hub",
    category: "Latest News",
    date: "2026-05-12",
    read: 3,
  },
];

export const downloads = [
  { title: "Company Brochure", size: "4.2 MB", type: "PDF" },
  { title: "Anmol Ratan Juice Product Sheet", size: "12.8 MB", type: "PDF" },
  { title: "Generation Income Plan", size: "3.1 MB", type: "PDF" },
  { title: "Distributor Application Form", size: "0.6 MB", type: "PDF" },
  { title: "Price List (DP / MRP)", size: "1.9 MB", type: "XLSX" },
  { title: "Business Presentation", size: "9.4 MB", type: "PPTX" },
  { title: "Training Material Pack", size: "22.5 MB", type: "ZIP" },
];

export const faqs = [
  {
    q: "What is the annual distributor subscription fee?",
    a: "The distributor membership is ₹599 per year and renews annually. You can also purchase the product package you actually want, starting from ₹1,200. There is no separate franchise or security fee.",
  },
  {
    q: "How is the Generation Plan different from a binary plan?",
    a: "Income flows through active generations of your network rather than balanced legs, so a strong single leg is rewarded instead of being capped.",
  },
  {
    q: "When are payouts released?",
    a: "Bonus cycles close on the last day of each month and payouts are credited to your registered bank account by the 10th of the following month.",
  },
  {
    q: "Are the products certified?",
    a: "Yes. Manufacturing units are GMP and ISO certified, food products carry FSSAI licences, and every batch is tested before dispatch.",
  },
  {
    q: "Can I return a product?",
    a: "Unopened products can be returned within 30 days of delivery for a full refund as per our refund policy.",
  },
  {
    q: "Do I need prior sales experience?",
    a: "No. The Training Academy takes you from product basics to leadership with structured modules, live sessions and downloadable material.",
  },
];
