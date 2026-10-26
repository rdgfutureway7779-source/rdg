import leadershipMeet from "@/assets/gallery/leadership-meet.jpg";
import headOffice from "@/assets/gallery/head-office.jpg";
import productLaunch from "@/assets/gallery/product-launch.jpg";
import trainingCamp from "@/assets/gallery/training-camp.jpg";
import manufacturing from "@/assets/gallery/manufacturing.jpg";

const dubaiTour = leadershipMeet;

export const galleryItems = [
  {
    title: "Annual Leadership Meet",
    tag: "Events",
    image: leadershipMeet,
    alt: "Illustration of a speaker addressing an Indian business conference.",
  },
  {
    title: "Corporate Head Office",
    tag: "Office",
    image: headOffice,
    alt: "Illustrative modern office reception with glass meeting rooms and plants.",
  },
  {
    title: "Product Launch Stage",
    tag: "Events",
    image: productLaunch,
    alt: "Illustration of presenters unveiling a wellness drink on a blue and gold stage.",
  },
  {
    title: "Distributor Training Camp",
    tag: "Training",
    image: trainingCamp,
    alt: "Illustration of a facilitator leading a small distributor training workshop.",
  },
  {
    title: "Manufacturing Facility",
    tag: "Office",
    image: manufacturing,
    alt: "Illustrative beverage bottling line with stainless steel equipment and workers.",
  },
  {
    title: "Foreign Tour — Dubai",
    tag: "Rewards",
    image: dubaiTour,
    alt: "Illustration of colleagues enjoying a group trip beside Dubai Marina.",
  },
] as const;
