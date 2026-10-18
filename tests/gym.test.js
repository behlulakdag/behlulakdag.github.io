import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatePlanPrice, formatTry, describeBilling } from "../demos/spor-salonu/js/membership.js";
import { matchesLevel, defaultDayIndex, nextTabIndex } from "../demos/spor-salonu/js/schedule.js";

/* ---------- Membership ---------- */

test("monthly billing is the list price with no saving", () => {
  assert.deepEqual(calculatePlanPrice(1400, "monthly"), {
    perMonth: 1400,
    total: 1400,
    saving: 0,
    months: 1,
    studentApplied: false,
  });
});

test("longer periods are cheaper per month", () => {
  const quarterly = calculatePlanPrice(1400, "quarterly");
  const yearly = calculatePlanPrice(1400, "yearly");
  assert.equal(quarterly.perMonth, 1260);
  assert.equal(quarterly.total, 3780);
  assert.equal(yearly.perMonth, 1050);
  assert.equal(yearly.saving, 1400 * 12 - 1050 * 12);
});

test("student discount stacks with the period discount only on eligible plans", () => {
  const eligible = calculatePlanPrice(1400, "yearly", { isStudent: true, studentEligible: true });
  assert.equal(eligible.perMonth, 840); // 1400 × 0.75 × 0.8
  assert.equal(eligible.studentApplied, true);

  const coaching = calculatePlanPrice(5200, "monthly", { isStudent: true, studentEligible: false });
  assert.equal(coaching.perMonth, 5200);
  assert.equal(coaching.studentApplied, false);
});

test("per-month price is rounded to 10 ₺", () => {
  assert.equal(calculatePlanPrice(2200, "quarterly").perMonth % 10, 0);
});

test("unknown period is an error, not a silent wrong price", () => {
  assert.throws(() => calculatePlanPrice(1400, "weekly"), /Unknown period/);
});

test("formatTry uses Turkish thousands separators", () => {
  assert.equal(formatTry(12600), "12.600 ₺");
});

test("describeBilling explains what is paid and saved", () => {
  assert.equal(describeBilling({ total: 1400, months: 1, saving: 0 }), "Her ay ödenir");
  assert.equal(describeBilling({ total: 3780, months: 3, saving: 420 }), "3 ayda bir 3.780 ₺ · 420 ₺ kazanç");
});

/* ---------- Schedule ---------- */

test("level filter: 'all' shows everything, open classes match any level", () => {
  assert.equal(matchesLevel("advanced", "all"), true);
  assert.equal(matchesLevel("open", "beginner"), true);
  assert.equal(matchesLevel("advanced", "beginner"), false);
  assert.equal(matchesLevel("beginner", "beginner"), true);
});

test("schedule opens on today's tab, Sunday falls back to Monday", () => {
  assert.equal(defaultDayIndex(new Date(2026, 9, 19)), 0); // Monday
  assert.equal(defaultDayIndex(new Date(2026, 9, 24)), 5); // Saturday
  assert.equal(defaultDayIndex(new Date(2026, 9, 18)), 0); // Sunday → Monday
});

test("day tabs wrap with the arrow keys", () => {
  assert.equal(nextTabIndex(5, "ArrowRight", 6), 0);
  assert.equal(nextTabIndex(0, "ArrowLeft", 6), 5);
  assert.equal(nextTabIndex(2, "Tab", 6), null);
});
