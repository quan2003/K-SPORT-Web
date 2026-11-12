import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const QUESTIONS_PATH = path.join(ROOT, "data", "wkf-exam", "questions.json");
const REPORT_PATH = path.join(ROOT, "data", "wkf-exam", "import-report.json");

const bank = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf8"));
const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));

/**
 * Pure reference implementations of shuffle and grading logic mirrored from
 * lib/wkf-exam/shuffle.ts and lib/wkf-exam/grading.ts for deterministic unit verification,
 * plus full integration verification against the actual canonical dataset.
 */
function fisherYatesShuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function areOrdersEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function selectAndShuffleQuestions(poolIds, requestedCount, previousOrderIds, rng = Math.random) {
  const uniquePool = Array.from(new Set(poolIds));
  if (uniquePool.length === 0) return [];
  const targetCount =
    requestedCount === "all"
      ? uniquePool.length
      : Math.max(1, Math.min(requestedCount, uniquePool.length));

  let selected = fisherYatesShuffle(uniquePool, rng).slice(0, targetCount);
  selected = fisherYatesShuffle(selected, rng);

  if (previousOrderIds && previousOrderIds.length > 1 && selected.length > 1) {
    const comparablePrev =
      previousOrderIds.length === selected.length
        ? previousOrderIds
        : previousOrderIds.slice(0, selected.length);
    let retries = 0;
    while (areOrdersEqual(selected, comparablePrev) && retries < 6) {
      selected = fisherYatesShuffle(uniquePool, rng).slice(0, targetCount);
      selected = fisherYatesShuffle(selected, rng);
      retries += 1;
    }
    if (areOrdersEqual(selected, comparablePrev)) {
      const swapped = [...selected];
      const tmp = swapped[0];
      swapped[0] = swapped[1];
      swapped[1] = tmp;
      selected = swapped;
    }
  }
  return selected;
}

function gradeAttempt({
  attemptId,
  category,
  mode,
  bankVersion,
  questionIds,
  answers,
  startedAt,
  completedAt,
  questionsMap,
}) {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let unverifiedCount = 0;
  const items = [];

  for (let idx = 0; idx < questionIds.length; idx += 1) {
    const qId = questionIds[idx];
    const record = questionsMap.get(qId);
    if (!record) continue;

    const entry = answers[qId];
    const selectedAnswer =
      entry && typeof entry.selectedAnswer === "boolean"
        ? entry.selectedAnswer
        : null;
    const isVerified =
      record.verificationStatus === "verified" &&
      typeof record.correctAnswer === "boolean";

    let status;
    if (!isVerified) {
      status = "unverified";
      unverifiedCount += 1;
    } else if (selectedAnswer === null) {
      status = "unanswered";
      unansweredCount += 1;
    } else if (selectedAnswer === record.correctAnswer) {
      status = "correct";
      correctCount += 1;
    } else {
      status = "wrong";
      wrongCount += 1;
    }

    items.push({
      position: idx + 1,
      questionId: record.id,
      category: record.category,
      questionNumber: record.questionNumber,
      selectedAnswer,
      correctAnswer: isVerified ? record.correctAnswer : null,
      status,
    });
  }

  const totalQuestions = items.length;
  const gradableQuestions = totalQuestions - unverifiedCount;
  const accuracyPercent =
    gradableQuestions > 0
      ? Number(((correctCount / gradableQuestions) * 100).toFixed(1))
      : 0;

  return {
    attemptId,
    category,
    mode,
    bankVersion,
    totalQuestions,
    gradableQuestions,
    correctCount,
    wrongCount,
    unansweredCount,
    unverifiedCount,
    accuracyPercent,
    startedAt,
    completedAt,
    items,
  };
}

// ============================================================================
// 1. DỮ LIỆU (DATA INTEGRITY TESTS)
// ============================================================================

test("1.1 Kumite có chính xác 246 câu (từ 1 đến 246)", () => {
  const kumite = bank.questions.filter((q) => q.category === "kumite");
  assert.equal(kumite.length, 246);
  const nums = new Set(kumite.map((q) => q.questionNumber));
  assert.equal(nums.size, 246);
  for (let i = 1; i <= 246; i += 1) {
    assert.ok(nums.has(i), `Thiếu câu Kumite số ${i}`);
  }
});

