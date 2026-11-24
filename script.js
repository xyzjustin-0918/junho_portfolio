const works = [
  {
    id: "kakao", title: "카카오 현장탐방", subtitle: "카카오 · AI와 데이터", date: "2026-10-02", dateLabel: "2026.10.02",
    description: "카카오 아지트에서 살펴본 AI 기술과 데이터 융합의 이야기.", tags: ["기업탐방", "AI·데이터", "교외교육"],
    pages: [1, 3, 4, 5].map((number) => ({ number, image: `assets/cards/kakao/artboard-${number}.jpg` }))
  },
  {
    id: "kist", title: "KIST 수소 연구", subtitle: "한국과학기술연구원 · 지속가능기술", date: "2026-10-06", dateLabel: "2026.10.06",
    description: "청정수소 융합연구소와 수소연료전지 연구 현장을 만나다.", tags: ["수소", "지속가능성", "연구소"],
    pages: [1, 3, 4, 5].map((number) => ({ number, image: `assets/cards/kist/artboard-${number}.jpg` }))
  },
  {
    id: "furiosa", title: "퓨리오사AI 반도체", subtitle: "퓨리오사AI · AI 반도체", date: "2026-10-07", dateLabel: "2026.10.07",
    description: "AI 추론용 반도체와 하드웨어·컴파일러의 협업을 살펴보다.", tags: ["AI 반도체", "하드웨어", "소프트웨어"],
    pages: [1, 3, 4, 7].map((number) => ({ number, image: `assets/cards/furiosa/artboard-${number}.jpg` }))
  }
];

let activeSort = "date";
let activeFilter = "전체";
let currentWork = null;
let currentPage = 0;
const gallery = document.querySelector("#gallery");
const searchInput = document.querySelector("#search");
const filtersEl = document.querySelector("#filters");
const viewer = document.querySelector("#viewer");
const topicMap = new Map();

// Build the topic index once so the category chips and counts stay in sync.
for (const work of works) {
  for (const tag of work.tags) {
    if (!topicMap.has(tag)) topicMap.set(tag, []);
    topicMap.get(tag).push(work);
  }
}

function mergeSort(items, compare) {
  if (items.length <= 1) return items;
  const middle = Math.floor(items.length / 2);
  return merge(mergeSort(items.slice(0, middle), compare), mergeSort(items.slice(middle), compare), compare);
}

function merge(left, right, compare) {
  const result = [];
  let a = 0;
  let b = 0;
  while (a < left.length && b < right.length) {
    if (compare(left[a], right[b]) <= 0) result.push(left[a++]);
    else result.push(right[b++]);
  }
  return result.concat(left.slice(a), right.slice(b));
}

