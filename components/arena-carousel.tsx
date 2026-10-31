"use client";

import { useState } from "react";
import { getMatDisplayName, type Match } from "@/lib/public-data";
import { EmptyState } from "@/components/empty-state";

function compactCategory(category: string) {
  return category
    .replace(/^Kumite\s*/i, "")
    .replace(/cá nhân\s*/i, "")
    .replace(/\s*18 tuổi trở lên\s*/i, " ")
    .replace(/\s*[–-]\s*/g, " · ");
}

function displayCategory(category: string) {
  return category || compactCategory(category);
}

export function ArenaCarousel({ matches }: { matches: Match[] }) {
  const [active, setActive] = useState(0);

  if (matches.length === 0) {
    return (
      <div className="arena-console arena-empty" data-ui data-reveal>
        <div className="arena-empty-head"><strong>K-SPORT</strong><span>Trung tâm trận đấu</span></div>
        <EmptyState title="Chưa có trận đấu được công bố" description="Lịch, thông tin thảm và trạng thái trận đấu sẽ được đồng bộ từ hệ thống điều hành." compact />
      </div>
    );
  }

  const current = matches[active];
  const currentMat = getMatDisplayName(current.tatami);
  return (
    <div className="arena-console" data-ui data-reveal>
      <div className="arena-focus-row" key={current.id}>
        <div className="arena-time"><time>{current.time}</time><span>{currentMat}</span></div>
        <div className="arena-category"><strong title={current.category}>{displayCategory(current.category)}</strong><span>{current.state}</span></div>
        <div className="arena-fighter red-fighter"><span><small>Aka</small><strong>{current.red}</strong></span></div>
        <div className="arena-score"><b>{current.redScore ?? "–"}</b><span>:</span><b>{current.blueScore ?? "–"}</b></div>
        <div className="arena-fighter blue-fighter"><span><small>Ao</small><strong>{current.blue}</strong></span></div>
      </div>
      {matches.length > 1 ? <div className="arena-queue" aria-label="Chọn trận đấu">
        {matches.map((match, index) => {
          const mat = getMatDisplayName(match.tatami);
          return <button type="button" aria-label={`${match.time}, ${match.category}, ${mat}`} aria-pressed={active === index} onClick={() => setActive(index)} key={match.id}><time>{match.time}</time><span>{displayCategory(match.category)}</span><small>{mat}</small></button>;
        })}
      </div> : null}
    </div>
  );
}
