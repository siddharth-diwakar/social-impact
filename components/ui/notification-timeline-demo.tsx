import React, { useEffect, useMemo, useRef, useState } from "react";

type NotificationItem = {
  id: number;
  time: string;
  title: string;
  description: string;
  tag: string;
};

const timelineData: NotificationItem[] = [
  {
    id: 1,
    time: "8:05 AM",
    title: "New policy draft ingested",
    description: "Compliance bot tagged the upload as Employment & Safety.",
    tag: "Employment",
  },
  {
    id: 2,
    time: "12:30 PM",
    title: "Tagged teams alerted",
    description: "Managers under the same tag got a legal-change push.",
    tag: "Employment",
  },
  {
    id: 3,
    time: "5:45 PM",
    title: "Streak of responses",
    description: "Three acknowledgements logged; risk heatmap refreshed.",
    tag: "Employment",
  },
];

export default function NotificationTimelineDemo() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const schedule = useMemo(() => timelineData.map((_, i) => i), []);

  useEffect(() => {
    if (!isPlaying) return;

    setShowToast(false);
    setActiveIndex(0);

    const timers: NodeJS.Timeout[] = [];
    schedule.forEach((idx, step) => {
      timers.push(
        setTimeout(() => {
          setActiveIndex(idx);
        }, step * 950),
      );
    });

    // Show toast after last highlight
    timers.push(
      setTimeout(() => {
        setShowToast(true);
        setIsPlaying(false);
      }, schedule.length * 950 + 600),
    );

    // Clear timers on unmount/reset
    return () => timers.forEach((t) => clearTimeout(t));
  }, [isPlaying, schedule]);

  useEffect(() => {
    if (activeIndex === null) return;
    const el = itemRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex]);

  return (
    <div className="notification-demo-root">
      <div className="notification-header">
        <div>
          <p className="notification-kicker">Tag-aware compliance alerts</p>
          <h2>A day with our notification system</h2>
          <p className="notification-subtitle">
            Documents get tagged on ingest, and people with matching tags see changes instantly.
          </p>
        </div>
        <button
          className="notification-play-button"
          onClick={() => {
            if (isPlaying) return;
            setActiveIndex(null);
            setShowToast(false);
            setIsPlaying(true);
          }}
          disabled={isPlaying}
        >
          {isPlaying ? "Playing…" : "Play demo"}
        </button>
      </div>

      <div className="notification-timeline">
        <div className="notification-timeline-line" />
        {timelineData.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <div
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={`notification-item ${isActive ? "notification-item-active" : ""}`}
            >
              <div className="notification-bullet" aria-hidden />
              <div className="notification-meta">
                <span className="notification-time">{item.time}</span>
                <span className="notification-tag">{item.tag}</span>
              </div>
              <div className="notification-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`notification-toast ${showToast ? "notification-toast-visible" : ""}`}>
        <div className="notification-toast-dot" aria-hidden />
        <div>
          <p className="notification-toast-title">Live alert: Employment</p>
          <p className="notification-toast-body">New safety update tagged for your team.</p>
        </div>
      </div>
    </div>
  );
}

/*
.notification-demo-root {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  background: linear-gradient(135deg, rgba(125,50,39,0.18), rgba(62,20,33,0.14));
  border: 1px solid rgba(175,117,92,0.25);
  border-radius: 24px;
  box-shadow: 0 30px 120px -60px rgba(0,0,0,0.5);
  color: #f3e3df;
}
.notification-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}
.notification-header h2 {
  margin: 4px 0;
  font-size: 24px;
  letter-spacing: -0.02em;
}
.notification-kicker {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
  color: #f7e2dbcc;
}
.notification-subtitle {
  margin: 6px 0 0;
  color: #f7e2dbb3;
  font-size: 14px;
}
.notification-play-button {
  align-self: center;
  background: linear-gradient(120deg, #7d3227, #531324);
  color: #f7e2db;
  border: 1px solid rgba(175,117,92,0.6);
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 15px 45px -28px rgba(237,217,212,0.7);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}
.notification-play-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.notification-play-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 50px -30px rgba(237,217,212,0.8);
}
.notification-timeline {
  position: relative;
  margin-top: 28px;
  padding-left: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.notification-timeline-line {
  position: absolute;
  left: 14px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(247,226,219,0.25);
}
.notification-item {
  position: relative;
  padding: 12px 16px 14px 18px;
  border-radius: 14px;
  background: rgba(83,19,36,0.35);
  border: 1px solid transparent;
  transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
  box-shadow: 0 10px 40px -30px rgba(0,0,0,0.6);
}
.notification-item-active {
  transform: scale(1.02);
  background: rgba(125,50,39,0.5);
  border-color: rgba(175,117,92,0.6);
  box-shadow: 0 18px 60px -40px rgba(237,217,212,0.7);
}
.notification-bullet {
  position: absolute;
  left: -20px;
  top: 18px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #f7e2db, #af755c);
  box-shadow: 0 0 0 6px rgba(175,117,92,0.16);
}
.notification-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: #f7e2dbcc;
}
.notification-time {
  font-weight: 600;
}
.notification-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(175,117,92,0.2);
  border: 1px solid rgba(175,117,92,0.5);
  color: #f7e2db;
  font-size: 11px;
}
.notification-content h3 {
  margin: 0 0 4px;
  font-size: 16px;
  letter-spacing: -0.01em;
}
.notification-content p {
  margin: 0;
  color: #f7e2dbcc;
  font-size: 14px;
}
.notification-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(62,20,33,0.9);
  border: 1px solid rgba(175,117,92,0.6);
  box-shadow: 0 15px 50px -30px rgba(0,0,0,0.7);
  color: #f3e3df;
  opacity: 0;
  transform: translateY(12px);
  pointer-events: none;
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.notification-toast-visible {
  opacity: 1;
  transform: translateY(0);
}
.notification-toast-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #f7e2db, #af755c);
  box-shadow: 0 0 0 6px rgba(175,117,92,0.16);
  display: inline-block;
  margin-right: 10px;
}
.notification-toast-title {
  margin: 0 0 2px;
  font-weight: 700;
}
.notification-toast-body {
  margin: 0;
  color: #f7e2dbcc;
  font-size: 14px;
}
*/
