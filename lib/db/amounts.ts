import type { AmountRange } from "./types";

const BOUNDED_RANGE_PATTERN = /^\$([0-9,]+)\s*-\s*\$([0-9,]+)$/;
const OPEN_ENDED_RANGE_PATTERN = /^\$([0-9,]+)\s*\+$/;

const parseDollarInteger = (value: string) => {
  const parsed = Number.parseInt(value.replaceAll(",", ""), 10);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
};

export function parseFmpAmountRange(amount: string | null | undefined): AmountRange {
  const amountRaw = amount?.trim();

  if (!amountRaw) {
    return { amountRangeLow: null, amountRangeHigh: null };
  }

  const boundedMatch = BOUNDED_RANGE_PATTERN.exec(amountRaw);

  if (boundedMatch) {
    const amountRangeLow = parseDollarInteger(boundedMatch[1]);
    const amountRangeHigh = parseDollarInteger(boundedMatch[2]);

    if (
      amountRangeLow === null ||
      amountRangeHigh === null ||
      amountRangeLow > amountRangeHigh
    ) {
      return { amountRangeLow: null, amountRangeHigh: null };
    }

    return { amountRangeLow, amountRangeHigh };
  }

  const openEndedMatch = OPEN_ENDED_RANGE_PATTERN.exec(amountRaw);

  if (openEndedMatch) {
    return {
      amountRangeLow: parseDollarInteger(openEndedMatch[1]),
      amountRangeHigh: null,
    };
  }

  return { amountRangeLow: null, amountRangeHigh: null };
}
