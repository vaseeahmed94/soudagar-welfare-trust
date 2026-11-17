import { useState } from "react";
import {
  fetchMemberDetails,
  requestAccessCode,
  verifyAccessCode,
  type MemberDetails,
} from "../../services/memberAccessService";

const ContributionAccessDialog = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "details">("email");
  const [details, setDetails] = useState<MemberDetails | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submitEmail = async () => {
    setBusy(true);
    setMessage("");
    try {
      await requestAccessCode(email);
      setStep("code");
      setMessage("A verification code was sent to your email.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to send code.",
      );
    } finally {
      setBusy(false);
    }
  };
  const submitCode = async () => {
    setBusy(true);
    setMessage("");
    try {
      const token = await verifyAccessCode(email, code);
      setDetails(await fetchMemberDetails(token));
      setStep("details");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to verify code.",
      );
    } finally {
      setBusy(false);
    }
  };
  if (step === "details" && details)
    return (
      <div className="contribution-access">
        <span className="eyebrow">Member portal</span>
        <h2 id="modal-title">Welcome, {details.member.name}</h2>
        <p>{details.member.email}</p>
        <div className="contribution-list">
          {details.contributions.length ? (
            details.contributions.map((item) => (
              <div
                className="contribution-row"
                key={`${item.month}-${item.createdAt}`}
              >
                <strong>{item.month}</strong>
                <span>₹{item.amount}</span>
                <small>
                  {item.status || "Recorded"}
                  {item.activity ? ` · ${item.activity}` : ""}
                </small>
              </div>
            ))
          ) : (
            <p>No contribution records are available yet.</p>
          )}
        </div>
        {details.activities.length > 0 && (
          <>
            <h3>Community activity</h3>
            <div className="contribution-list">
              {details.activities.map((item) => (
                <div
                  className="contribution-row"
                  key={`${item.month}-${item.title}`}
                >
                  <strong>{item.title}</strong>
                  <span>{item.month}</span>
                  <small>{item.description}</small>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  return (
    <div className="contribution-access">
      <span className="eyebrow">Member portal</span>
      <h2 id="modal-title">View my contributions</h2>
      <p>
        We’ll verify your membership by email before showing private
        contribution details.
      </p>
      {step === "email" ? (
        <>
          <label htmlFor="access-email">Email address</label>
          <input
            id="access-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <button
            className="button button-green"
            disabled={busy || !email}
            onClick={submitEmail}
          >
            {busy ? "Sending…" : "Send verification code"}
          </button>
        </>
      ) : (
        <>
          <label htmlFor="access-code">Verification code</label>
          <input
            id="access-code"
            inputMode="numeric"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="6-digit code"
          />
          <button
            className="button button-green"
            disabled={busy || code.length !== 6}
            onClick={submitCode}
          >
            {busy ? "Checking…" : "View contribution details"}
          </button>
          <button className="text-link" onClick={() => setStep("email")}>
            Use a different email
          </button>
        </>
      )}
      {message && (
        <p className="form-note" role="status">
          {message}
        </p>
      )}
    </div>
  );
};
export default ContributionAccessDialog;
