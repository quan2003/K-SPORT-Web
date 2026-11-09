"use client";

import { useState, useEffect } from "react";

type MatchMode = "kumite" | "kata";

interface ScoreboardProps {
  initialMode?: MatchMode;
  tournamentTitle?: string;
  categoryTitleKumite?: string;
  categoryTitleKata?: string;
  interactive?: boolean;
}

export function TournamentScoreboard({
  initialMode = "kumite",
  tournamentTitle = "GIẢI VÔ ĐỊCH CÁC CÂU LẠC BỘ KARATE TỈNH PHÚ THỌ NĂM 2026",
  categoryTitleKumite = "KUMITE CÁ NHÂN NAM DƯỚI 14 TUỔI – 40KG",
  categoryTitleKata = "KATA CÁ NHÂN NAM DƯỚI 14 TUỔI",
  interactive = true,
}: ScoreboardProps) {
  const [mode, setMode] = useState<MatchMode>(initialMode);
  const [tatami, setTatami] = useState<number>(2);

  // Standard official competition designations (AKA & AO only)
  const aoName = "AO";
  const akaName = "AKA";

  // Kumite Score & Warnings
  const [blueScore, setBlueScore] = useState<number>(0);
  const [redScore, setRedScore] = useState<number>(0);
  const [blueWarnings, setBlueWarnings] = useState<{ [key: string]: boolean }>({
    C1: false,
    C2: false,
    C3: false,
    HC: false,
    H: false,
  });
  const [redWarnings, setRedWarnings] = useState<{ [key: string]: boolean }>({
    C1: false,
    C2: false,
    C3: false,
    HC: false,
    H: false,
  });

  // Timer state (in deciseconds: 3 mins = 1800 ds)
  const [timeLeft, setTimeLeft] = useState<number>(1800);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTimer = (ds: number) => {
    const totalSeconds = Math.floor(ds / 10);
    const deci = ds % 10;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${deci}`;
  };

  const toggleBlueWarning = (code: string) => {
    setBlueWarnings((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleRedWarning = (code: string) => {
    setRedWarnings((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const resetAll = () => {
    setBlueScore(0);
    setRedScore(0);
    setTimeLeft(1800);
    setIsRunning(false);
    setBlueWarnings({ C1: false, C2: false, C3: false, HC: false, H: false });
    setRedWarnings({ C1: false, C2: false, C3: false, HC: false, H: false });
  };

  return (
    <div className="ks-scoreboard-system">
      {/* Operator Toolbar (Clean controls outside the LED display) */}
      {interactive && (
        <div className="ks-scoreboard-controls-bar">
          <div className="ks-controls-group">
            <span className="ks-controls-label">Thể thức:</span>
            <div className="ks-mode-switcher">
              <button
                type="button"
                className={`ks-mode-btn ${mode === "kumite" ? "is-active" : ""}`}
                onClick={() => setMode("kumite")}
              >
                KUMITE (Đối kháng)
              </button>
              <button
                type="button"
                className={`ks-mode-btn ${mode === "kata" ? "is-active" : ""}`}
                onClick={() => setMode("kata")}
              >
                KATA (Quyền)
              </button>
            </div>
          </div>

          <div className="ks-controls-group">
            <span className="ks-controls-label">Thảm:</span>
            <div className="ks-tatami-selector">
              {[1, 2, 3, 4].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`ks-tatami-btn ${tatami === t ? "is-active" : ""}`}
                  onClick={() => setTatami(t)}
                >
                  Thảm {t}
                </button>
              ))}
            </div>
          </div>

          {mode === "kumite" && (
            <div className="ks-controls-group ks-score-controls-group">
              <span className="ks-controls-label">Điểm Ao:</span>
              <button
                type="button"
                className="ks-score-adj-btn blue"
                onClick={() => setBlueScore((s) => s + 1)}
              >
                +1
              </button>
              <button
                type="button"
                className="ks-score-adj-btn blue"
                onClick={() => setBlueScore((s) => Math.max(0, s - 1))}
              >
                -1
              </button>

              <span className="ks-controls-label" style={{ marginLeft: "10px" }}>
                Điểm Aka:
              </span>
              <button
                type="button"
                className="ks-score-adj-btn red"
                onClick={() => setRedScore((s) => s + 1)}
              >
                +1
              </button>
              <button
                type="button"
                className="ks-score-adj-btn red"
                onClick={() => setRedScore((s) => Math.max(0, s - 1))}
              >
                -1
              </button>
            </div>
          )}

          {mode === "kumite" && (
            <div className="ks-controls-group ks-timer-controls">
              <button
                type="button"
                className={`ks-timer-btn ${isRunning ? "pause" : "start"}`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? "⏸ Tạm dừng" : "▶ Đếm giờ"}
              </button>
              <button
                type="button"
                className="ks-timer-btn reset"
                onClick={() => {
                  setTimeLeft(1800);
                  setIsRunning(false);
                }}
              >
                ↺ Đặt lại 03:00
              </button>
              <button type="button" className="ks-timer-btn clear-all" onClick={resetAll}>
                Làm mới
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Scoreboard Screen (16:9 aspect ratio standard for tournament LED — Flat, Razor Sharp, No Glow) */}
      <div className="ks-scoreboard-display">
        {/* Top tournament and category header */}
        <header className="ks-sb-header">
          <p className="ks-sb-tournament-name">{tournamentTitle}</p>
          <h2 className="ks-sb-category-name">
            {mode === "kumite" ? categoryTitleKumite : categoryTitleKata}
          </h2>
          <div className="ks-sb-header-rule" />
        </header>

        {/* ================= KUMITE MODE ================= */}
        {mode === "kumite" && (
          <div className="ks-sb-body kumite-layout">
            {/* Upper Row: AO (BLUE) */}
            <div className="ks-sb-row ao-row">
              <div className="ks-sb-competitor-info">
                <h3 className="ks-sb-name ao-text">{aoName}</h3>
                <div className="ks-sb-warning-bar">
                  <span className="ks-warning-label ao-text">WARNING</span>
                  <div className="ks-warning-pills">
                    {["C1", "C2", "C3", "HC", "H"].map((code) => (
                      <button
                        key={code}
                        type="button"
                        className={`ks-pill ao-pill ${blueWarnings[code] ? "is-active" : ""}`}
                        onClick={() => interactive && toggleBlueWarning(code)}
                        title={`Lỗi ${code} (Xanh)`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ao Score */}
              <div className="ks-sb-score-container">
                <span className="ks-sb-score ao-score">{blueScore}</span>
              </div>
            </div>

            {/* Lower Row: AKA (RED) */}
            <div className="ks-sb-row aka-row">
              <div className="ks-sb-competitor-info">
                <h3 className="ks-sb-name aka-text">{akaName}</h3>
                <div className="ks-sb-warning-bar">
                  <span className="ks-warning-label aka-text">WARNING</span>
                  <div className="ks-warning-pills">
                    {["C1", "C2", "C3", "HC", "H"].map((code) => (
                      <button
                        key={code}
                        type="button"
                        className={`ks-pill aka-pill ${redWarnings[code] ? "is-active" : ""}`}
                        onClick={() => interactive && toggleRedWarning(code)}
                        title={`Lỗi ${code} (Đỏ)`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aka Score */}
              <div className="ks-sb-score-container">
                <span className="ks-sb-score aka-score">{redScore}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= KATA MODE ================= */}
        {mode === "kata" && (
          <div className="ks-sb-body kata-layout">
            {/* Aka Row (Red on Top in Kata standard) */}
            <div className="ks-kata-row aka-side">
              <div className="ks-kata-color-block red-block" />
              <div className="ks-kata-athlete-meta">
                <h3 className="ks-kata-name">{akaName}</h3>
              </div>
            </div>

            {/* Ao Row (Blue on Bottom in Kata standard) */}
            <div className="ks-kata-row ao-side">
              <div className="ks-kata-color-block blue-block" />
              <div className="ks-kata-athlete-meta">
                <h3 className="ks-kata-name">{aoName}</h3>
              </div>
            </div>
          </div>
        )}

        {/* ================= BOTTOM BAR ================= */}
        <footer className="ks-sb-footer">
          {/* Centered Tatami & Timer cluster */}
          <div className="ks-sb-center-cluster">
            <span className={`ks-sb-tatami-center ${mode === "kata" ? "is-kata" : ""}`}>
              THẢM {tatami}
            </span>
            {mode === "kumite" && (
              <span className="ks-sb-timer-digits">{formatTimer(timeLeft)}</span>
            )}
          </div>
        </footer>
      </div>

      {/* Illustrative Note */}
      <p className="ks-sb-illustration-note">
        * Hình ảnh chỉ mang tính chất minh họa
      </p>
    </div>
  );
}
