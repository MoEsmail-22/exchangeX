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
// const today

inputDate.value = inputDate.max = date.toISOString().split('T')[0];

// prettier-ignore
const FIAT_CODES = [
  // 🌍 Major
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'CHF',
  'CAD',
  'AUD',
  'NZD',

  // 🇪🇺 Europe
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'BGN',
  'HRK',
  'ISK',
  'UAH',
  'RUB',
  'TRY',
  'ALL',
  'BAM',
  'MKD',
  'RSD',
  'MDL',
  'GEL',
  'AMD',
  'AZN',
  'BYN',

  // 🌍 Americas
  'MXN',
  'BRL',
  'ARS',
  'CLP',
  'COP',
  'PEN',
  'UYU',
  'PYG',
  'BOB',
  'VES',
  'DOP',
  'CRC',
  'GTQ',
  'HNL',
  'NIO',
  'SVC',
  'JMD',
  'TTD',
  'BBD',
  'BSD',
  'BZD',
  'SRD',
  'GYD',
  'AWG',
  'ANG',
  'HTG',
  'CUP',

  // 🌍 Middle East
  'EGP',
  'AED',
  'SAR',
  'QAR',
  'KWD',
  'BHD',
  'OMR',
  'ILS',
  'JOD',
  'IQD',
  'IRR',
  'LBP',
  'SYP',
  'YER',

  // 🌍 Africa
  'ZAR',
  'NGN',
  'GHS',
  'KES',
  'UGX',
  'TZS',
  'ETB',
  'MAD',
  'TND',
  'DZD',
  'XOF',
  'XAF',
  'XCD',
  'SDG',
  'SSP',
  'RWF',
  'BIF',
  'MWK',
  'ZMW',
  'BWP',
  'NAD',
  'SZL',
  'LSL',
  'MUR',
  'SCR',
  'SLL',
  'GMD',
  'AOA',
  'CDF',
  'DJF',
  'ERN',
  'SOS',
  'KMF',
  'STN',
  'CVE',
  'LRD',

  // 🌍 Asia
  'INR',
  'PKR',
  'BDT',
  'LKR',
  'NPR',
  'BTN',
  'MMK',
  'THB',
  'MYR',
  'IDR',
  'PHP',
  'VND',
  'KHR',
  'LAK',
  'SGD',
  'HKD',
  'TWD',
  'KRW',
  'MNT',
  'KZT',
  'UZS',
  'TJS',
  'AFN',
  'MVR',
  'BND',
  'FJD',

  // 🌍 Oceania
  'PGK',
  'SBD',
  'TOP',
  'WST',
  'VUV',
];

let currencysArr = [];
let ratesArr = [];

//load options
function renderOptions() {
  const HTML = currencysArr
    .map(
      x =>
        `<option class="currency-type" value="${x.code}">
          ${x.name}
        </option>`
    )
    .join('');
  options.forEach(el => el.insertAdjacentHTML('beforeend', HTML));
}

async function currenyes() {
  try {
    const testAPi = await fetch(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${inputDate.value}/v1/currencies.json`
    );
    const data = await testAPi.json();

    currencysArr = Object.entries(data).map(([code, name]) => ({
      code: code.toUpperCase(),
      name,
    }));

    currencysArr = currencysArr.filter(c => FIAT_CODES.includes(c.code));

    currencysArr[currencysArr.findIndex(r => r.code === 'ILS')].name =
      'palestinian shekel';

    renderOptions();
  } catch (err) {
    console.error(err);
  }
}

async function convert() {
  try {
    const rateToEU = await fetch(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${inputDate.value}/v1/currencies/eur.json`
    );
    const data = await rateToEU.json();

    ratesArr = Object.entries(data.eur).map(([code, rate]) => ({
      code: code.toUpperCase(),
      rate,
    }));

    ratesArr = ratesArr.filter(c => FIAT_CODES.includes(c.code));
    return ratesArr;
  } catch (err) {
    console.error(err);
  }
}
currenyes();
convert();

defultOption[0].textContent = 'US Dollar';
defultOption[0].value = 'USD';

inputDate.addEventListener('change', async function () {
  await currenyes();
  await convert();

  convertingFunctuin(
    currencyType1.value,
    currencyType2.value,
    currency1,
    currency2
  );
});

currencyType1.addEventListener('change', function () {
  convertingFunctuin(
    currencyType1.value,
    currencyType2.value,
    currency1,
    currency2
  );
});

currencyType2.addEventListener('change', function () {
  convertingFunctuin(
    currencyType1.value,
    currencyType2.value,
    currency1,
    currency2
  );
});

currency1.addEventListener('input', function () {
  convertingFunctuin(
    currencyType1.value,
    currencyType2.value,
    currency1,
    currency2
  );
});

currency2.addEventListener('input', function () {
  convertingFunctuin(
    currencyType2.value,
    currencyType1.value,
    currency2,
    currency1
  );
});

function convertingFunctuin(t1, t2, c1, c2) {
  const fromCode = t1;
  const toCode = t2;
  const c1Rate = Number(ratesArr.find(r => r.code === fromCode)?.rate);
  const c2Rate = Number(ratesArr.find(r => r.code === toCode)?.rate);

  const converted = (Number(c1.value) / c1Rate) * c2Rate;
  c2.value = converted.toFixed(3);
  c2.textContent = c2.value;
}

