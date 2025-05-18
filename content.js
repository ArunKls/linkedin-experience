const waitFor = async (selector, timeout = 10000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error("Element not found: " + selector);
};

const extractExperience = (text) => {
  const regex = /(\d+)\+?\s+(?:years|yrs)\s+(?:of\s+)?(?:relevant\s+)?experience/i;
  const match = text.match(regex);
  return match ? `${match[1]} yrs exp` : "Exp: N/A";
};

const processJobCards = async () => {
  const jobCards = document.querySelectorAll('.jobs-search-results__list-item');

  for (const card of jobCards) {
    const jobLink = card.querySelector('a.job-card-list__title')?.href;
    if (!jobLink || card.dataset.expProcessed) continue;

    card.dataset.expProcessed = "true";

    try {
      const res = await fetch(jobLink);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const desc = doc.querySelector('.description__text')?.innerText || "";
      const exp = extractExperience(desc);

      const expEl = document.createElement('div');
      expEl.innerText = `🔍 ${exp}`;
      expEl.className = 'exp-tag';

      const container = card.querySelector('.job-card-container') || card;
      container.appendChild(expEl);

    } catch (e) {
      console.error("Fetch error:", e);
    }
  }
};

const observer = new MutationObserver(() => processJobCards());

waitFor('.jobs-search-results-list').then(root => {
  observer.observe(root, { childList: true, subtree: true });
  processJobCards();
});

