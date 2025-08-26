const baseSelect = document.getElementById('base-currency');
const baseFlag = document.getElementById('base-flag');
const lastUpdatedEl = document.getElementById('last-updated');
const tableBody = document.querySelector('#rates-table tbody');

// populate base currency select
(function initSelect() {
  const codes = Object.keys(Country_List);
  codes.sort();
  const frag = document.createDocumentFragment();
  codes.forEach((code) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = code;
    if (code === 'USD') opt.selected = true;
    frag.appendChild(opt);
  });
  baseSelect.appendChild(frag);
  updateFlag();
})();

baseSelect.addEventListener('change', () => {
  updateFlag();
  loadRates();
});

function updateFlag() {
  const code = baseSelect.value;
  const cc = Country_List[code]?.toLowerCase() || 'eu';
  baseFlag.src = `https://flagcdn.com/48x36/${cc}.png`;
}

async function loadRates() {
  tableBody.innerHTML = '<tr><td colspan="3">Loading rates...</td></tr>';
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/80b6ae683d0b379916ac57cd/latest/${baseSelect.value}`);
    const data = await res.json();
    const rates = data.conversion_rates || {};

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    lastUpdatedEl.textContent = `Updated ${hh}:${mm}:${ss}`;

    const codes = Object.keys(Country_List).sort();
    const rows = codes.map((code) => {
      const rate = rates[code];
      const cc = Country_List[code]?.toLowerCase() || 'eu';
      const flag = `https://flagcdn.com/48x36/${cc}.png`;
      const pretty = typeof rate === 'number' ? rate.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '-';
      return `<tr>
        <td class=\"ccell\"><img src=\"${flag}\" alt=\"${code}\"/><span>${code}</span></td>
        <td>${code}</td>
        <td class=\"right\">${pretty}</td>
      </tr>`;
    }).join('');

    tableBody.innerHTML = rows;
  } catch (e) {
    tableBody.innerHTML = '<tr><td colspan="3">Failed to load rates.</td></tr>';
  }
}

window.addEventListener('load', loadRates);
