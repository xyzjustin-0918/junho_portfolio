const frames = [
  { id: "blue-hour", title: "Blue hour", place: "RIVERSIDE · SEOUL", date: "2026-11-18", image: "assets/blue-hour.svg", number: "02" },
  { id: "long-way-home", title: "The long way home", place: "BACK STREET · SEOUL", date: "2026-11-22", image: "assets/alley-rain.svg", number: "01" },
  { id: "low-tide", title: "Low tide, last light", place: "EAST COAST · KR", date: "2026-11-12", image: "assets/coast-dusk.svg", number: "03" }
];
let activeSort = "date";
let activeView = "after";
const gallery = document.querySelector("#gallery");

// The same merge sort handles both date and title ordering.
function mergeSort(items, compare) {
  if (items.length <= 1) return items;
  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), compare);
  const right = mergeSort(items.slice(middle), compare);
  return merge(left, right, compare);
}
function merge(left, right, compare) {
  const result = [];
  let a = 0, b = 0;
  while (a < left.length && b < right.length) {
    if (compare(left[a], right[b]) <= 0) result.push(left[a++]);
    else result.push(right[b++]);
  }
  return result.concat(left.slice(a), right.slice(b));
}
function renderGallery() {
  const compare = activeSort === "title"
    ? (a, b) => a.title.localeCompare(b.title)
    : (a, b) => b.date.localeCompare(a.date);
  const sorted = mergeSort(frames, compare);
  gallery.replaceChildren(...sorted.map((frame, index) => {
    const card = document.createElement("article");
    card.className = "frame-card";
    card.innerHTML = `
      <div class="frame-image ${activeView === "before" ? "is-before" : ""}">
        <img src="${frame.image}" alt="Illustrated sample frame: ${frame.title}" loading="lazy">
        <span class="frame-tag">${activeView === "before" ? "BEFORE · ORIGINAL" : "AFTER · EDITED"}</span>
        <span class="frame-ordinal">0${index + 1} / 03</span>
      </div>
      <div class="frame-meta">
        <div><h3>${frame.title}</h3><p>${frame.place}</p></div>
        <time class="frame-date" datetime="${frame.date}">${new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${frame.date}T12:00:00`)).toUpperCase()}</time>
      </div>`;
    return card;
  }));
}
document.querySelectorAll("[data-sort]").forEach(button => button.addEventListener("click", () => {
  activeSort = button.dataset.sort;
  document.querySelectorAll("[data-sort]").forEach(item => {
    const selected = item === button;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  renderGallery();
}));
document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => {
  activeView = button.dataset.view;
  document.querySelectorAll("[data-view]").forEach(item => {
    const selected = item === button;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  renderGallery();
}));
renderGallery();
