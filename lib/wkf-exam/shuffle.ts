import type { QuestionCountOption } from "./types";

/**
 * Uniform Fisher–Yates shuffle.
 * Never mutates the input array; always returns a new shuffled array.
 */
export function fisherYatesShuffle<T>(
  items: readonly T[],
  rng: () => number = Math.random
): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function areOrdersEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Selects the requested number of unique question IDs from the pool and shuffles their order.
 * Guarantees that:
 * 1. No duplicate question IDs appear in the returned list.
 * 2. When requestedCount is "all" or >= pool size, every question in the pool appears once.
 * 3. When previousOrderIds is provided and targetCount > 1, the resulting order is strictly
 *    different from previousOrderIds.
 */
export function selectAndShuffleQuestions(
  poolIds: readonly string[],
  requestedCount: QuestionCountOption,
  previousOrderIds?: readonly string[],
  rng: () => number = Math.random
): string[] {
  // Deduplicate pool while preserving initial stability
  const uniquePool = Array.from(new Set(poolIds));
  if (uniquePool.length === 0) {
    return [];
  }

  const targetCount =
    requestedCount === "all"
      ? uniquePool.length
      : Math.max(1, Math.min(requestedCount, uniquePool.length));

  let selected = fisherYatesShuffle(uniquePool, rng).slice(0, targetCount);
  selected = fisherYatesShuffle(selected, rng);

  if (previousOrderIds && previousOrderIds.length > 1 && selected.length > 1) {
    // Compare against the previous attempt's sequence (or its prefix if lengths match)
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

    // Deterministic fallback swap if random draws still collided
    if (areOrdersEqual(selected, comparablePrev)) {
      const swapped = [...selected];
      const temp = swapped[0];
      swapped[0] = swapped[1];
      swapped[1] = temp;
      selected = swapped;
    }
  }

  return selected;
}

