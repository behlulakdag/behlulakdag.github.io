// Membership price calculator: billing period and student discount update every plan's price instantly.
// The HTML already shows monthly prices, so the section still makes sense without JavaScript.

export const PERIODS = {
  monthly: { months: 1, discount: 0, label: "aylık" },
  quarterly: { months: 3, discount: 0.1, label: "3 aylık" },
  yearly: { months: 12, discount: 0.25, label: "yıllık" },
};

export const STUDENT_DISCOUNT = 0.2;

// Per-month price is rounded to the nearest 10 ₺ so it reads like a real price list.
export function calculatePlanPrice(monthlyPrice, periodKey, { isStudent = false, studentEligible = false } = {}) {
  const period = PERIODS[periodKey];
  if (!period) throw new Error(`Unknown period: ${periodKey}`);

  let factor = 1 - period.discount;
  const studentApplied = isStudent && studentEligible;
  if (studentApplied) factor *= 1 - STUDENT_DISCOUNT;

  const perMonth = Math.round((monthlyPrice * factor) / 10) * 10;
  const total = perMonth * period.months;
  const saving = monthlyPrice * period.months - total;
  return { perMonth, total, saving, months: period.months, studentApplied };
}

const currency = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

export function formatTry(amount) {
  return `${currency.format(amount)} ₺`;
}

export function describeBilling({ total, months, saving }) {
  if (months === 1) return "Her ay ödenir";
  const savingText = saving > 0 ? ` · ${formatTry(saving)} kazanç` : "";
  return `${months} ayda bir ${formatTry(total)}${savingText}`;
}

export function initMembership() {
  const calculator = document.querySelector("[data-membership]");
  if (!calculator) return;

  const controls = calculator.querySelector("[data-membership-controls]");
  const plans = [...calculator.querySelectorAll("[data-plan]")];

  function update() {
    const periodKey = controls.querySelector('input[name="period"]:checked').value;
    const isStudent = controls.querySelector('input[name="student"]').checked;

    for (const plan of plans) {
      const price = calculatePlanPrice(Number(plan.dataset.monthly), periodKey, {
        isStudent,
        studentEligible: plan.hasAttribute("data-student-eligible"),
      });
      plan.querySelector("[data-price]").textContent = formatTry(price.perMonth);
      plan.querySelector("[data-billing]").textContent = describeBilling(price);
      plan.classList.toggle("has-student-price", price.studentApplied);
    }
  }

  controls.hidden = false;
  controls.addEventListener("change", update);
  update();
}

if (typeof document !== "undefined") initMembership();