function renderFilters() {
  const items = ["전체", ...topicMap.keys()];
  filtersEl.replaceChildren(...items.map((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter-button${activeFilter === name ? " is-active" : ""}`;
    button.textContent = `${name} · ${name === "전체" ? works.length : topicMap.get(name).length}`;
    button.setAttribute("aria-pressed", String(activeFilter === name));
    button.addEventListener("click", () => {
      activeFilter = name;
      renderFilters();
      renderGallery();
    });
    return button;
  }));
}

function renderGallery() {
  const query = searchInput.value.trim().toLocaleLowerCase("ko");
  const matches = works.filter((work) => {
    const topicMatch = activeFilter === "전체" || work.tags.includes(activeFilter);
    const searchable = [work.title, work.subtitle, work.description, ...work.tags].join(" ").toLocaleLowerCase("ko");
    return topicMatch && (!query || searchable.includes(query));
  });
  const compare = activeSort === "title"
    ? (a, b) => a.title.localeCompare(b.title, "ko")
    : (a, b) => (b.date || "0000-00-00").localeCompare(a.date || "0000-00-00");
  const sorted = mergeSort(matches, compare);
  document.querySelector("#result-count").textContent = `${sorted.length} WORK${sorted.length === 1 ? "" : "S"} · ${sorted.reduce((sum, work) => sum + work.pages.length, 0)} PAGES`;

  if (!sorted.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "검색 결과가 없습니다. 다른 기관명이나 주제로 찾아보세요.";
    gallery.replaceChildren(empty);
    return;
  }

  gallery.replaceChildren(...sorted.map((work) => {
    const card = document.createElement("article");
    card.className = "work-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${work.title} 카드뉴스 ${work.pages.length}장 보기`);

    const cover = document.createElement("div");
    cover.className = "work-cover";
    const image = document.createElement("img");
    image.src = work.pages[0].image;
    image.alt = `${work.title} 카드뉴스 첫 페이지`;
    image.loading = "lazy";
    const shade = document.createElement("span");
    shade.className = "cover-shade";
    shade.setAttribute("aria-hidden", "true");
    const chip = document.createElement("span");
    chip.className = "cover-chip";
    chip.textContent = `${String(work.pages.length).padStart(2, "0")} PAGES`;
    const openIcon = document.createElement("span");
    openIcon.className = "cover-open";
    openIcon.textContent = "↗";
    openIcon.setAttribute("aria-hidden", "true");
    cover.append(image, shade, chip, openIcon);

    const meta = document.createElement("div");
    meta.className = "work-meta";
    const titleBlock = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = work.title;
    const subtitle = document.createElement("p");
    subtitle.textContent = work.subtitle;
    titleBlock.append(title, subtitle);
    const date = document.createElement("span");
    date.className = "work-count";
    date.textContent = work.dateLabel;
    meta.append(titleBlock, date);

    const tags = document.createElement("div");
    tags.className = "work-tags";
    for (const tag of work.tags) {
      const item = document.createElement("span");
      item.textContent = tag;
      tags.append(item);
    }
    card.append(cover, meta, tags);
    card.addEventListener("click", () => openViewer(work, 0));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openViewer(work, 0);
      }
    });
    return card;
  }));
}

function renderViewer() {
  const page = currentWork.pages[currentPage];
  document.querySelector("#viewer-kicker").textContent = `${currentWork.subtitle} · ARTBOARD ${page.number}`;
  document.querySelector("#viewer-title").textContent = currentWork.title;
  const image = document.querySelector("#viewer-image");
  image.src = page.image;
  image.alt = `${currentWork.title} 카드뉴스 Artboard ${page.number}`;
  document.querySelector("#viewer-page").textContent = `${String(currentPage + 1).padStart(2, "0")} / ${String(currentWork.pages.length).padStart(2, "0")}`;
  const dots = document.querySelector("#viewer-dots");
  dots.replaceChildren(...currentWork.pages.map((item, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `viewer-dot${currentPage === index ? " is-active" : ""}`;
    dot.setAttribute("aria-label", `Artboard ${item.number} 보기`);
    dot.setAttribute("aria-pressed", String(currentPage === index));
    dot.addEventListener("click", () => { currentPage = index; renderViewer(); });
    return dot;
  }));
}

function openViewer(work, pageIndex) {
  currentWork = work;
  currentPage = pageIndex;
  renderViewer();
  viewer.showModal();
}

function movePage(direction) {
  if (!currentWork) return;
  currentPage = (currentPage + direction + currentWork.pages.length) % currentWork.pages.length;
  renderViewer();
}

searchInput.addEventListener("input", renderGallery);
document.querySelectorAll("[data-sort]").forEach((button) => button.addEventListener("click", () => {
  activeSort = button.dataset.sort;
  document.querySelectorAll("[data-sort]").forEach((item) => {
    const selected = item === button;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  renderGallery();
}));
document.querySelector(".viewer-close").addEventListener("click", () => viewer.close());
document.querySelector(".viewer-nav.previous").addEventListener("click", () => movePage(-1));
document.querySelector(".viewer-nav.next").addEventListener("click", () => movePage(1));
viewer.addEventListener("click", (event) => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") movePage(-1);
  if (event.key === "ArrowRight") movePage(1);
});

renderFilters();
renderGallery();
