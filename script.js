function pad2(n) {
  return String(n).padStart(2, "0");
}

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 1);
  const diffMs = d - start;
  return Math.floor(diffMs / 86400000) + 1;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function updateClock() {
  const now = new Date();

  const hh = pad2(now.getHours());
  const mm = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());

  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const doyEl = document.getElementById("dayOfYear");

  if (timeEl) timeEl.textContent = `${hh}:${mm}:${ss}`;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  if (dateEl) dateEl.textContent = dateFormatter.format(now);

  const doy = dayOfYear(now);
  const total = isLeapYear(now.getFullYear()) ? 366 : 365;
  if (doyEl) doyEl.textContent = `${doy} / ${total}`;
}

updateClock();
setInterval(updateClock, 250);
