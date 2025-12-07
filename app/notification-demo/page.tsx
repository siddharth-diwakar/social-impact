"use client";

import React, { useEffect, useMemo, useState } from "react";

type DocumentItem = {
  id: number;
  title: string;
  description: string;
  jurisdiction: string;
  tags: string[];
  why: string;
};

function NotificationCard({
  doc,
  sharedTags,
  visible,
}: {
  doc: DocumentItem | null;
  sharedTags: string[];
  visible: boolean;
}) {
  return (
    <div
      className={`notification-card ${visible ? "notification-card-visible" : ""}`}
      aria-live="polite"
    >
      <div className="notification-card-header">
        <div>
          <p className="notification-card-kicker">Live Notifications</p>
          <h2 className="notification-card-title">When tags overlap, we surface the why.</h2>
        </div>
        <span className="notification-card-chip">{doc ? "Active" : "Idle"}</span>
      </div>

      <div className="notification-card-body">
        <div className="notification-card-row">
          <span className="notification-card-bullet" aria-hidden />
          <div>
            <p className="notification-card-label">Matching Tags</p>
            <div className="notification-card-tags">
              {sharedTags.length > 0 ? (
                sharedTags.map((tag) => (
                  <span key={tag} className="notification-card-tag">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="notification-card-muted">Awaiting next update</span>
              )}
            </div>
          </div>
        </div>

        <div className="notification-card-row">
          <span className="notification-card-bullet" aria-hidden />
          <div>
            <p className="notification-card-label">Relevant legislation added</p>
            <p className="notification-card-text">
              <strong>Summary:</strong>{" "}
              {doc
                ? `${doc.title} — ${doc.why}.`
                : "Play the demo to see matched alerts in real time."}
            </p>
          </div>
        </div>

        <div className="notification-card-row">
          <span className="notification-card-bullet" aria-hidden />
          <div>
            <p className="notification-card-label">Why you got this</p>
            <p className="notification-card-text">
              {doc
                ? doc.why
                : "We alert you when tags overlap with your business."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const documents: DocumentItem[] = [
  {
    id: 1,
    title: "Austin sick leave policy revision",
    description: "City guidance refresh on accrual rules for service staff.",
    jurisdiction: "Texas",
    tags: ["Texas", "Payroll", "Leave"],
    why: "Texas + Payroll match your profile",
  },
  {
    id: 2,
    title: "Contractor onboarding checklist",
    description: "State update on disclosures for gig and hourly contractors.",
    jurisdiction: "Texas",
    tags: ["Texas", "Contractor", "Hiring"],
    why: "Texas + Hiring intersect with your tags",
  },
  {
    id: 3,
    title: "Food safety temp control alert",
    description: "Refrigeration log requirements for prepared foods.",
    jurisdiction: "Texas",
    tags: ["Food Safety", "Operations", "Texas"],
    why: "Food Safety tag match",
  },
  {
    id: 4,
    title: "Lease addendum notice period",
    description: "New 45-day notice requirement for renewals.",
    jurisdiction: "Texas",
    tags: ["Lease", "Texas", "Compliance"],
    why: "Lease tag match",
  },
  {
    id: 5,
    title: "New Texas data privacy rule",
    description: "Applies to loyalty programs capturing email + phone.",
    jurisdiction: "Texas",
    tags: ["Texas", "Data Privacy", "Marketing"],
    why: "Texas + Data Privacy — flagged for your business",
  },
];

const businessTags = ["Payroll", "Food Safety", "Texas", "Lease", "Data Privacy"];

export default function NotificationDemoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [toastDoc, setToastDoc] = useState<DocumentItem | null>(null);
  const [showToast, setShowToast] = useState(false);

  const schedule = useMemo(() => documents.map((_, idx) => idx), []);

  useEffect(() => {
    if (!isPlaying) return;

    setVisibleCount(0);
    setActiveIndex(null);
    setToastDoc(null);
    setShowToast(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    schedule.forEach((idx, step) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount(step + 1);
          setActiveIndex(idx);
          const doc = documents[idx];
          const hasOverlap = doc.tags.some((tag) => businessTags.includes(tag));
          if (hasOverlap) {
            setToastDoc(doc);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3800);
          } else {
            setShowToast(false);
          }
        }, step * 1700),
      );
    });

    timers.push(
      setTimeout(() => {
        setIsPlaying(false);
      }, schedule.length * 1700 + 1900),
    );

    return () => timers.forEach(clearTimeout);
  }, [isPlaying, schedule]);

  const visibleDocs = documents.slice(0, visibleCount);
  const toastSharedTags =
    toastDoc?.tags.filter((tag) => businessTags.includes(tag)) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3E1421] via-[#531324] to-[#7D3227] text-[#F3E3DF]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#F7E2DB]/80">
              Tag-aware notifications
            </p>
            <h1 className="text-3xl font-semibold text-[#F3E3DF]">
              Play Notification Demo
            </h1>
            <p className="max-w-2xl text-sm text-[#F7E2DB]/80">
              Documents get tagged on ingest. When tags overlap with your business, the system
              pushes a live update.
            </p>
          </div>
          <button
            className="rounded-xl border border-[#AF755C]/60 bg-[#7D3227] px-4 py-2 text-sm font-semibold text-[#F3E3DF] shadow-[0_15px_60px_-40px_rgba(237,217,212,0.8)] transition hover:bg-[#531324] disabled:opacity-60"
            onClick={() => setIsPlaying(true)}
            disabled={isPlaying}
          >
            {isPlaying ? "Playing..." : "Play Notification Demo"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-3xl border border-[#AF755C]/50 bg-[#3E1421]/70 p-4 shadow-[0_25px_100px_-40px_rgba(237,217,212,0.5)]">
            <div className="rounded-2xl bg-[#531324]/60 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#F3E3DF]">
                  Incoming legal updates
                </h2>
                <span className="text-xs uppercase tracking-[0.2em] text-[#F7E2DB]/60">
                  Stream
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {visibleDocs.map((doc, idx) => {
                  const isActive = activeIndex === idx;
                  const sharedTags = doc.tags.filter((tag) =>
                    businessTags.includes(tag),
                  );
                  return (
                    <div
                      key={doc.id}
                      className={`rounded-xl border px-3 py-3 transition-all ${
                        isActive
                          ? "border-[#AF755C]/80 bg-[#7D3227]/70 shadow-[0_12px_60px_-40px_rgba(237,217,212,0.8)] scale-[1.01]"
                          : "border-[#AF755C]/40 bg-[#531324]/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[#F7E2DB]/70">
                            {doc.jurisdiction}
                          </p>
                          <h3 className="text-lg font-semibold text-[#F3E3DF]">
                            {doc.title}
                          </h3>
                          <p className="text-sm text-[#F7E2DB]/75">
                            {doc.description}
                          </p>
                        </div>
                        <div className="rounded-full border border-[#AF755C]/50 bg-[#3E1421]/70 px-2 py-1 text-[11px] text-[#F7E2DB]/80">
                          Tagged
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {doc.tags.map((tag) => {
                          const isShared = sharedTags.includes(tag);
                          return (
                            <span
                              key={tag}
                              className={`rounded-full border px-2 py-1 text-xs ${
                                isShared
                                  ? "border-emerald-300/70 bg-emerald-500/15 text-emerald-100"
                                  : "border-[#AF755C]/40 bg-[#3E1421]/80 text-[#F7E2DB]/80"
                              }`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {!visibleDocs.length && (
                  <div className="rounded-xl border border-dashed border-[#AF755C]/40 bg-[#531324]/40 p-6 text-sm text-[#F7E2DB]/70">
                    Click play to watch new documents land, tag, and notify.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-[#AF755C]/50 bg-[#3E1421]/70 p-4 shadow-[0_25px_100px_-40px_rgba(237,217,212,0.5)]">
              <div className="rounded-2xl bg-[#531324]/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#F7E2DB]/70">
                  Your Business
                </p>
                <h2 className="text-xl font-semibold text-[#F3E3DF]">
                  Austin Coffee Co.
                </h2>
                <p className="text-sm text-[#F7E2DB]/75">
                  Subscribed tags used to route alerts instantly.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {businessTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#AF755C]/50 bg-[#3E1421]/70 px-3 py-1 text-xs text-[#F7E2DB]/85"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-h-[220px] overflow-hidden rounded-3xl border border-[#AF755C]/50 bg-[#3E1421]/70 p-4 shadow-[0_25px_100px_-40px_rgba(237,217,212,0.5)]">
              <NotificationCard
                doc={toastDoc}
                sharedTags={toastSharedTags}
                visible={showToast}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
.notification-card {
  position: absolute;
  inset: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 18px 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(83,19,36,0.94), rgba(62,20,33,0.9));
  border: 1px solid rgba(175,117,92,0.7);
  box-shadow: 0 25px 80px -50px rgba(0,0,0,0.75), 0 0 0 1px rgba(237,217,212,0.08) inset;
  color: #f3e3df;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.35s ease, transform 0.35s ease;
  backdrop-filter: blur(10px);
}
.notification-card-visible {
  opacity: 1;
  transform: translateY(0);
}
.notification-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(247,226,219,0.06);
  border: 1px solid rgba(247,226,219,0.08);
}
.notification-card-kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 11px;
  color: #f7e2dbb3;
}
.notification-card-title {
  margin: 4px 0 0;
  font-size: 15px;
  color: #f7e2db;
  letter-spacing: -0.01em;
}
.notification-card-chip {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(247,226,219,0.25);
  background: rgba(247,226,219,0.08);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f7e2db;
}
.notification-card-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.notification-card-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(247,226,219,0.04);
  border: 1px solid rgba(247,226,219,0.08);
}
.notification-card-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #f7e2db, #af755c);
  margin-top: 5px;
}
.notification-card-label {
  margin: 0 0 6px;
  font-weight: 700;
  font-size: 13px;
  color: #f7e2db;
  letter-spacing: 0.02em;
}
.notification-card-text {
  margin: 0;
  color: #f7e2dbcc;
  font-size: 13px;
  line-height: 1.5;
}
.notification-card-muted {
  color: #f7e2db99;
  font-size: 13px;
}
.notification-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.notification-card-tag {
  padding: 4px 8px;
  border-radius: 10px;
  border: 1px solid rgba(99,243,183,0.4);
  background: rgba(99,243,183,0.12);
  color: #c6ffea;
  font-size: 12px;
}
*/
