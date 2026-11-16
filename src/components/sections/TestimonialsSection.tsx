import { useLocale } from "../../hooks/useLocale";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "../../constants/testimonials";

const TestimonialsSection = () => {
  const { t } = useLocale();
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const handleTestimonialChange = (step: number) =>
    setActiveTestimonialIndex(
      (index) => (index + step + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
  return (
    <section className="testimonials" aria-label={t("testimonials.label")}>
      <div className="testimonial-inner container">
        <button
          className="round-button"
          onClick={() => handleTestimonialChange(-1)}
          aria-label={t("testimonials.previous")}
        >
          <ChevronLeft />
        </button>
        <div className="testimonial-copy" aria-live="polite">
          <span className="testimonial-mark">“</span>
          <blockquote>
            {t(TESTIMONIALS[activeTestimonialIndex].quoteKey)}
          </blockquote>
          <cite>— {t(TESTIMONIALS[activeTestimonialIndex].authorKey)}</cite>
          <div className="testimonial-dots">
            {TESTIMONIALS.map((_, testimonialIndex) => (
              <button
                key={testimonialIndex}
                aria-label={t("testimonials.showLabel", {
                  number: testimonialIndex + 1,
                })}
                aria-pressed={testimonialIndex === activeTestimonialIndex}
                className={
                  testimonialIndex === activeTestimonialIndex ? "active" : ""
                }
                onClick={() => setActiveTestimonialIndex(testimonialIndex)}
              />
            ))}
          </div>
        </div>
        <button
          className="round-button"
          onClick={() => handleTestimonialChange(1)}
          aria-label={t("testimonials.next")}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
};

export default TestimonialsSection;
