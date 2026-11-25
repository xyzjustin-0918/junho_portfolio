(() => {
const categories = ["교외교육", "비교과", "전공 톺아보기"];
const pages = (folder, numbers) => numbers.map((number) => ({
  number,
  image: `assets/cards/${folder}/${["kakao", "kist", "furiosa", "digital-healthcare", "tensor-core", "nlp", "solid-state-battery"].includes(folder) ? "artboard" : "slide"}-${number}.jpg`
}));

const works = [
  { id: "kakao", category: "교외교육", title: "카카오 현장탐방", subtitle: "카카오 · AI와 데이터", pages: pages("kakao", [1, 3, 4, 5]) },
  { id: "kist", category: "교외교육", title: "KIST 수소 연구", subtitle: "한국과학기술연구원 · 지속가능기술", pages: pages("kist", [1, 3, 4, 5]) },
  { id: "furiosa", category: "교외교육", title: "퓨리오사AI 반도체", subtitle: "퓨리오사AI · AI 반도체", pages: pages("furiosa", [1, 3, 4, 7]) },
  { id: "snuti-lounge-13", category: "비교과", title: "다른 길을 걸어온 우리", subtitle: "SNUTI in Lounge #13 · 전공과 진로", pages: pages("snuti-lounge-13", [1, 2, 3]) },
  { id: "project-management", category: "비교과", title: "엔지니어링 프로젝트 매니지먼트", subtitle: "SNUTI on Site #2 · 현장교육", pages: pages("project-management", [1, 2, 3, 4]) },
  { id: "major-talk", category: "비교과", title: "미래 산업을 이끌 다섯 전공", subtitle: "SNUTI in Lounge #9 · 전공설명회", pages: pages("major-talk", [1, 2, 3, 4, 5, 6]) },
  { id: "ego-trip-7", category: "비교과", title: "Information for Inspiration", subtitle: "SNUTI in Lounge #8 · Ego Trip 7회차", pages: pages("ego-trip-7", [1, 2, 3, 4]) },
  { id: "ego-trip-6", category: "비교과", title: "Sound Persona", subtitle: "SNUTI in Lounge #7 · Ego Trip 6회차", pages: pages("ego-trip-6", [1, 2, 3, 4]) },
  { id: "snuti-lounge-2", category: "비교과", title: "그림을 통해 표현하는 나", subtitle: "SNUTI in Lounge #2 · Ego Trip 2회차", pages: pages("snuti-lounge-2", [1, 2, 3]) },
  { id: "ego-trip-1", category: "비교과", title: "그림을 통해 알아가는 나", subtitle: "SNUTI in Lounge #1 · Ego Trip 1회차", pages: pages("ego-trip-1", [1, 2, 3]) },
  { id: "digital-healthcare", category: "전공 톺아보기", title: "디지털 헬스케어와 섬유 전극", subtitle: "전공 톺아보기 Ep.3 · 섬유전극의 미래", pages: pages("digital-healthcare", [1, 2, 3, 4, 5, 6]) },
  { id: "tensor-core", category: "전공 톺아보기", title: "Tensor Core와 차세대 AI 반도체", subtitle: "전공 톺아보기 Ep.5 · 지능형 반도체의 미래", pages: pages("tensor-core", [1, 2, 3, 4, 5]) },
  { id: "nlp", category: "전공 톺아보기", title: "자연어 처리의 미래", subtitle: "전공 톺아보기 Ep.4 · 융합 데이터과학", pages: pages("nlp", [1, 2, 3, 4, 5]) },
  { id: "solid-state-battery", category: "전공 톺아보기", title: "전고체 배터리의 미래", subtitle: "전공 톺아보기 Ep.1 · 지속가능기술", pages: pages("solid-state-battery", [1, 2, 3, 4, 5, 6, 8]) }
];

// Event dates are taken from the covers; numbered episodes use their series order.
const recency = {
  kakao: { key: 1002, label: "10.02 행사" }, kist: { key: 1006, label: "10.06 행사" }, furiosa: { key: 1007, label: "10.07 행사" },
  "snuti-lounge-13": { key: 20260929, label: "2026.09.29 행사" },
  "project-management": { key: 20260716, label: "2026.07.16 행사" },
  "major-talk": { key: 20260521, label: "2026.05.21 행사" },
  "ego-trip-7": { key: 20260520, label: "2026.05.20 행사" },
  "ego-trip-6": { key: 20260513, label: "2026.05.13 행사" },
  "snuti-lounge-2": { key: 20260401, label: "2026.04.01 행사" },
  "ego-trip-1": { key: 20250318, label: "2025.03.18 행사" },
  "digital-healthcare": { key: 3, label: "Ep.3" }, "tensor-core": { key: 5, label: "Ep.5" },
  nlp: { key: 4, label: "Ep.4" }, "solid-state-battery": { key: 1, label: "Ep.1" }
};

// Split, sort each half and merge according to the selected comparison.
function mergeSort(items, compare) {
  if (items.length < 2) return items.slice();
  const middle = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, middle), compare);
  const right = mergeSort(items.slice(middle), compare);
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}

