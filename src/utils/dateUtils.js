
// Constants
const ETHIOPIC_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 
  'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ', 
  'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
];

/**
 * Converts a Gregorian date to Ethiopian date
 * @param {number} year - Gregorian Year
 * @param {number} month - Gregorian Month (1-12)
 * @param {number} day - Gregorian Day (1-31)
 * @returns {Object} { year, month, day }
 */
const toEthiopian = (year, month, day) => {
  // Simple offset-based calculation suitable for modern era
  // Inputs are standard Gregorian
  
  const gDate = new Date(year, month - 1, day);
  
  // Ethiopian New Year (Meskerem 1) is usually Sep 11.
  // It is Sep 12 in the year BEFORE a Gregorian leap year (e.g. Sep 12, 2023 for Eth 2016)
  // Actually, let's use the difference in days from a known anchor.
  
  // Anchor: Meskerem 1, 2017 E.C. is September 11, 2024 G.C.
  // (2024 is a leap year, so Feb had 29 days. New Year was Sept 11).
  const anchorGreg = new Date(2024, 8, 11); // Sept 11, 2024
  const anchorEth = { year: 2017, month: 1, day: 1 };
  
  // Calculate difference in milliseconds
  const diffTime = gDate.getTime() - anchorGreg.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Now add days to anchor
  // This is a rough estimation loop, simpler than full JD math but accurate enough for +/- 10 years
  // which is fine for this app context.
  // Ideally we use full JDN math. Let's do a reliable JDN implementation.
  
  return toEthiopianJDN(year, month, day);
};

// Robust JDN implementation adapted from standard algorithms
const toEthiopianJDN = (gYear, gMonth, gDay) => {
  // Julian Day Number Calculation for Gregorian
  const a = Math.floor((14 - gMonth) / 12);
  const y = gYear + 4800 - a;
  const m = gMonth + 12 * a - 3;
  
  const jdn = gDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // JDN to Ethiopic
  // Offset: JDN of Ethiopic epoch (Incarnation Era) is 1723856
  // But standard algorithm is:
  
  const jd = jdn;
  const r = (jd - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  
  const ethYear = 4 * Math.floor((jd - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const ethMonth = Math.floor(n / 30) + 1;
  const ethDay = (n % 30) + 1;
  return { year: ethYear, month: ethMonth, day: ethDay };
};

/**
 * Calculates the day of the week for the 1st day of an Ethiopian month
 * @param {number} year - Ethiopian Year
 * @param {number} month - Ethiopian Month (1-13)
 * @returns {number} 0=Sunday, 1=Monday, ..., 6=Saturday
 */
const getEthiopianMonthStartDay = (year, month) => {
  // JDN of the 1st day of the regular month
  // Formula: JDN = 1723856 + 365*(year-1) + floor((year-1)/4) + 30*(month-1) + 1
  const jdn = 1723856 + 365 * (year - 1) + Math.floor((year - 1) / 4) + 30 * (month - 1) + 1;
  return (jdn + 1) % 7;
};

module.exports = {
  toEthiopian,
  getEthiopianMonthStartDay,
  ETHIOPIC_MONTHS
};
