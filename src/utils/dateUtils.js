
// Constants
const ETHIOPIC_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 
  'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ', 
  'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
];

const ETHIOPIC_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas',
  'Tir', 'Yekatit', 'Megabit', 'Miyazia',
  'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

/**
 * Converts a Gregorian date to Ethiopian date
 * @param {number} year - Gregorian Year
 * @param {number} month - Gregorian Month (1-12)
 * @param {number} day - Gregorian Day (1-31)
 * @returns {Object} { year, month, day }
 */
const toEthiopian = (year, month, day) => {
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

/**
 * Converts an Ethiopian date to Gregorian date
 * @param {number} year - Ethiopian Year
 * @param {number} month - Ethiopian Month (1-13)
 * @param {number} day - Ethiopian Day (1-30)
 * @returns {Object} { year, month, day }
 */
const toGregorian = (year, month, day) => {
  // Ethiopian to JDN
  // JDN = 1723856 + 365*(year-1) + floor((year-1)/4) + 30*(month-1) + day
  const jdn = 1723856 + 365 * (year - 1) + Math.floor((year - 1) / 4) + 30 * (month - 1) + day;
  
  return jdnToGregorian(jdn);
};

// Standard JDN to Gregorian Algorithm
const jdnToGregorian = (jdn) => {
  const l = jdn + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l_ = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l_ + 1)) / 1461001);
  const l__ = l_ - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l__) / 2447);
  const day = l__ - Math.floor((2447 * j) / 80);
  const l___ = Math.floor(j / 11);
  const month = j + 2 - 12 * l___;
  const year = 100 * (n - 49) + i + l___;
  
  return { year, month, day };
};

/**
 * Converts number (1-30) to Geez numeral
 * @param {number} n
 * @returns {string} Geez numeral
 */
const toGeez = (n) => {
  const ones = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
  const tens = ['', '፲', '፳', '፴'];
  if (n <= 0 || n > 30) return n.toString();
  return (tens[Math.floor(n / 10)] + ones[n % 10]);
};

module.exports = {
  toEthiopian,
  toGregorian,
  getEthiopianMonthStartDay,
  toGeez,
  ETHIOPIC_MONTHS,
  ETHIOPIC_MONTHS_EN
};
