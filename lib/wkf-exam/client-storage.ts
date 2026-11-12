"use client";

import { useSyncExternalStore } from "react";
import type {
  ExamAttempt,
  ExamCategory,
  ExamResultSummary,
  MistakeRecord,
  PracticeAnswerCheckResult,
  PublicQuestionView,
} from "./types";

const emptySubscribe = () => () => {};

export function useIsClientHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const ANON_OWNER_KEY = "ksport_wkf_exam_v1_owner_id";
const ATTEMPTS_STORAGE_KEY = "ksport_wkf_exam_v1_attempts";
const MISTAKES_STORAGE_KEY = "ksport_wkf_exam_v1_mistakes";

export function getOrCreateLocalOwnerId(): string {
  if (typeof window === "undefined") return "anon-server";
  try {
    const existing = window.localStorage.getItem(ANON_OWNER_KEY);
    if (existing && existing.trim()) return existing;
    const generated = `anon-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    window.localStorage.setItem(ANON_OWNER_KEY, generated);
    return generated;
  } catch {
    return "anon-fallback";
  }
}

export function loadLocalAttempts(): Record<string, ExamAttempt> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ExamAttempt>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLocalAttempt(attempt: ExamAttempt): void {
  if (typeof window === "undefined") return;
  try {
    const map = loadLocalAttempts();
    map[attempt.attemptId] = attempt;
    window.localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export function getLocalAttempt(attemptId: string): ExamAttempt | null {
  const map = loadLocalAttempts();
  return map[attemptId] ?? null;
}

export function listLocalAttemptsSorted(): ExamAttempt[] {
  const map = loadLocalAttempts();
  return Object.values(map).sort(
    (a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt)
  );
}

export function getLastAttemptForScope(
  category: ExamCategory | "mixed"
): ExamAttempt | null {
  const list = listLocalAttemptsSorted();
  return list.find((a) => a.category === category) ?? null;
}

export function loadLocalMistakes(): Record<string, MistakeRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MISTAKES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, MistakeRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLocalMistakes(map: Record<string, MistakeRecord>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export function recordPracticeFeedbackInMistakes(
  question: PublicQuestionView,
  feedback: PracticeAnswerCheckResult,
  bankVersion: string
): void {
  const map = loadLocalMistakes();
  const key = `${question.category}:${question.id}`;
  const existing = map[key];

  if (!feedback.isCorrect) {
    map[key] = {
      key,
      questionId: question.id,
      category: question.category,
      questionNumber: question.questionNumber,
      bankVersion,
      textEn: question.textEn,
      textVi: question.textVi,
      translationVerified: question.translationVerified,
      wrongCount: (existing?.wrongCount ?? 0) + 1,
      correctCount: existing?.correctCount ?? 0,
      lastSelectedAnswer: feedback.selectedAnswer,
      lastResult: "wrong",
      lastAnsweredAt: feedback.checkedAt,
      resolved: false,
    };
  } else if (existing) {
    map[key] = {
      ...existing,
      correctCount: existing.correctCount + 1,
      lastSelectedAnswer: feedback.selectedAnswer,
      lastResult: "correct",
      lastAnsweredAt: feedback.checkedAt,
      resolved: true,
    };
  }
  saveLocalMistakes(map);
}

export function recordExamResultInMistakes(result: ExamResultSummary): void {
  const map = loadLocalMistakes();
  for (const item of result.items) {
    if (item.selectedAnswer === null || item.status === "unverified") continue;
    // Skip if already recorded during Practice mode check
    const key = `${item.category}:${item.questionId}`;
    const existing = map[key];
    const isCorrect = item.status === "correct";

    if (!isCorrect) {
      map[key] = {
        key,
        questionId: item.questionId,
        category: item.category,
        questionNumber: item.questionNumber,
        bankVersion: result.bankVersion,
        textEn: item.textEn,
        textVi: item.textVi,
        translationVerified: item.translationVerified,
        wrongCount: (existing?.wrongCount ?? 0) + 1,
        correctCount: existing?.correctCount ?? 0,
        lastSelectedAnswer: item.selectedAnswer,
        lastResult: "wrong",
        lastAnsweredAt: result.completedAt,
        resolved: false,
      };
    } else if (existing) {
      map[key] = {
        ...existing,
        correctCount: existing.correctCount + 1,
        lastSelectedAnswer: item.selectedAnswer,
        lastResult: "correct",
        lastAnsweredAt: result.completedAt,
        resolved: true,
      };
    }
  }
  saveLocalMistakes(map);
}

export function listMistakesByFilter(options?: {
  category?: ExamCategory | "all";
  status?: "unresolved" | "resolved" | "all";
}): MistakeRecord[] {
  const map = loadLocalMistakes();
  const category = options?.category ?? "all";
  const status = options?.status ?? "all";

  return Object.values(map)
    .filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (status === "unresolved" && item.resolved) return false;
      if (status === "resolved" && !item.resolved) return false;
      return true;
    })
    .sort((a, b) => Date.parse(b.lastAnsweredAt) - Date.parse(a.lastAnsweredAt));
}

export type LearnerProgressOverview = {
  totalAttempts: number;
  completedAttemptsCount: number;
  inProgressAttempts: ExamAttempt[];
  latestCompletedAttempt: ExamAttempt | null;
  uniqueQuestionsStudied: number;
  kumiteQuestionsStudied: number;
  kataQuestionsStudied: number;
  averageAccuracyPercent: number | null;
  unresolvedMistakesCount: number;
  resolvedMistakesCount: number;
  unresolvedKumiteMistakesCount: number;
  unresolvedKataMistakesCount: number;
};

export function computeLearnerProgressOverview(): LearnerProgressOverview {
  const attempts = listLocalAttemptsSorted();
  const mistakes = Object.values(loadLocalMistakes());

  const inProgressAttempts = attempts.filter((a) => a.status === "in_progress");
  const completedAttempts = attempts.filter(
    (a) => a.status === "completed" && a.result
  );

  const studiedSet = new Set<string>();
  const kumiteStudied = new Set<string>();
  const kataStudied = new Set<string>();

  for (const att of attempts) {
    for (const qId of Object.keys(att.answers)) {
      studiedSet.add(qId);
      if (qId.startsWith("kumite-")) kumiteStudied.add(qId);
      if (qId.startsWith("kata-")) kataStudied.add(qId);
    }
  }

  let averageAccuracyPercent: number | null = null;
  if (completedAttempts.length > 0) {
    const sum = completedAttempts.reduce(
      (acc, att) => acc + (att.result?.accuracyPercent ?? 0),
      0
    );
    averageAccuracyPercent = Number((sum / completedAttempts.length).toFixed(1));
  }

  const unresolved = mistakes.filter((m) => !m.resolved);
  const resolved = mistakes.filter((m) => m.resolved);

  return {
    totalAttempts: attempts.length,
    completedAttemptsCount: completedAttempts.length,
    inProgressAttempts,
    latestCompletedAttempt: completedAttempts[0] ?? null,
    uniqueQuestionsStudied: studiedSet.size,
    kumiteQuestionsStudied: kumiteStudied.size,
    kataQuestionsStudied: kataStudied.size,
    averageAccuracyPercent,
    unresolvedMistakesCount: unresolved.length,
    resolvedMistakesCount: resolved.length,
    unresolvedKumiteMistakesCount: unresolved.filter(
      (m) => m.category === "kumite"
    ).length,
    unresolvedKataMistakesCount: unresolved.filter((m) => m.category === "kata")
      .length,
  };
}
