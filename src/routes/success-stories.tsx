import { PlayCircle, Star } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { testimonials } from "@/data/site";
import successStoriesBreadcrumbImage from "@/assets/success-stories-breadcrumb.png";

function SuccessStories() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-white sm:h-[clamp(390px,29vw,560px)]">
        <img
          src={successStoriesBreadcrumbImage}
          alt="Success Stories"
          width={2065}
          height={761}
          className="block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:object-center"
        />
      </section>

      <section className="py-16">
        <div className="container-x">
          <Stagger className="grid gap-6 md:grid-cols-3">
            {["Sunita's 4-Year Journey", "From Farmer to Platinum", "Building a Team of 900"].map(
              (v) => (
                <StaggerItem key={v}>
                  <div className="card-sheen overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
                    <div className="bg-brand relative flex h-48 items-center justify-center">
                      <PlayCircle className="h-14 w-14 text-primary-foreground/90" />
                    </div>
                    <div className="p-6">
                      <p className="font-display font-semibold text-foreground">{v}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Video testimonial - 6 min
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ),
            )}
          </Stagger>

          <Stagger className="mt-16 grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <StaggerItem key={t.name}>
                <div className="card-glow h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                  <span className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </span>
                  <p className="mt-4 leading-relaxed text-foreground">&quot;{t.quote}&quot;</p>
                  <p className="mt-6 font-display font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}

export default SuccessStories;
