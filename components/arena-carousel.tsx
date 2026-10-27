"use client";

import { useState } from "react";
import type { Match } from "@/lib/public-data";
import { EmptyState } from "@/components/empty-state";

export function ArenaCarousel({ matches }: { matches: Match[] }) {
  const [active, setActive] = useState(0);

  if (matches.length === 0) {
    return (
      <div className="arena-console arena-empty" data-ui data-reveal>
        <div className="arena-empty-head"><strong>K-SPORT</strong><span>Trung tâm trận đấu</span></div>
        <EmptyState title="Chưa có trận đấu được công bố" description="Lịch, tatami và trạng thái trận đấu sẽ được đồng bộ từ hệ thống điều hành." compact />
      </div>
    );
  }

  const current = matches[active];
  return (
    <div className="arena-console" data-ui data-reveal>
      <div className="arena-focus-row" key={current.id}>
        <div className="arena-time"><time>{current.time}</time><span>Tatami {current.tatami}</span></div>
        <div className="arena-category"><strong>{current.category}</strong><span>{current.state}</span></div>
        <div className="arena-fighter red-fighter"><span><small>Aka</small><strong>{current.red}</strong></span></div>
        <div className="arena-score"><b>{current.redScore ?? "–"}</b><span>:</span><b>{current.blueScore ?? "–"}</b></div>
        <div className="arena-fighter blue-fighter"><span><small>Ao</small><strong>{current.blue}</strong></span></div>
      </div>
      <div className="arena-queue" aria-label="Chọn trận đấu">
        {matches.map((match, index) => <button type="button" aria-pressed={active === index} onClick={() => setActive(index)} key={match.id}><time>{match.time}</time><span>{match.category}</span><small>Tatami {match.tatami}</small></button>)}
      </div>
    </div>
  );
}
