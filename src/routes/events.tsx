import { MapPin, Ticket, Users, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import eventsBreadcrumbImage from "@/assets/events-breadcrumb.png";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { events as fallbackEvents } from "@/data/site";
import { getPublicEvents, type PublicEvent } from "@/lib/cms";
import { submitPublicEnquiry } from "@/lib/public-api";
import { isValidMobileNumber, MOBILE_NUMBER_ERROR } from "@/lib/mobile-validation";

const title = "Events — Seminars, Business Meets & Product Launches | RDG";
const description =
  "Upcoming RDG Future Way seminars, business meetings, product launches and recognition nights across India. Register your seat online.";

type RegistrationForm = {
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
};

const emptyForm: RegistrationForm = { name: "", email: "", phone: "", city: "", message: "" };

function daysLeft(date: string) {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? `${diff} days to go` : "Registrations closed";
}

function isOpen(date: string) {
  return new Date(date).getTime() > Date.now();
}

function Events() {
  const [items, setItems] = useState<PublicEvent[]>(
    fallbackEvents.map((event, index) => ({
      id: `fallback-${index}`,
      slug: event.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      title: event.title,
      eventDate: event.date,
      city: event.city,
      eventType: event.type,
      seats: event.seats,
    })),
  );
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const [form, setForm] = useState<RegistrationForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPublicEvents().then((data) => {
      if (data) setItems(data);
    });
  }, []);

  function openRegistration(event: PublicEvent) {
    setSelectedEvent(event);
    setForm(emptyForm);
    setSubmitted(false);
    setError("");
  }

  function closeRegistration() {
    if (submitting) return;
    setSelectedEvent(null);
    setError("");
  }

  async function submitRegistration(event: FormEvent) {
    event.preventDefault();
    if (!selectedEvent) return;
    if (!isValidMobileNumber(form.phone)) {
      setError(MOBILE_NUMBER_ERROR);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitPublicEnquiry({
        type: "other",
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        message: [
          `Event registration: ${selectedEvent.title}`,
          `Event date: ${selectedEvent.eventDate}`,
          `Event city: ${selectedEvent.city}`,
          form.message,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      setSubmitted(true);
      setForm(emptyForm);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to submit registration.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="relative w-full overflow-hidden bg-white sm:h-[clamp(390px,29vw,560px)]">
        <img
          src={eventsBreadcrumbImage}
          alt="Events at RDG Future Way"
          width={2048}
          height={760}
          className="block h-auto w-full sm:absolute sm:inset-0 sm:h-full sm:object-cover sm:object-center"
        />
      </section>

      <section className="py-16">
        <div className="container-x">
          <Stagger className="grid gap-6 md:grid-cols-2">
            {items.map((event) => {
              const registrationOpen = isOpen(event.eventDate);
              return (
                <StaggerItem key={event.id}>
                  <div className="card-lift h-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
                    <div className="bg-brand flex flex-wrap items-center justify-between gap-2 px-4 py-5 text-primary-foreground sm:px-7">
                      <span className="font-display text-sm font-semibold">{event.eventType}</span>
                      <span className="bg-gold-grad rounded-full px-3 py-1 text-[11px] font-bold text-gold-foreground">
                        {daysLeft(event.eventDate)}
                      </span>
                    </div>
                    <div className="p-7">
                      <h2 className="font-display text-xl font-semibold text-foreground">
                        {event.title}
                      </h2>
                      {event.description && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-primary" />
                          {new Date(event.eventDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" /> {event.city}
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" /> {event.seats} seats
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={!registrationOpen}
                        onClick={() => openRegistration(event)}
                        className={`mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform ${registrationOpen ? "bg-brand hover:-translate-y-0.5" : "cursor-not-allowed bg-muted text-muted-foreground"}`}
                      >
                        {registrationOpen ? "Register now" : "Registrations closed"}
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/60 px-4 py-8 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRegistration();
          }}
        >
          <div
            className="max-h-[calc(100vh-4rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-registration-title"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                  Event registration
                </p>
                <h2 id="event-registration-title" className="mt-2 font-display text-2xl font-bold">
                  {selectedEvent.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share your details and the RDG team will confirm your seat.
                </p>
              </div>
              <button
                type="button"
                onClick={closeRegistration}
                className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Close registration form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="mt-7 rounded-2xl bg-secondary/10 px-5 py-4 text-sm font-medium text-secondary">
                Thank you. Your registration enquiry has been sent to the RDG team.
              </div>
            ) : (
              <form onSubmit={submitRegistration} className="mt-7 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Full name
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="field mt-1.5"
                    required
                  />
                </label>
                <label className="text-sm font-semibold">
                  Mobile number
                  <input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    type="tel"
                    inputMode="numeric"
                    maxLength={16}
                    className="field mt-1.5"
                    required
                  />
                </label>
                <label className="text-sm font-semibold">
                  Email address
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="field mt-1.5"
                    required
                  />
                </label>
                <label className="text-sm font-semibold">
                  City
                  <input
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                    className="field mt-1.5"
                    required
                  />
                </label>
                <label className="text-sm font-semibold sm:col-span-2">
                  Message (optional)
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    className="field mt-1.5"
                    rows={4}
                    placeholder="Anything the event team should know?"
                  />
                </label>
                {error && (
                  <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive sm:col-span-2">
                    {error}
                  </p>
                )}
                <div className="flex justify-end gap-3 sm:col-span-2">
                  <button
                    type="button"
                    onClick={closeRegistration}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Send registration"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Events;
