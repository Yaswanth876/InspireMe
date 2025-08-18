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
  { text: "Everyone fails at who they are supposed to be, Thor. The measure of a person, of a hero… is how well they succeed at being who they are.", author: "Frigga" },
  { text: "No man can win every battle, but no man should fall without a struggle.", author: "Peter Parker" },
  { text: "If you’re nothing without this suit, then you shouldn’t have it.", author: "Tony Stark" },
  { text: "This is the fight of our lives, and we’re going to win. Whatever it takes.", author: "Steve Rogers" },
  { text: "It’s an imperfect world, but it’s the only one we’ve got.", author: "Tony Stark" },
  { text: "Compromise where you can. Where you can’t, don’t…", author: "Sharon Carter" },
  { text: "The truth is… I am Iron Man.", author: "Tony Stark" },
  { text: "I would rather be a good man than a great king.", author: "Thor" },
  { text: "Don’t waste it. Don’t waste your life.", author: "Ho Yinsen" },
  { text: "We never lose our demons, Mordo. We only learn to live above them.", author: "Ancient One" },
  { text: "With great power comes great responsibility.", author: "Uncle Ben" },
  { text: "That’s my secret, Captain… I’m always angry.", author: "Bruce Banner" },
  { text: "Hulk smash!", author: "Hulk" },
  { text: "On your left.", author: "Steve Rogers" },
  { text: "I can do this all day.", author: "Captain America" },
  { text: "Higher, further, faster, baby.", author: "Carol Danvers" },
  { text: "Tony Stark was able to build this in a cave! With a box of scraps!", author: "Yinsen" },
  { text: "I'm Mary Poppins, y’all!", author: "Yondu" },
  { text: "We are Groot.", author: "Groot" },
  { text: "Either you die a hero or live long enough to see yourself become a villain.", author: "Harvey Dent" },
  { text: "But I know the rage that drives you... the memory of your loved ones is just poison in your veins...", author: "Alfred" },
  { text: "Now you're looking for the secret... you want to be fooled.", author: "Dom Cobb" },
  { text: "I just did what I do best... introduce a little anarchy.", author: "The Joker" },
  { text: "Oh, you think darkness is your ally... I was born in it...", author: "Bane" },
  { text: "Why do we fall? So we can learn to pick ourselves back up.", author: "Thomas Wayne" },
  { text: "Don't talk like you're one of them!... See, I'm just ahead of the curve.", author: "Ra's al Ghul" },
  { text: "A hero can be anyone. Even a man doing something as simple and reassuring as putting a coat around a young boy’s shoulders to let him know the world hadn’t ended.", author: "Bruce Wayne" },
  { text: "The shadows betray you because they belong to me.", author: "Bane" },
  { text: "Houston, we have a problem.", author: "Jim Lovell" },
  { text: "I see dead people.", author: "Cole Sear" },
  { text: "Well, nobody's perfect.", author: "Jerry" },
  { text: "It's alive! It's alive!", author: "Henry Frankenstein" },
  { text: "Go ahead, make my day.", author: "Harry Callahan" },
  { text: "Soylent Green is people!", author: "Shocked Citizen" },
  { text: "Open the pod bay doors, HAL.", author: "Dave Bowman" },
  { text: "Yo, Adrian!", author: "Rocky Balboa" },
  { text: "My precious.", author: "Gollum" }
  { text: "Things won't get better, Unless you think better...", author: "Kiruthicka"}
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
