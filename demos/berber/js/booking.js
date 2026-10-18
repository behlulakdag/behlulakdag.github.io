// Appointment form for the Ustura demo. Nothing is sent anywhere: on submit the visitor sees a summary
// and a clear note that this is a demo. Pure helpers are exported so they can be unit tested.

// Index = Date.getDay() (0 = Sunday). null means closed that day.
export const OPENING_HOURS = [
  { open: 10, close: 18 }, // Pazar
  null, // Pazartesi kapalı
  { open: 9, close: 20 },
  { open: 9, close: 20 },
  { open: 9, close: 20 },
  { open: 9, close: 20 },
  { open: 9, close: 21 }, // Cumartesi
];

export const SLOT_STEP_MINUTES = 30;
export const MIN_LEAD_MINUTES = 30; // no booking for a slot that starts in less than half an hour
export const MAX_DAYS_AHEAD = 30;

const pad = (n) => String(n).padStart(2, "0");

// Local calendar date as YYYY-MM-DD (toISOString would shift to UTC and can land on the wrong day).
export function toDateValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function hoursFor(date) {
  return OPENING_HOURS[date.getDay()];
}

// Every start time where a service of `durationMinutes` still ends by closing time.
export function buildTimeSlots(openHour, closeHour, durationMinutes, stepMinutes = SLOT_STEP_MINUTES) {
  const slots = [];
  for (let start = openHour * 60; start + durationMinutes <= closeHour * 60; start += stepMinutes) {
    slots.push(`${pad(Math.floor(start / 60))}:${pad(start % 60)}`);
  }
  return slots;
}

export function availableSlots(dateValue, durationMinutes, now) {
  const date = parseDateValue(dateValue);
  const hours = hoursFor(date);
  if (!hours) return [];

  const slots = buildTimeSlots(hours.open, hours.close, durationMinutes);
  if (dateValue !== toDateValue(now)) return slots;

  const earliest = now.getHours() * 60 + now.getMinutes() + MIN_LEAD_MINUTES;
  return slots.filter((slot) => {
    const [h, m] = slot.split(":").map(Number);
    return h * 60 + m >= earliest;
  });
}

// Accepts "0532 123 45 67", "532-123-4567", "+90 532 123 45 67"; returns 10 digits starting with 5, or null.
export function normalizePhone(input) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return /^5\d{9}$/.test(digits) ? digits : null;
}

export function formatPhone(digits) {
  return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
}

// Returns { field: message } for every problem; an empty object means the booking is valid.
export function validateBooking({ name, phone, service, date, time }, now, durationMinutes) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Lütfen adınızı yazın.";
  if (!normalizePhone(phone)) errors.phone = "Geçerli bir cep telefonu yazın (örnek: 0532 123 45 67).";
  if (!service) errors.service = "Bir hizmet seçin.";

  if (!date) {
    errors.date = "Bir tarih seçin.";
  } else {
    const picked = parseDateValue(date);
    const today = parseDateValue(toDateValue(now));
    const lastDay = new Date(today);
    lastDay.setDate(lastDay.getDate() + MAX_DAYS_AHEAD);
    if (picked < today) errors.date = "Geçmiş bir tarih seçilemez.";
    else if (picked > lastDay) errors.date = `En fazla ${MAX_DAYS_AHEAD} gün sonrasına randevu alınabilir.`;
    else if (!hoursFor(picked)) errors.date = "Pazartesi günleri kapalıyız.";
  }

  if (!errors.date && !time) errors.time = "Bir saat seçin.";
  else if (!errors.date && !availableSlots(date, durationMinutes, now).includes(time)) {
    errors.time = "Bu saat artık uygun değil, başka bir saat seçin.";
  }
  return errors;
}

/* ---------- DOM wiring ---------- */

const DATE_FORMAT = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long" });

export function initBooking() {
  const form = document.querySelector("[data-booking-form]");
  if (!form) return;

  const fields = {
    name: form.elements.name,
    phone: form.elements.phone,
    service: form.elements.service,
    barber: form.elements.barber,
    date: form.elements.date,
    time: form.elements.time,
  };
  const timeHint = form.querySelector("[data-time-hint]");
  const confirmation = document.querySelector("[data-booking-confirmation]");

  const selectedDuration = () => Number(fields.service.selectedOptions[0]?.dataset.duration || 30);

  const today = new Date();
  const lastDay = new Date(today);
  lastDay.setDate(today.getDate() + MAX_DAYS_AHEAD);
  fields.date.min = toDateValue(today);
  fields.date.max = toDateValue(lastDay);

  function refreshTimes() {
    const previous = fields.time.value;
    fields.time.replaceChildren(new Option("Önce tarih seçin", ""));
    fields.time.disabled = true;
    timeHint.textContent = "";
    if (!fields.date.value) return;

    const date = parseDateValue(fields.date.value);
    if (!hoursFor(date)) {
      timeHint.textContent = "Pazartesi günleri kapalıyız.";
      return;
    }
    const slots = availableSlots(fields.date.value, selectedDuration(), new Date());
    if (slots.length === 0) {
      timeHint.textContent = "Bu gün için boş saat kalmadı.";
      return;
    }
    fields.time.replaceChildren(new Option("Saat seçin", ""), ...slots.map((slot) => new Option(slot, slot)));
    fields.time.disabled = false;
    if (slots.includes(previous)) fields.time.value = previous;
    timeHint.textContent = `${slots.length} uygun saat`;
  }

  function showErrors(errors) {
    for (const [key, field] of Object.entries(fields)) {
      const message = form.querySelector(`[data-error-for="${key}"]`);
      if (!message) continue;
      message.textContent = errors[key] ?? "";
      field.toggleAttribute("aria-invalid", Boolean(errors[key]));
    }
  }

  fields.date.addEventListener("change", refreshTimes);
  fields.service.addEventListener("change", refreshTimes);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(Object.keys(fields).map((key) => [key, fields[key].value]));
    const errors = validateBooking(data, new Date(), selectedDuration());
    showErrors(errors);

    const firstInvalid = Object.keys(fields).find((key) => errors[key]);
    if (firstInvalid) {
      fields[firstInvalid].focus();
      return;
    }

    confirmation.querySelector("[data-summary-name]").textContent = data.name.trim();
    confirmation.querySelector("[data-summary-service]").textContent = fields.service.selectedOptions[0].textContent;
    confirmation.querySelector("[data-summary-barber]").textContent = fields.barber.selectedOptions[0].textContent;
    confirmation.querySelector("[data-summary-when]").textContent =
      `${DATE_FORMAT.format(parseDateValue(data.date))}, ${data.time}`;
    confirmation.querySelector("[data-summary-phone]").textContent = formatPhone(normalizePhone(data.phone));

    form.hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
  });

  confirmation.querySelector("[data-booking-reset]").addEventListener("click", () => {
    form.reset();
    showErrors({});
    refreshTimes();
    confirmation.hidden = true;
    form.hidden = false;
    fields.name.focus();
  });

  refreshTimes();
}

if (typeof document !== "undefined") initBooking();
