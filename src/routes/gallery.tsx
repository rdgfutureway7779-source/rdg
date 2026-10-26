import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Expand, PlayCircle, Video } from "lucide-react";
import galleryBreadcrumbImage from "@/assets/gallery-breadcrumb.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { galleryItems } from "@/data/gallery";

type GalleryItem = { title: string; tag: string; image: string; alt: string };

const videoItems = [
  "rdg-video-01.mp4",
  "rdg-video-02.mp4",
  "rdg-video-03.mp4",
  "rdg-video-04.mp4",
  "rdg-video-05.mp4",
  "rdg-video-06.mp4",
  "rdg-video-07.mp4",
];

function uniqueGalleryItems(items: GalleryItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.image.trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function Gallery() {
  const [tag, setTag] = useState("All");
  const reduceMotion = useReducedMotion();
  const [items, setItems] = useState<GalleryItem[]>(() => uniqueGalleryItems([...galleryItems]));
  useEffect(() => {
    fetch("/api/public/gallery")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.success && payload.data?.length) {
          setItems(
            uniqueGalleryItems(
              payload.data.map(
                (item: { title: string; tag: string; imageUrl: string; altText?: string }) => ({
                  title: item.title,
                  tag: item.tag,
                  image: item.imageUrl,
                  alt: item.altText || item.title,
                }),
              ),
            ),
          );
        }
      })
      .catch(() => undefined);
  }, []);
  const tags = ["All", ...Array.from(new Set(items.map((item) => item.tag)))];
  const filteredItems = items.filter((g) => tag === "All" || g.tag === tag);

  return (
    <>
      <section className="relative w-full overflow-hidden bg-white sm:h-[clamp(390px,29vw,560px)]">
        <img
          src={galleryBreadcrumbImage}
          alt="Media Gallery"
          width={2048}
          height={760}
          className="block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:object-center"
        />
      </section>

      <section className="py-16">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div
              role="group"
              aria-label="Filter gallery by category"
              className="flex flex-wrap gap-2"
            >
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tag === t}
                  onClick={() => setTag(t)}
                  className={
                    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 " +
                    (tag === t
                      ? "bg-brand rounded-full px-4 py-2 text-xs font-semibold text-primary-foreground"
                      : "rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {filteredItems.length} {filteredItems.length === 1 ? "photo" : "photos"}
            </p>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            AI-generated sample images for illustration. Select a photo to view it in full.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, i) => (
              <Dialog key={item.title}>
                <DialogTrigger asChild>
                  <motion.button
                    type="button"
                    aria-label={"View " + item.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 6) * 0.05 }}
                    className="card-lift group block h-full w-full overflow-hidden rounded-3xl border border-border bg-card text-left shadow-soft focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
                  >
                    <div className="relative h-60 overflow-hidden bg-muted">
                      <img
                        src={item.image}
                        alt={item.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                      />
                      <span
                        className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary-dark/75 text-white shadow-soft backdrop-blur-sm"
                        aria-hidden="true"
                      >
                        <Expand className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="font-display text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.tag}</p>
                    </div>
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl gap-0 overflow-y-auto rounded-3xl border-0 p-0 sm:rounded-3xl [&>button]:flex [&>button]:h-10 [&>button]:w-10 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white [&>button]:text-primary-dark [&>button]:opacity-100 [&>button]:shadow-card">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="max-h-[70dvh] w-full bg-primary-dark object-contain"
                  />
                  <div className="p-5 sm:p-6">
                    <DialogTitle className="font-display">{item.title}</DialogTitle>
                    <DialogDescription className="mt-2">
                      {item.tag} - AI-generated sample image
                    </DialogDescription>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          <div className="mt-20 border-t border-border pt-12">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                  <Video className="h-4 w-4" /> RDG videos
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
                  Watch the RDG community in motion
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Product, community and business videos shared by RDG Future Way.
                </p>
              </div>
              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-soft">
                {videoItems.length} videos
              </span>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videoItems.map((video, index) => (
                <article
                  key={video}
                  className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="relative bg-primary-dark">
                    <video
                      controls
                      preload="metadata"
                      playsInline
                      aria-label={`RDG video ${index + 1}`}
                      className="aspect-video w-full object-contain"
                    >
                      <source src={`/videos/${video}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <span className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-primary-dark/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                      <PlayCircle className="h-3.5 w-3.5" /> Video{" "}
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      RDG Video {String(index + 1).padStart(2, "0")}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      RDG Future Way media upload.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Gallery;