let activeCategory = categories[0];
let activeSort = "recent";
let currentWork = null;
let currentPage = 0;
const gallery = document.querySelector("#gallery");
const categoryNav = document.querySelector("#categories");
const viewer = document.querySelector("#viewer");

document.querySelector("#total-works").textContent = works.length;
document.querySelector("#total-pages").textContent = works.reduce((sum, work) => sum + work.pages.length, 0);

function renderCategories() {
  categoryNav.replaceChildren(...categories.map((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-button${activeCategory === category ? " is-active" : ""}`;
    button.setAttribute("aria-pressed", String(activeCategory === category));
    button.append(document.createTextNode(category));
    const count = document.createElement("span");
    count.textContent = String(works.filter((work) => work.category === category).length).padStart(2, "0");
    button.append(count);
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderGallery();
    });
    return button;
  }));
}

function renderGallery() {
  const matches = works.filter((work) => work.category === activeCategory);
  const compare = activeSort === "title"
    ? (a, b) => a.title.localeCompare(b.title, "ko")
    : (a, b) => recency[b.id].key - recency[a.id].key;
  const items = mergeSort(matches, compare);
  document.querySelector("#category-title").textContent = activeCategory;
  document.querySelector("#category-count").textContent = `${items.length}개 작업`;
  gallery.replaceChildren(...items.map((work, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "work-card";
    card.setAttribute("aria-label", `${work.title}, 카드뉴스 ${work.pages.length}장 보기`);

    const cover = document.createElement("span");
    cover.className = "work-cover";
    const image = document.createElement("img");
    image.src = work.pages[0].image;
    image.alt = `${work.title} 표지`;
    image.loading = index > 2 ? "lazy" : "eager";
    const pageCount = document.createElement("span");
    pageCount.className = "cover-count";
    pageCount.textContent = `${work.pages.length}장`;
    const arrow = document.createElement("span");
    arrow.className = "cover-arrow";
    arrow.textContent = "↗";
    cover.append(image, pageCount, arrow);

    const info = document.createElement("span");
    info.className = "work-info";
    const title = document.createElement("strong");
    title.textContent = work.title;
    const subtitle = document.createElement("span");
    subtitle.textContent = work.category === "전공 톺아보기" ? work.subtitle : `${work.subtitle} · ${recency[work.id].label}`;
    info.append(title, subtitle);
    card.append(cover, info);
    card.addEventListener("click", () => openViewer(work, 0));
    return card;
  }));
}

function renderViewer() {
  const page = currentWork.pages[currentPage];
  document.querySelector("#viewer-kicker").textContent = `${currentWork.category} · ARTBOARD ${page.number}`;
  document.querySelector("#viewer-title").textContent = currentWork.title;
  const image = document.querySelector("#viewer-image");
  image.src = page.image;
  image.alt = `${currentWork.title} 카드뉴스 Artboard ${page.number}`;
  document.querySelector("#viewer-page").textContent = `${currentPage + 1} / ${currentWork.pages.length}`;
  document.querySelector("#viewer-dots").replaceChildren(...currentWork.pages.map((item, index) => {
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

document.querySelector(".viewer-close").addEventListener("click", () => viewer.close());
document.querySelectorAll(".sort-button").forEach((button) => button.addEventListener("click", () => {
  activeSort = button.dataset.sort;
  document.querySelectorAll(".sort-button").forEach((item) => {
    const selected = item === button;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  renderGallery();
}));
document.querySelector(".viewer-nav.previous").addEventListener("click", () => movePage(-1));
document.querySelector(".viewer-nav.next").addEventListener("click", () => movePage(1));
viewer.addEventListener("click", (event) => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") movePage(-1);
  if (event.key === "ArrowRight") movePage(1);
});

renderCategories();
renderGallery();
})();
