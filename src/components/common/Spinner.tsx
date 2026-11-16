interface SpinnerProps {
  inverse?: boolean;
}

const Spinner = ({ inverse = false }: SpinnerProps) => (
  <span
    className={`inline-block size-7 shrink-0 animate-spin rounded-full border-3 border-solid motion-reduce:animate-none ${
      inverse
        ? "mb-1.5 border-white/30 border-t-white"
        : "border-loading-track border-t-loading-indicator"
    }`}
    aria-hidden="true"
  />
);

export default Spinner;
