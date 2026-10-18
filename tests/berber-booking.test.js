import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTimeSlots,
  availableSlots,
  normalizePhone,
  formatPhone,
  validateBooking,
  toDateValue,
} from "../demos/berber/js/booking.js";

// 2026-10-20 is a Tuesday; 2026-10-19 and 2026-10-26 are Mondays; 2026-10-24 is a Saturday.
const tuesdayMorning = new Date(2026, 9, 20, 8, 0);

test("slots end before closing time for the chosen service length", () => {
  const slots = buildTimeSlots(9, 11, 60);
  assert.deepEqual(slots, ["09:00", "09:30", "10:00"]);
});

test("Monday has no slots", () => {
  assert.deepEqual(availableSlots("2026-10-19", 30, tuesdayMorning), []);
});

test("Saturday stays open an hour later", () => {
  const slots = availableSlots("2026-10-24", 30, tuesdayMorning);
  assert.equal(slots.at(-1), "20:30");
});

test("today only offers slots at least 30 minutes away", () => {
  const now = new Date(2026, 9, 20, 18, 40);
  assert.deepEqual(availableSlots("2026-10-20", 30, now), ["19:30"]);
});

test("toDateValue uses the local calendar date", () => {
  assert.equal(toDateValue(new Date(2026, 0, 5, 23, 59)), "2026-01-05");
});

test("normalizePhone accepts common Turkish mobile formats", () => {
  for (const input of ["0532 123 45 67", "532-123-4567", "+90 532 123 45 67", "05321234567"]) {
    assert.equal(normalizePhone(input), "5321234567", input);
  }
});

test("normalizePhone rejects landlines and short numbers", () => {
  assert.equal(normalizePhone("0212 123 45 67"), null);
  assert.equal(normalizePhone("0532 123"), null);
});

test("formatPhone prints the usual spacing", () => {
  assert.equal(formatPhone("5321234567"), "0532 123 45 67");
});

const validBooking = {
  name: "Ali",
  phone: "0532 123 45 67",
  service: "haircut",
  date: "2026-10-21",
  time: "10:00",
};

test("a complete booking has no errors", () => {
  assert.deepEqual(validateBooking(validBooking, tuesdayMorning, 30), {});
});

test("every missing field is reported", () => {
  const errors = validateBooking({ name: "", phone: "", service: "", date: "", time: "" }, tuesdayMorning, 30);
  assert.deepEqual(Object.keys(errors).sort(), ["date", "name", "phone", "service"]);
});

test("closed days, past days and far-off days are rejected", () => {
  assert.match(validateBooking({ ...validBooking, date: "2026-10-26" }, tuesdayMorning, 30).date, /Pazartesi/);
  assert.match(validateBooking({ ...validBooking, date: "2026-10-01" }, tuesdayMorning, 30).date, /Geçmiş/);
  assert.match(validateBooking({ ...validBooking, date: "2026-12-30" }, tuesdayMorning, 30).date, /30 gün/);
});

test("a slot that does not fit the service length is rejected", () => {
  const errors = validateBooking({ ...validBooking, time: "19:30" }, tuesdayMorning, 60);
  assert.ok(errors.time);
});
