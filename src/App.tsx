import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  HandHeart,
  Heart,
  HeartHandshake,
  HeartPulse,
  Mail,
  MapPin,
  Menu,
  Phone,
  Play,
  Sprout,
  Trophy,
  Users,
  Utensils,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { config } from "./config";
import { submitMembership } from "./services/membership";
import { useMembers } from "./hooks/useMembers";
import MemberPortrait from "./components/MemberPortrait";

const image = (name: string) => `${import.meta.env.BASE_URL}images/${name}.jpg`;
const activities: {
  title: string;
  subtitle: string;
  image: string;
  icon: LucideIcon;
  detail: string;
}[] = [
  {
    title: "Education Support",
    subtitle: "Empowering through education",
    image: "education",
    icon: BookOpen,
    detail:
      "Every child deserves the chance to learn. Our education initiatives focus on school supplies, learning support, and guidance to help young people build a brighter future.",
  },
  {
    title: "Social Service",
    subtitle: "Helping those in need",
    image: "food",
    icon: Utensils,
    detail:
      "Small acts of care make a lasting difference. We bring volunteers together to share meals, offer practical support, and stand beside families who need a helping hand.",
  },
  {
    title: "Community Events",
    subtitle: "Bringing people together",
    image: "hands-seedling",
    icon: Sprout,
    detail:
      "Our community grows stronger when we come together. From planting trees to neighbourhood gatherings, we create opportunities to connect, contribute, and care for our shared home.",
  },
  {
    title: "Health Awareness",
    subtitle: "For a healthier community",
    image: "health",
    icon: HeartPulse,
    detail:
      "Good health begins with awareness. We encourage preventive care, healthy habits, and conversations that help families make informed choices about their wellbeing.",
  },
  {
    title: "Charity Support",
    subtitle: "Spreading kindness",
    image: "volunteers",
    icon: Gift,
    detail:
      "Compassion becomes meaningful through action. We connect people who want to give with community initiatives supporting everyday essentials and families facing difficult times.",
  },
];
const gallery = [
  {
    image: "volunteers",
    title: "Coming together for our community",
    caption: "Service begins with people who care.",
  },
  {
    image: "hands-seedling",
    title: "Planting the seeds of a greener tomorrow",
    caption: "Small steps towards a better shared future.",
  },
  {
    image: "community",
    title: "Celebrating service and togetherness",
    caption: "Building bonds that make our community stronger.",
  },
];
const testimonials = [
  {
    quote:
      "Soudagar Welfare Trust has brought positive change in our community. Their efforts are truly inspiring.",
    author: "Community Member",
  },
  {
    quote:
      "When we come together with kindness, even the smallest act of service can make a meaningful difference.",
    author: "SWT Volunteer",
  },
  {
    quote:
      "A stronger community begins with people who care. Together, we are building a better tomorrow.",
    author: "Community Supporter",
  },
];
type Modal =
  | { kind: "join" }
  | { kind: "activity"; index: number }
  | { kind: "gallery"; index: number }
  | { kind: "members" }
  | { kind: "privacy" }
  | { kind: "terms" }
  | null;

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="#home"
      aria-label="Soudagar Welfare Trust home"
    >
      <svg
        className="brand-mark"
        viewBox="0 0 90 94"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M45 4l3.3 7 7.7 1-5.5 5.4 1.3 7.6-6.8-3.6-6.8 3.6 1.3-7.6L34 12l7.7-1L45 4Z"
          fill="#D5AB3B"
        />
        <path
          d="M43 88C9 76 4 50 17 29 8 57 26 69 43 88ZM47 88c34-12 39-38 26-59 9 28-9 40-26 59Z"
          fill={light ? "#C4D88A" : "#287A3D"}
        />
        <path
          d="M39 83C16 70 16 51 21 41c2 16 13 17 18 42ZM51 83c23-13 23-32 18-42-2 16-13 17-18 42Z"
          fill="#91AF44"
        />
        <circle cx="45" cy="36" r="7" fill="#D5AB3B" />
        <circle cx="27" cy="32" r="5" fill="#4B9249" />
        <circle cx="63" cy="32" r="5" fill="#4B9249" />
        <path
          d="M45 76c-1-21-18-23-15-33 6 1 10 7 15 11 5-4 9-10 15-11 3 10-14 12-15 33Z"
          fill={light ? "#F2E1A2" : "#075332"}
        />
      </svg>
      <span>
        Soudagar
        <br />
        Welfare Trust<small>(SWT)</small>
      </span>
    </a>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [testimonial, setTestimonial] = useState(0);
  const [submission, setSubmission] = useState<
    "idle" | "submitting" | "success"
  >("idle");
  const [submissionError, setSubmissionError] = useState("");
  const submissionPending = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const joinReturnFocus = useRef<HTMLElement | null>(null);
  const joinReturnScroll = useRef(0);
  const isJoining = modal?.kind === "join";
  const ModalContainer = isJoining ? "section" : "dialog";
  const {
    directory,
    status: membersStatus,
    refresh: refreshMembers,
  } = useMembers();
  const nav = [
    ["Home", "home"],
    ["About", "about"],
    ["Our Work", "activities"],
    ["Members", "members"],
    ["Gallery", "gallery"],
    ["Contact", "contact"],
  ];
  useEffect(() => {
    if (modal?.kind === "join") {
      document.body.style.overflow = "";
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("modal-title")?.focus({ preventScroll: true });
    } else if (modal) {
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
      setSubmission("idle");
      setSubmissionError("");
      if (joinReturnFocus.current) {
        joinReturnFocus.current.focus({ preventScroll: true });
        window.scrollTo({ top: joinReturnScroll.current, behavior: "instant" });
        joinReturnFocus.current = null;
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);
  const join = () => {
    if (!isJoining) {
      joinReturnFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      joinReturnScroll.current = window.scrollY;
    }
    setMenuOpen(false);
    setModal({ kind: "join" });
  };
  const changeQuote = (step: number) =>
    setTestimonial(
      (i) => (i + step + testimonials.length) % testimonials.length,
    );
  return (
    <>
      <div hidden={isJoining}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="topbar">
          <div className="container topbar-inner">
            <div className="contact-links">
              <span>
                <MapPin /> Bidar, Karnataka
              </span>
              <a href={config.contactEmailUrl}>
                <Mail /> {config.contactEmail}
              </a>
              <a href={config.contactPhoneUrl}>
                <Phone /> {config.contactPhone}
              </a>
            </div>
            <span className="topbar-motto">
              Together for a Better Tomorrow <Heart />
            </span>
          </div>
        </div>
        <header className="header">
          <div className="container header-inner">
            <Logo />
            <button
              className="menu-toggle"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
            <nav
              id="navigation"
              aria-label="Main navigation"
              className={menuOpen ? "navigation open" : "navigation"}
            >
              {nav.map(([label, id], i) => (
                <a
                  className={i === 0 ? "nav-home" : ""}
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                  {id === "members" && <ChevronDown size={13} />}
                </a>
              ))}
              <button
                className="button button-green header-join"
                onClick={join}
              >
                <Users size={17} /> Join Our Community
              </button>
            </nav>
          </div>
        </header>
        <main id="main">
          <section className="hero" id="home">
            <div className="hero-photo hero-people" />
            <div className="hero-photo hero-mosque" />
            <div className="hero-wash" />
            <div className="hero-content">
              <h1>
                Soudagar
                <br />
                Welfare Trust <span>(SWT)</span>
              </h1>
              <p className="hero-values">
                Humanity <b>•</b> Service <b>•</b> Unity
              </p>
              <p className="hero-motto">“Together for a Better Tomorrow”</p>
              <div className="hero-buttons">
                <button className="button button-green" onClick={join}>
                  Join Our Community <ArrowRight size={16} />
                </button>
                <a className="button button-light" href="#about">
                  <Play size={15} fill="currentColor" /> Learn More
                </a>
              </div>
            </div>
            <svg
              className="hero-wave"
              viewBox="0 0 1440 65"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 40C270-15 600 90 1020 49c180-18 307-21 420-49v65H0Z"
                fill="#5B9D49"
              />
              <path
                d="M0 49C270-5 600 98 1020 57c180-18 307-21 420-47v55H0Z"
                fill="#fff"
              />
            </svg>
          </section>
          <div className="container">
            <section className="about" id="about">
              <img
                className="about-image"
                src={image("hands-seedling")}
                alt="Hands gently holding soil and a young green seedling"
              />
              <div className="about-copy">
                <span className="eyebrow">About SWT</span>
                <h2>Small Steps... Big Impact</h2>
                <p>
                  Soudagar Welfare Trust (SWT) is a community-driven initiative
                  working for social welfare, education, and community harmony.
                </p>
                <ul className="mission-list">
                  <li>
                    <CheckCircle2 /> Support for education and skill development
                  </li>
                  <li>
                    <CheckCircle2 /> Community welfare and social service
                  </li>
                  <li>
                    <CheckCircle2 /> Promoting peace, unity and brotherhood
                  </li>
                </ul>
                <button
                  className="button button-outline"
                  onClick={() => setModal({ kind: "activity", index: 2 })}
                >
                  Our Mission <ArrowRight size={15} />
                </button>
              </div>
              <aside className="quote-card">
                <span className="quote-symbol">“</span>
                <blockquote>
                  Together we can
                  <br />
                  build a kinder,
                  <br />
                  stronger and more
                  <br />
                  compassionate society.
                </blockquote>
                <div className="quote-signature">
                  <span />
                  <HeartHandshake />
                  <span />
                </div>
                <Sprout className="quote-leaf" aria-hidden="true" />
              </aside>
            </section>
            <section className="stats" aria-label="Our community in numbers">
              {[
                {
                  value: directory ? String(directory.totalCount) : "—",
                  label: "Members",
                  icon: Users,
                },
                { value: "50+", label: "Community Activities", icon: Heart },
                { value: "100+", label: "People Supported", icon: HandHeart },
                { value: "10+", label: "Achievements", icon: Trophy },
              ].map(({ value, label, icon: Icon }) => (
                <div className="stat" key={label}>
                  <Icon aria-hidden="true" />
                  <div>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                </div>
              ))}
            </section>
            <section className="activities" id="activities">
              <div className="section-heading">
                <h2>
                  <span>Our</span> Activities
                </h2>
                <p>Serving the Community, Building a Better Society</p>
              </div>
              <div className="activity-grid">
                {activities.map((activity, index) => (
                  <article className="activity-card" key={activity.title}>
                    <img
                      src={image(activity.image)}
                      alt={activity.title}
                      loading="lazy"
                    />
                    <span className="activity-icon">
                      <activity.icon size={23} />
                    </span>
                    <div className="activity-copy">
                      <h3>{activity.title}</h3>
                      <p>{activity.subtitle}</p>
                      <button
                        className="text-link"
                        onClick={() => setModal({ kind: "activity", index })}
                        aria-label={`Learn more about ${activity.title}`}
                      >
                        Learn More <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <div className="community-sections">
              <section className="members" id="members">
                <div className="small-heading">
                  <h2>
                    <span>Our</span> Members
                  </h2>
                  <p>A strong community of kind-hearted people</p>
                </div>
                <div
                  className="member-portraits"
                  aria-busy={membersStatus === "loading"}
                >
                  {directory?.members.slice(0, 3).map((member, index) => (
                    <MemberPortrait
                      key={`${index}-${member.name}`}
                      member={member}
                    />
                  ))}
                  <div className="member-count">
                    <strong>{directory ? directory.totalCount : "—"}</strong>
                    <span>Members</span>
                  </div>
                </div>
                {membersStatus === "loading" && (
                  <p className="member-status" role="status">
                    Loading our community…
                  </p>
                )}
                {membersStatus === "error" && (
                  <p className="member-status" role="status">
                    Member details are temporarily unavailable.{" "}
                    <button className="text-link" onClick={refreshMembers}>
                      Try again
                    </button>
                  </p>
                )}
                {directory && directory.members.length === 0 && (
                  <p className="member-status">
                    Public member profiles will appear here when members choose
                    to share them.
                  </p>
                )}
                <p className="member-privacy-note">
                  Only members who consent are shown. Everyone is included in
                  the count.
                </p>
                <button
                  className="button button-green button-small"
                  onClick={() => setModal({ kind: "members" })}
                >
                  View All Members <ArrowRight size={15} />
                </button>
              </section>
              <section className="gallery" id="gallery">
                <div className="small-heading">
                  <h2>
                    <span>Gallery</span>
                  </h2>
                  <p>Moments of Service &amp; Togetherness</p>
                </div>
                <div className="gallery-grid">
                  {gallery.map((photo, index) => (
                    <button
                      key={photo.title}
                      onClick={() => setModal({ kind: "gallery", index })}
                      aria-label={`View image: ${photo.title}`}
                    >
                      <img
                        src={image(photo.image)}
                        alt={photo.title}
                        loading="lazy"
                      />
                      <span>{photo.title}</span>
                    </button>
                  ))}
                </div>
                <button
                  className="button button-green button-small"
                  onClick={() => setModal({ kind: "gallery", index: 0 })}
                >
                  View Gallery <ArrowRight size={15} />
                </button>
              </section>
            </div>
          </div>
          <section className="testimonials" aria-label="Community voices">
            <div className="container testimonial-inner">
              <button
                className="round-button"
                onClick={() => changeQuote(-1)}
                aria-label="Previous testimonial"
              >
                <ChevronLeft />
              </button>
              <div className="testimonial-copy" aria-live="polite">
                <span className="testimonial-mark">“</span>
                <blockquote>{testimonials[testimonial].quote}</blockquote>
                <cite>— {testimonials[testimonial].author}</cite>
                <div className="testimonial-dots">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Show testimonial ${i + 1}`}
                      aria-pressed={i === testimonial}
                      className={i === testimonial ? "active" : ""}
                      onClick={() => setTestimonial(i)}
                    />
                  ))}
                </div>
              </div>
              <button
                className="round-button"
                onClick={() => changeQuote(1)}
                aria-label="Next testimonial"
              >
                <ChevronRight />
              </button>
            </div>
          </section>
          <section className="join-strip">
            <div className="container join-inner">
              <HeartHandshake className="join-symbol" />
              <div>
                <h2>Join Our Community Today!</h2>
                <p>
                  Be a part of Soudagar Welfare Trust and contribute towards a
                  better society.
                </p>
              </div>
              <button className="button button-gold" onClick={join}>
                <Users size={18} /> Become a Member <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </main>
        <footer className="footer" id="contact">
          <div className="container">
            <div className="footer-main">
              <Logo light />
              <div className="footer-links">
                <h3>Quick Links</h3>
                <div>
                  {nav.map(([label, id]) => (
                    <a key={id} href={`#${id}`}>
                      {label}
                    </a>
                  ))}
                </div>
              </div>
              <div className="footer-social">
                <h3>Get in Touch</h3>
                <div>
                  <a
                    className="social youtube"
                    href={config.contactEmailUrl}
                    aria-label="Email SWT"
                  >
                    <Mail />
                  </a>
                  <a
                    className="social whatsapp"
                    href={config.contactPhoneUrl}
                    aria-label="Call SWT"
                  >
                    <Phone />
                  </a>
                  <button
                    className="social facebook"
                    onClick={join}
                    aria-label="Join our community"
                  >
                    <Users />
                  </button>
                  <a
                    className="social social-heart"
                    href="#activities"
                    aria-label="Explore our community work"
                  >
                    <Heart />
                  </a>
                </div>
              </div>
              <p className="footer-motto">
                Together for a Better Tomorrow{" "}
                <Heart size={14} fill="#d44640" color="#d44640" />
              </p>
            </div>
            <div className="footer-bottom">
              <span>
                © {new Date().getFullYear()} Soudagar Welfare Trust (SWT). All
                rights reserved.
              </span>
              <div>
                <button onClick={() => setModal({ kind: "privacy" })}>
                  Privacy Policy
                </button>
                <span>|</span>
                <button onClick={() => setModal({ kind: "terms" })}>
                  Terms &amp; Conditions
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <div className={isJoining ? "application-page" : undefined}>
        <ModalContainer
          ref={(element: HTMLElement | null) => {
            dialog.current =
              element?.tagName === "DIALOG"
                ? (element as HTMLDialogElement)
                : null;
          }}
          role={isJoining ? "main" : undefined}
          onKeyDown={(event) => {
            if (
              isJoining &&
              event.key === "Escape" &&
              !submissionPending.current
            )
              setModal(null);
          }}
          className={`modal ${modal?.kind === "gallery" ? "gallery-modal" : modal?.kind === "join" ? "join-modal" : ""}`}
          onCancel={(event) => {
            if (submissionPending.current) event.preventDefault();
            else setModal(null);
          }}
          onClick={(event) => {
            if (
              !isJoining &&
              event.target === event.currentTarget &&
              !submissionPending.current
            )
              setModal(null);
          }}
          aria-labelledby="modal-title"
        >
          <button
            className="modal-close"
            aria-label="Close dialog"
            disabled={submission === "submitting"}
            onClick={() => setModal(null)}
          >
            <X />
          </button>
          {modal?.kind === "join" && (
            <>
              <span className="eyebrow">Soudagar Welfare Trust</span>
              <h2 id="modal-title" tabIndex={-1}>
                Membership Application
              </h2>
              {submission !== "success" && (
                <>
                  <p className="join-introduction" id="join-introduction">
                    Please complete the form below to apply for membership with
                    Soudagar Welfare Trust.
                  </p>
                  <p className="required-note">
                    All fields marked with <span aria-hidden="true">*</span> are
                    required.
                  </p>
                </>
              )}
              {submission === "success" ? (
                <div className="enquiry-ready" role="status">
                  <CheckCircle2 size={40} />
                  <h3>Application submitted</h3>
                  <p>
                    Thank you. Soudagar Welfare Trust has received your
                    membership application and recorded your name display
                    preference.
                  </p>
                  <button
                    className="button button-green"
                    onClick={() => setModal(null)}
                  >
                    Close <CheckCircle2 size={17} />
                  </button>
                </div>
              ) : (
                <form
                  aria-describedby="join-introduction"
                  aria-busy={submission === "submitting"}
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (submissionPending.current) return;
                    const data = new FormData(event.currentTarget);
                    const field = (name: string) =>
                      String(data.get(name) ?? "").trim();
                    submissionPending.current = true;
                    setSubmission("submitting");
                    setSubmissionError("");
                    try {
                      await submitMembership({
                        name: field("name"),
                        email: field("email"),
                        phone: field("phone"),
                        publicConsent: field("publicConsent") === "yes",
                      });
                      setSubmission("success");
                      refreshMembers();
                    } catch (error) {
                      setSubmissionError(
                        error instanceof Error
                          ? error.message
                          : "Unable to submit your application. Please contact the trust.",
                      );
                      setSubmission("idle");
                    } finally {
                      submissionPending.current = false;
                    }
                  }}
                >
                  <fieldset
                    className="membership-fields"
                    disabled={submission === "submitting"}
                  >
                    <label>
                      <span>
                        Full name <span aria-hidden="true">*</span>
                      </span>
                      <input
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="Enter your full name"
                        maxLength={100}
                      />
                    </label>
                    <label>
                      <span>
                        Email address <span aria-hidden="true">*</span>
                      </span>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="Enter your email address"
                      />
                    </label>
                    <label>
                      <span>
                        Phone number <span aria-hidden="true">*</span>
                      </span>
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        placeholder="Enter your phone number"
                        minLength={7}
                        maxLength={20}
                      />
                    </label>
                    <fieldset
                      className="consent-options"
                      aria-describedby="name-display-question name-display-privacy"
                    >
                      <legend>
                        Permission to display your name{" "}
                        <span aria-hidden="true">*</span>
                      </legend>
                      <p
                        className="consent-description"
                        id="name-display-question"
                      >
                        May we display your full name in the “Our Members”
                        section of this website?
                      </p>
                      <label>
                        <input
                          type="radio"
                          name="publicConsent"
                          value="yes"
                          required
                        />
                        <span>
                          <strong>Yes, display my name</strong>
                          <small>
                            Show my first initial with my full name below it.
                          </small>
                        </span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="publicConsent"
                          value="no"
                          required
                        />
                        <span>
                          <strong>No, keep my name private</strong>
                          <small>
                            Include me only in the total number of members.
                          </small>
                        </span>
                      </label>
                      <p className="form-note" id="name-display-privacy">
                        Your email address and phone number will remain private.
                      </p>
                    </fieldset>
                    <p className="form-note">
                      By submitting this form, you agree that Soudagar Welfare
                      Trust may use your contact details to process your
                      membership application.
                    </p>
                    {submissionError && (
                      <p className="form-error" role="alert">
                        {submissionError}
                      </p>
                    )}
                    <button className="button button-green" type="submit">
                      {submission === "submitting"
                        ? "Submitting Application…"
                        : "Submit Application"}{" "}
                      <ArrowRight size={16} />
                    </button>
                  </fieldset>
                </form>
              )}
            </>
          )}
          {modal?.kind === "activity" && (
            <>
              <img
                className="modal-cover"
                src={image(activities[modal.index].image)}
                alt={activities[modal.index].title}
              />
              <span className="eyebrow">Humanity • Service • Unity</span>
              <h2 id="modal-title">{activities[modal.index].title}</h2>
              <p>{activities[modal.index].detail}</p>
              <button className="button button-green" onClick={join}>
                Get Involved <ArrowRight size={16} />
              </button>
            </>
          )}
          {modal?.kind === "members" && (
            <>
              <span className="eyebrow">The people behind our purpose</span>
              <h2 id="modal-title">A Community That Cares</h2>
              <p>
                Community members:{" "}
                <strong>{directory ? directory.totalCount : "—"}</strong>
              </p>
              <div
                className="member-directory"
                aria-busy={membersStatus === "loading"}
              >
                {directory?.members.map((member, index) => (
                  <MemberPortrait
                    key={`${index}-${member.name}`}
                    member={member}
                  />
                ))}
              </div>
              {membersStatus === "loading" && (
                <p role="status">Loading members…</p>
              )}
              {membersStatus === "error" && (
                <p role="status">
                  Member details are temporarily unavailable.{" "}
                  <button className="text-link" onClick={refreshMembers}>
                    Try again
                  </button>
                </p>
              )}
              {directory && directory.members.length === 0 && (
                <p>No public profiles yet.</p>
              )}
              <p className="form-note">
                Profiles appear only with permission. Members who prefer privacy
                are included in the total count without showing their name.
              </p>
              <button className="button button-green" onClick={join}>
                Become a Member <ArrowRight size={16} />
              </button>
            </>
          )}
          {modal?.kind === "gallery" && (
            <>
              <img
                className="lightbox-image"
                src={image(gallery[modal.index].image)}
                alt={gallery[modal.index].title}
              />
              <div className="lightbox-caption">
                <div>
                  <h2 id="modal-title">{gallery[modal.index].title}</h2>
                  <p>{gallery[modal.index].caption}</p>
                </div>
                <div className="lightbox-controls">
                  <button
                    className="round-button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setModal({
                        kind: "gallery",
                        index:
                          (modal.index + gallery.length - 1) % gallery.length,
                      })
                    }
                  >
                    <ChevronLeft />
                  </button>
                  <span>
                    {modal.index + 1} / {gallery.length}
                  </span>
                  <button
                    className="round-button"
                    aria-label="Next photo"
                    onClick={() =>
                      setModal({
                        kind: "gallery",
                        index: (modal.index + 1) % gallery.length,
                      })
                    }
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
              <p className="form-note">
                Illustrative photographs representing our community’s values.
              </p>
            </>
          )}
          {modal?.kind === "privacy" && (
            <>
              <h2 id="modal-title">Privacy Policy</h2>
              <p>
                Membership form details are sent to the trust’s Google Apps
                Script service to process your enquiry. Contact the trust to ask
                how your details are stored or to request their removal. Only
                members who choose Yes to public display appear in Our Members.
                Choosing No includes you in the total count without publishing
                your name. You can contact the trust to withdraw your
                permission.
              </p>
              <p>
                Website images are served locally. Fonts may be requested from
                Google Fonts. Contact {config.contactEmail} with privacy
                questions.
              </p>
            </>
          )}
          {modal?.kind === "terms" && (
            <>
              <h2 id="modal-title">Terms &amp; Conditions</h2>
              <p>
                This website presents Soudagar Welfare Trust’s community vision.
                Gallery photographs, testimonials, and activity impact figures
                are illustrative content based on the supplied design and should
                be verified by the trust before public launch.
              </p>
              <p>
                A membership enquiry does not confirm membership. Contact the
                trust directly to discuss participation or support.
              </p>
            </>
          )}
        </ModalContainer>
      </div>
    </>
  );
}
