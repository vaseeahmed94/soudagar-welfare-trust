import { useState } from "react";
import {
  fetchMemberDetails,
  requestAccessCode,
  verifyAccessCode,
  type MemberDetails,
} from "../../services/memberAccessService";

const ContributionAccessDialog = () => {
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "details">("email");
  const [details, setDetails] = useState<MemberDetails | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"mine" | "overall">("mine");
  const [page, setPage] = useState(1);
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
      <div className="contribution-access transparency-dashboard">
        <div className="transparency-hero">
          <span className="eyebrow">Soudagar Welfare Trust</span>
          <h2 id="modal-title">Donation transparency</h2>
          <p>
            Every rupee matters. See how community support is received and used.
          </p>
        </div>
        <p className="dashboard-member">
          Welcome, {details.member.name} · {details.member.email}
        </p>
        <div className="dashboard-tabs" role="tablist">
          <button
            className={dashboardTab === "mine" ? "active" : ""}
            onClick={() => {
              setDashboardTab("mine");
              setPage(1);
            }}
            role="tab"
          >
            My contributions
          </button>
          <button
            className={dashboardTab === "overall" ? "active" : ""}
            onClick={() => {
              setDashboardTab("overall");
              setPage(1);
            }}
            role="tab"
          >
            Overall
          </button>
        </div>
        <div className="contribution-total-grid">
          <div className="contribution-total-card">
            <span>My contribution</span>
            <strong>
              ₹{details.totals.memberAmount.toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="contribution-total-card">
            <span>Total donations received</span>
            <strong>
              ₹{details.totals.overallAmount.toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="contribution-total-card">
            <span>Total spent</span>
            <strong>
              ₹{details.totals.totalSpent.toLocaleString("en-IN")}
            </strong>
          </div>
          <div className="contribution-total-card">
            <span>Available balance</span>
            <strong>
              ₹{details.totals.availableBalance.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
        <section className="transparency-progress">
          <div>
            <strong>Where did the donations go?</strong>
            <span>
              {details.totals.overallAmount
                ? Math.round(
                    (details.totals.totalSpent / details.totals.overallAmount) *
                      100,
                  )
                : 0}
              % spent
            </span>
          </div>
          <div className="progress-track">
            <span
              style={{
                width: `${Math.min(100, details.totals.overallAmount ? (details.totals.totalSpent / details.totals.overallAmount) * 100 : 0)}%`,
              }}
            />
          </div>
          <small>
            Spent ₹{details.totals.totalSpent.toLocaleString("en-IN")} ·
            Remaining ₹{details.totals.availableBalance.toLocaleString("en-IN")}
          </small>
        </section>
        {dashboardTab === "mine" && (
          <h3 className="dashboard-section-title">Recent contributions</h3>
        )}
        {dashboardTab === "mine" && (
          <div className="contribution-list">
            {details.contributions.length ? (
              details.contributions
                .slice((page - 1) * 5, page * 5)
                .map((item) => (
                  <div
                    className="contribution-row"
                    key={`${item.month}-${item.createdAt}`}
                  >
                    <strong>{formatDate(item.month || item.createdAt)}</strong>
                    <span>₹{item.amount}</span>
                    {item.status && (
                      <small>
                        {item.status}
                        {item.activity ? ` · ${item.activity}` : ""}
                      </small>
                    )}
                  </div>
                ))
            ) : (
              <p>No contribution records are available yet.</p>
            )}
          </div>
        )}
        {dashboardTab === "mine" && details.contributions.length > 5 && (
          <div className="dashboard-pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(details.contributions.length / 5)}
            </span>
            <button
              disabled={page >= Math.ceil(details.contributions.length / 5)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
        {dashboardTab === "overall" && details.activities.length > 0 && (
          <>
            <h3>Activity</h3>
            <div className="contribution-list">
              {details.activities
                .slice((page - 1) * 5, page * 5)
                .map((item) => (
                  <div
                    className="contribution-row"
                    key={`${item.month}-${item.title}`}
                  >
                    <strong>{item.title}</strong>
                    <span className="activity-meta">
                      <span>{formatDate(item.month)}</span>
                      {item.amountSpent && (
                        <strong>
                          ₹{Number(item.amountSpent).toLocaleString("en-IN")}
                        </strong>
                      )}
                    </span>
                    <small>{item.description}</small>
                  </div>
                ))}
            </div>
          </>
        )}
        {dashboardTab === "overall" && details.activities.length > 5 && (
          <div className="dashboard-pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(details.activities.length / 5)}
            </span>
            <button
              disabled={page >= Math.ceil(details.activities.length / 5)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  return (
    <div className="contribution-access">
      <span className="eyebrow">Member portal</span>
      <h2 id="modal-title">View contributions</h2>
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
