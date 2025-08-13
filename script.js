// "use strict" switches JS into a safer mode that catches silent errors (e.g., undeclared vars).
"use strict";

/*
  An array of quote objects kept *locally* in this file.
  Each object has:
    - text: the quotation string
    - author: who said it
*/
const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", author: "Steve Jobs" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
];

/*
  Grab references to the DOM elements we will read/update.
  document.getElementById("...") returns the element with that id.
*/
const $quoteEl  = document.getElementById("quote");
const $authorEl = document.getElementById("author");
const $newBtn   = document.getElementById("new-quote");
const $copyBtn  = document.getElementById("copy-quote");

/*
  Retrieve the last used index from localStorage (browser key-value storage).
  localStorage stores *strings*, so we convert to a Number.
  '?? -1' means: if the left side is null/undefined, use -1 as the default.
*/
let lastIndex = Number(localStorage.getItem("inspireme:lastIndex") ?? -1);

/*
  Helper: get a random index from the quotes array.
  - If there's only one quote, return 0.
  - Otherwise, re-roll until we get an index different from the last shown
    so you don't see the same quote twice in a row.
  - Update lastIndex and persist it in localStorage.
*/
function getRandomIndex() {
  if (quotes.length <= 1) return 0;
  let i;
  do {
    // Math.random() gives [0, 1); multiply by length to scale; floor to get integer index.
    i = Math.floor(Math.random() * quotes.length);
  } while (i === lastIndex);
  lastIndex = i;
  localStorage.setItem("inspireme:lastIndex", String(i));
  return i;
}

/*
  Render the quote at a given index into the page.
  - We wrap the text in nice “smart quotes”.
  - We prefix author with an em dash for typography.
  - We also set the blockquote's 'cite' attribute to the author for semantics.
*/
function renderQuote(index) {
  const q = quotes[index];
  $quoteEl.textContent  = `“${q.text}”`;
  $authorEl.textContent = `— ${q.author}`;
  $quoteEl.setAttribute("cite", q.author);
}

/*
  Animate the newly set quote by toggling a CSS class (.fade).
  Removing then re-adding forces the animation to replay.
  The 'void ...offsetWidth' line is a common trick to flush layout in between.
*/
function animateQuote() {
  $quoteEl.classList.remove("fade");
  void $quoteEl.offsetWidth;
  $quoteEl.classList.add("fade");

  $authorEl.classList.remove("fade");
  void $authorEl.offsetWidth;
  $authorEl.classList.add("fade");
}

/*
  Copy the current quote + author to the clipboard.
  - Prefer the modern async Clipboard API when available AND in a secure context (https).
  - Fallback to a hidden <textarea> + document.execCommand('copy') for older browsers or file://.
*/
function copyCurrentQuote() {
  const text = `${$quoteEl.textContent} ${$authorEl.textContent}`.trim();

  if (navigator.clipboard && window.isSecureContext) {
    // Promise-based async copy; show a quick inline toast via button text.
    navigator.clipboard.writeText(text)
      .then(() => flashCopyFeedback("Copied!"))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

/*
  Fallback copy: create a temporary <textarea>, select its contents, run 'copy', then remove it.
*/
function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");    // prevent mobile keyboards
  ta.style.position = "absolute";
  ta.style.left = "-9999px";          // move off-screen
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    flashCopyFeedback("Copied!");
  } catch {
    flashCopyFeedback("Copy failed");
  } finally {
    document.body.removeChild(ta);
  }
}

/*
  Show quick feedback by temporarily changing the Copy button's label, then revert.
*/
function flashCopyFeedback(msg) {
    const original = $copyBtn.innerHTML; // save SVG icon
    if (msg === "Copied!") {
      $copyBtn.innerHTML = "✔"; // show checkmark
    } else {
      $copyBtn.innerHTML = "✖"; // show cross mark if failed
    }
    setTimeout(() => { $copyBtn.innerHTML = original; }, 900);
  }  

/*
  Wire up button clicks:
  - New Quote: choose a fresh random index, render it, and animate.
  - Copy: copy the current quote text.
*/
$newBtn.addEventListener("click", () => {
  const i = getRandomIndex();
  renderQuote(i);
  animateQuote();
});
$copyBtn.addEventListener("click", copyCurrentQuote);

/*
  Initial render when the page loads:
  - If we have a saved lastIndex within bounds, reuse it.
  - Otherwise choose a new random one.
*/
(function init() {
  const hasSaved = Number.isInteger(lastIndex) && lastIndex >= 0 && lastIndex < quotes.length;
  const i = hasSaved ? lastIndex : getRandomIndex();
  renderQuote(i);
  animateQuote();
})();
