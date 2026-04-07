'use strict';

const currency1 = document.querySelector('#c1');
const currencyType1 = document.querySelector('#counrty1');

const currency2 = document.querySelector('#c2');
const currencyType2 = document.querySelector('#counrty2');

const options = document.querySelectorAll('.options');
const defultOption = document.querySelectorAll('.defult-option');

const inputDate = document.querySelector('.date-input');
const swithc = document.querySelector('.switch');

const date = new Date();
inputDate.value = inputDate.max = date.toISOString().split('T')[0];

// prettier-ignore
const FIAT_CODES = [
  'USD','EUR','GBP','JPY','CNY','CHF','CAD','AUD','NZD',
  'SEK','NOK','DKK','PLN','CZK','HUF','RON','BGN','HRK','ISK','UAH','RUB','TRY','ALL','BAM','MKD','RSD','MDL','GEL','AMD','AZN','BYN',
  'MXN','BRL','ARS','CLP','COP','PEN','UYU','PYG','BOB','VES','DOP','CRC','GTQ','HNL','NIO','SVC','JMD','TTD','BBD','BSD','BZD','SRD','GYD','AWG','ANG','HTG','CUP',
  'EGP','AED','SAR','QAR','KWD','BHD','OMR','ILS','JOD','IQD','IRR','LBP','SYP','YER',
  'ZAR','NGN','GHS','KES','UGX','TZS','ETB','MAD','TND','DZD','XOF','XAF','XCD','SDG','SSP','RWF','BIF','MWK','ZMW','BWP','NAD','SZL','LSL','MUR','SCR','SLL','GMD','AOA','CDF','DJF','ERN','SOS','KMF','STN','CVE','LRD',
  'INR','PKR','BDT','LKR','NPR','BTN','MMK','THB','MYR','IDR','PHP','VND','KHR','LAK','SGD','HKD','TWD','KRW','MNT','KZT','UZS','TJS','AFN','MVR','BND','FJD',
  'PGK','SBD','TOP','WST','VUV',
];

let currencysArr = [];
let ratesMap = new Map();
let isLoading = false;

function setLoading(state) {
  isLoading = state;

  currency1.disabled = state;
  currency2.disabled = state;
  currencyType1.disabled = state;
  currencyType2.disabled = state;
  inputDate.disabled = state;
  if (swithc) swithc.disabled = state;
}

function clearOptions() {
  options.forEach(select => {
    select.innerHTML = '';
  });
}

function renderOptions() {
  clearOptions();

  // ✅ sorted COPY (not mutating original)
  const sortedCurrencies = [...currencysArr].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const html = sortedCurrencies
    .map(
      currency => `
        <option class="currency-type" value="${currency.code}">
          ${currency.name}
        </option>
      `
    )
    .join('');

  options.forEach(select => select.insertAdjacentHTML('beforeend', html));
}

async function fetchCurrenciesByDate(selectedDate) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${selectedDate}/v1/currencies.json`
  );

  if (!res.ok) throw new Error('Currencies fetch failed');

  const data = await res.json();

  currencysArr = Object.entries(data)
    .map(([code, name]) => ({
      code: code.toUpperCase(),
      name,
    }))
    .filter(c => FIAT_CODES.includes(c.code));

  const ilsIndex = currencysArr.findIndex(c => c.code === 'ILS');
  if (ilsIndex !== -1) currencysArr[ilsIndex].name = 'Palestinian shekel';
}

async function fetchRatesByDate(selectedDate) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${selectedDate}/v1/currencies/eur.json`
  );

  if (!res.ok) throw new Error('Rates fetch failed');

  const data = await res.json();

  ratesMap = new Map(
    Object.entries(data.eur)
      .map(([code, rate]) => [code.toUpperCase(), Number(rate)])
      .filter(([code]) => FIAT_CODES.includes(code))
  );
}

async function loadDataByDate(selectedDate, keepSelections = true) {
  try {
    setLoading(true);

    const prev1 = currencyType1.value || 'USD';
    const prev2 = currencyType2.value || 'EGP';

    await fetchCurrenciesByDate(selectedDate);
    await fetchRatesByDate(selectedDate);

    renderOptions();

    if (defultOption[0]) {
      defultOption[0].textContent = 'US Dollar';
      defultOption[0].value = 'USD';
    }

    currencyType1.value = currencysArr.some(c => c.code === prev1)
      ? prev1
      : 'USD';

    currencyType2.value = currencysArr.some(c => c.code === prev2)
      ? prev2
      : 'EGP';

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

function convertAmount(fromCode, toCode, amount) {
  const fromRate = ratesMap.get(fromCode);
  const toRate = ratesMap.get(toCode);

  const num = Number(amount);
  if (!fromRate || !toRate || !Number.isFinite(num)) return '';

  return ((num / fromRate) * toRate).toFixed(3);
}

function updateSecondFromFirst() {
  if (isLoading) return;

  if (!currency1.value) {
    currency2.value = '';
    return;
  }

  currency2.value = convertAmount(
    currencyType1.value,
    currencyType2.value,
    currency1.value
  );
}

function updateFirstFromSecond() {
  if (isLoading) return;

  if (!currency2.value) {
    currency1.value = '';
    return;
  }

  currency1.value = convertAmount(
    currencyType2.value,
    currencyType1.value,
    currency2.value
  );
}

// EVENTS
inputDate.addEventListener('change', async () => {
  await loadDataByDate(inputDate.value, true);
  updateSecondFromFirst();
});

currencyType1.addEventListener('change', updateSecondFromFirst);
currencyType2.addEventListener('change', updateSecondFromFirst);

currency1.addEventListener('input', updateSecondFromFirst);
currency2.addEventListener('input', updateFirstFromSecond);

swithc?.addEventListener('click', () => {
  if (isLoading) return;

  [currencyType1.value, currencyType2.value] = [
    currencyType2.value,
    currencyType1.value,
  ];

  [currency1.value, currency2.value] = [
    currency2.value,
    currency1.value,
  ];

  updateSecondFromFirst();
});

// INIT
(async function init() {
  await loadDataByDate(inputDate.value, false);
  currency1.value = '1';
  updateSecondFromFirst();
})();