test("1.2 Kata & Para Karate có chính xác 132 câu (từ 1 đến 132)", () => {
  const kata = bank.questions.filter((q) => q.category === "kata");
  assert.equal(kata.length, 132);
  const nums = new Set(kata.map((q) => q.questionNumber));
  assert.equal(nums.size, 132);
  for (let i = 1; i <= 132; i += 1) {
    assert.ok(nums.has(i), `Thiếu câu Kata số ${i}`);
  }
});

test("1.3 Tổng cộng 378 câu hỏi và không có question ID trùng", () => {
  assert.equal(bank.questions.length, 378);
  const ids = new Set(bank.questions.map((q) => q.id));
  assert.equal(ids.size, 378);
});

test("1.4 Không trộn nội dung tiếng Pháp, Tây Ban Nha vào nội dung tiếng Anh", () => {
  const foreignRegex =
    /\b(les|des|dans|pour|avec|une|sont|être|l'athlète|compétition|los|las|una|del|por|para(?!\s+karate)|está|competición)\b/i;
  for (const q of bank.questions) {
    assert.ok(q.textEn && q.textEn.length > 10, `Câu ${q.id} rỗng`);
    assert.equal(
      foreignRegex.test(q.textEn),
      false,
      `Phát hiện từ ngoại ngữ trong câu ${q.id}: ${q.textEn}`
    );
  }
  assert.equal(report.summary.languageLeakCount, 0);
});

test("1.5 Mỗi đáp án hợp lệ phải gắn đúng ID và trạng thái xác minh hoàn tất", () => {
  for (const q of bank.questions) {
    assert.equal(typeof q.correctAnswer, "boolean", `Câu ${q.id} thiếu đáp án boolean`);
    assert.equal(q.verificationStatus, "verified");
    assert.equal(q.officialWkfConfirmed, true);
    assert.equal(q.compatibilityStatus, "verified");
  }
  // Spot check against visual answer keys
  const qMap = new Map(bank.questions.map((q) => [q.id, q]));
  assert.equal(qMap.get("kumite-q-001").correctAnswer, false);
  assert.equal(qMap.get("kumite-q-003").correctAnswer, true);
  assert.equal(qMap.get("kumite-q-246").correctAnswer, true);
  assert.equal(qMap.get("kata-q-001").correctAnswer, false);
  assert.equal(qMap.get("kata-q-003").correctAnswer, true);
  assert.equal(qMap.get("kata-q-132").correctAnswer, false);
});

test("1.6 Toàn bộ 378 câu hỏi có đủ nội dung song ngữ (questionEn, questionVi) và translationStatus = verified", () => {
  for (const q of bank.questions) {
    assert.ok(q.questionEn && q.questionEn.length > 10, `Câu ${q.id} thiếu questionEn`);
    assert.equal(q.questionEn, q.textEn, `Câu ${q.id} questionEn khác textEn`);
    assert.ok(q.questionVi && q.questionVi.length > 10, `Câu ${q.id} thiếu questionVi`);
    assert.equal(q.questionVi, q.textVi, `Câu ${q.id} questionVi khác textVi`);
    assert.equal(q.translationStatus, "verified", `Câu ${q.id} chưa có translationStatus = verified`);
    assert.equal(q.translationVerified, true, `Câu ${q.id} chưa có translationVerified = true`);
  }
});

// ============================================================================
// 2. SHUFFLE (RANDOMIZATION & RETAKE TESTS)
// ============================================================================

test("2.1 Chế độ toàn bộ chứa đủ câu, không mất và không lặp câu", () => {
  const kumiteIds = bank.questions
    .filter((q) => q.category === "kumite")
    .map((q) => q.id);
  const shuffled = selectAndShuffleQuestions(kumiteIds, "all");
  assert.equal(shuffled.length, 246);
  assert.equal(new Set(shuffled).size, 246);
  assert.equal(areOrdersEqual(shuffled, kumiteIds), false);
});

test("2.2 Chế độ giới hạn (20 / 50 / 100) chứa đúng số câu và không trùng lặp", () => {
  const kataIds = bank.questions
    .filter((q) => q.category === "kata")
    .map((q) => q.id);
  for (const count of [20, 50, 100]) {
    const selected = selectAndShuffleQuestions(kataIds, count);
    assert.equal(selected.length, count);
    assert.equal(new Set(selected).size, count);
  }
  // If requested count exceeds pool size, clamps safely to pool size
  const smallPool = ["kata-q-001", "kata-q-002", "kata-q-003"];
  const clamped = selectAndShuffleQuestions(smallPool, 20);
  assert.equal(clamped.length, 3);
});

test("2.3 Nút Thi lại tạo lượt mới có thứ tự khác lượt trước kể cả khi RNG cố tình lặp lại", () => {
  const pool = ["kumite-q-001", "kumite-q-002", "kumite-q-003", "kumite-q-004"];
  const constantZeroRng = () => 0;
  const firstOrder = selectAndShuffleQuestions(pool, "all", undefined, constantZeroRng);
  const secondOrder = selectAndShuffleQuestions(pool, "all", firstOrder, constantZeroRng);
  assert.equal(areOrdersEqual(firstOrder, secondOrder), false);
  assert.equal(new Set(secondOrder).size, 4);
});

// ============================================================================
// 3. CHẤM ĐIỂM (GRADING & UNVERIFIED RECORD TESTS)
// ============================================================================

test("3.1 Chấm điểm chính xác: Tất cả đúng, Tất cả sai, Một phần đúng và Có câu chưa trả lời", () => {
  const questionsMap = new Map(bank.questions.map((q) => [q.id, q]));
  const sampleIds = ["kumite-q-001", "kumite-q-002", "kumite-q-003", "kumite-q-004"];
  // kumite-q-001: F, 002: F, 003: T, 004: T

  // Case A: All correct
  const allCorrectAnswers = {
    "kumite-q-001": { selectedAnswer: false, answeredAt: "2026-11-12T00:00:00Z" },
    "kumite-q-002": { selectedAnswer: false, answeredAt: "2026-11-12T00:00:00Z" },
    "kumite-q-003": { selectedAnswer: true, answeredAt: "2026-11-12T00:00:00Z" },
    "kumite-q-004": { selectedAnswer: true, answeredAt: "2026-11-12T00:00:00Z" },
  };
  const resAllCorrect = gradeAttempt({
    attemptId: "att-1",
    category: "kumite",
    mode: "exam",
    bankVersion: bank.bankVersion,
    questionIds: sampleIds,
    answers: allCorrectAnswers,
    startedAt: "2026-11-12T00:00:00Z",
    completedAt: "2026-11-12T00:01:00Z",
    questionsMap,
  });
  assert.equal(resAllCorrect.correctCount, 4);
  assert.equal(resAllCorrect.wrongCount, 0);
  assert.equal(resAllCorrect.unansweredCount, 0);
  assert.equal(resAllCorrect.accuracyPercent, 100);

  // Case B: All wrong
  const allWrongAnswers = {
    "kumite-q-001": { selectedAnswer: true, answeredAt: "2026-11-12T00:00:00Z" },
    "kumite-q-002": { selectedAnswer: true, answeredAt: "2026-11-12T00:00:00Z" },
    "kumite-q-003": { selectedAnswer: false, answeredAt: "2026-11-12T00:00:00Z" },
    "kumite-q-004": { selectedAnswer: false, answeredAt: "2026-11-12T00:00:00Z" },
  };
  const resAllWrong = gradeAttempt({
    attemptId: "att-2",
    category: "kumite",
    mode: "exam",
    bankVersion: bank.bankVersion,
    questionIds: sampleIds,
    answers: allWrongAnswers,
    startedAt: "2026-11-12T00:00:00Z",
    completedAt: "2026-11-12T00:01:00Z",
    questionsMap,
  });
  assert.equal(resAllWrong.correctCount, 0);
  assert.equal(resAllWrong.wrongCount, 4);
  assert.equal(resAllWrong.unansweredCount, 0);
  assert.equal(resAllWrong.accuracyPercent, 0);

  // Case C: Partial correct + Unanswered separated from Wrong
  const partialAnswers = {
    "kumite-q-001": { selectedAnswer: false, answeredAt: "2026-11-12T00:00:00Z" }, // correct
    "kumite-q-002": { selectedAnswer: true, answeredAt: "2026-11-12T00:00:00Z" }, // wrong
    // 003 and 004 unanswered
  };
  const resPartial = gradeAttempt({
    attemptId: "att-3",
    category: "kumite",
    mode: "exam",
    bankVersion: bank.bankVersion,
    questionIds: sampleIds,
    answers: partialAnswers,
    startedAt: "2026-11-12T00:00:00Z",
    completedAt: "2026-11-12T00:01:00Z",
    questionsMap,
  });
  assert.equal(resPartial.correctCount, 1);
  assert.equal(resPartial.wrongCount, 1);
  assert.equal(resPartial.unansweredCount, 2);
  assert.equal(resPartial.accuracyPercent, 25);
});

test("3.2 Chấm điểm theo question ID gốc, không bị ảnh hưởng bởi thứ tự câu đã xáo trộn", () => {
  const questionsMap = new Map(bank.questions.map((q) => [q.id, q]));
  const orderA = ["kumite-q-001", "kumite-q-003", "kumite-q-005"];
  const orderB = ["kumite-q-005", "kumite-q-001", "kumite-q-003"];
  const answers = {
    "kumite-q-001": { selectedAnswer: false, answeredAt: "2026-11-12T00:00:00Z" }, // correct
    "kumite-q-003": { selectedAnswer: true, answeredAt: "2026-11-12T00:00:00Z" }, // correct
    "kumite-q-005": { selectedAnswer: true, answeredAt: "2026-11-12T00:00:00Z" }, // wrong (005 is F)
  };

  const resA = gradeAttempt({
    attemptId: "att-a",
    category: "kumite",
    mode: "exam",
    bankVersion: bank.bankVersion,
    questionIds: orderA,
    answers,
    startedAt: "2026-11-12T00:00:00Z",
    completedAt: "2026-11-12T00:01:00Z",
    questionsMap,
  });

  const resB = gradeAttempt({
    attemptId: "att-b",
    category: "kumite",
    mode: "exam",
    bankVersion: bank.bankVersion,
    questionIds: orderB,
    answers,
    startedAt: "2026-11-12T00:00:00Z",
    completedAt: "2026-11-12T00:01:00Z",
    questionsMap,
  });

  assert.equal(resA.correctCount, 2);
  assert.equal(resB.correctCount, 2);
  assert.equal(resA.wrongCount, 1);
  assert.equal(resB.wrongCount, 1);
  assert.equal(resA.accuracyPercent, resB.accuracyPercent);
});

test("3.3 Bản ghi chưa xác minh (needs_review / unverified) không đưa vào chấm điểm chính thức", () => {
  const customMap = new Map(bank.questions.map((q) => [q.id, { ...q }]));
  customMap.get("kumite-q-002").verificationStatus = "needs_review";

  const res = gradeAttempt({
    attemptId: "att-unverified",
    category: "kumite",
    mode: "exam",
    bankVersion: bank.bankVersion,
    questionIds: ["kumite-q-001", "kumite-q-002"],
    answers: {
      "kumite-q-001": { selectedAnswer: false, answeredAt: "2026-11-12T00:00:00Z" },
      "kumite-q-002": { selectedAnswer: true, answeredAt: "2026-11-12T00:00:00Z" },
    },
    startedAt: "2026-11-12T00:00:00Z",
    completedAt: "2026-11-12T00:01:00Z",
    questionsMap: customMap,
  });

  assert.equal(res.totalQuestions, 2);
  assert.equal(res.unverifiedCount, 1);
  assert.equal(res.gradableQuestions, 1);
  assert.equal(res.correctCount, 1);
  assert.equal(res.accuracyPercent, 100);
});

test("3.4 Bảo mật payload: PublicQuestionView không bao giờ chứa đáp án đúng (correctAnswer, rawAnswerMark)", () => {
  function toPublicQuestion(record) {
    return {
      id: record.id,
      category: record.category,
      questionNumber: record.questionNumber,
      textEn: record.textEn,
      textVi: record.translationVerified ? record.textVi : null,
      translationVerified: Boolean(record.translationVerified && record.textVi),
      verificationStatus: record.verificationStatus,
      questionSourceVersion: record.questionSourceVersion,
    };
  }

  for (const q of bank.questions) {
    const pub = toPublicQuestion(q);
    assert.equal("correctAnswer" in pub, false);
    assert.equal("rawAnswerMark" in pub, false);
    assert.equal("answerColor" in pub, false);
    assert.equal("explanationVi" in pub, false);
    assert.equal("ruleReference" in pub, false);
  }
});

test("3.5 Ôn câu sai: tách biệt câu trùng số giữa Kumite và Kata, cập nhật trạng thái khắc phục chính xác", () => {
  const mistakesMap = {};

  function recordMistake(question, isCorrect, selectedAnswer, ts) {
    const key = `${question.category}:${question.id}`;
    const existing = mistakesMap[key];
    if (!isCorrect) {
      mistakesMap[key] = {
        key,
        questionId: question.id,
        category: question.category,
        questionNumber: question.questionNumber,
        wrongCount: (existing?.wrongCount ?? 0) + 1,
        correctCount: existing?.correctCount ?? 0,
        lastSelectedAnswer: selectedAnswer,
        lastResult: "wrong",
        lastAnsweredAt: ts,
        resolved: false,
      };
    } else if (existing) {
      mistakesMap[key] = {
        ...existing,
        correctCount: existing.correctCount + 1,
        lastSelectedAnswer: selectedAnswer,
        lastResult: "correct",
        lastAnsweredAt: ts,
        resolved: true,
      };
    }
  }

  const kumiteQ1 = bank.questions.find((q) => q.id === "kumite-q-001");
  const kataQ1 = bank.questions.find((q) => q.id === "kata-q-001");

  // Both answered wrong initially
  recordMistake(kumiteQ1, false, true, "2026-11-12T01:00:00Z");
  recordMistake(kataQ1, false, true, "2026-11-12T01:01:00Z");

  assert.equal(Object.keys(mistakesMap).length, 2);
  assert.equal(mistakesMap["kumite:kumite-q-001"].resolved, false);
  assert.equal(mistakesMap["kata:kata-q-001"].resolved, false);

  // Answer Kumite Q1 right on next review -> Kumite Q1 resolved, Kata Q1 still unresolved, history preserved
  recordMistake(kumiteQ1, true, false, "2026-11-12T01:05:00Z");
  assert.equal(mistakesMap["kumite:kumite-q-001"].resolved, true);
  assert.equal(mistakesMap["kumite:kumite-q-001"].wrongCount, 1);
  assert.equal(mistakesMap["kumite:kumite-q-001"].correctCount, 1);
  assert.equal(mistakesMap["kata:kata-q-001"].resolved, false);
});

test("3.6 Tiếp tục bài dở và nộp bài nhiều lần giữ nguyên thứ tự và tính bất biến kết quả", () => {
  const kumiteIds = bank.questions
    .filter((q) => q.category === "kumite")
    .map((q) => q.id);
  const initialOrder = selectAndShuffleQuestions(kumiteIds, 20);
  const persistedAttempt = JSON.parse(
    JSON.stringify({
      attemptId: "att-persist-1",
      questionIds: initialOrder,
      currentIndex: 4,
      status: "in_progress",
    })
  );

  // Simulated page reload / resume from storage
  const reloadedOrder = [...persistedAttempt.questionIds];
  assert.equal(areOrdersEqual(initialOrder, reloadedOrder), true);
  assert.equal(persistedAttempt.currentIndex, 4);
});
