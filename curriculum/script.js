let currentUnitData = null; // store current unit

document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadNavigation();
  setupScrollToTop();
});

// -------------------------
// Load header from JSON
// -------------------------
async function loadHeader() {
  const headerDiv = document.getElementById("header");
  try {
    const res = await fetch("content/header.json");
    const data = await res.json();
    headerDiv.innerHTML = `
      <h1>${data.courseName}</h1>
      <h2>${data.school} - ${data.instructor}</h2>
      <h3>Email: <a href="mailto:${data.email}">${data.email}</a></h3>
      <hr>
    `;
  } catch (err) {
    headerDiv.innerHTML = `<p class="error">⚠️ Error loading header info</p>`;
    console.error("Error loading header.json:", err);
  }
}

// -------------------------
// Load navigation dynamically
// -------------------------
async function loadNavigation() {
  const nav = document.getElementById("nav");
  try {
    const res = await fetch("content/index.json");
    const indexData = await res.json();

    // Create search input
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search units...";
    searchInput.id = "searchInput";
    searchInput.classList.add("search-bar");
    nav.appendChild(searchInput);

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.style.display = btn.textContent.toLowerCase().includes(query) ? "block" : "none";
      });
    });

    // Unit buttons
    indexData.units.forEach(unit => {
      const btn = document.createElement("button");
      btn.textContent = unit.title;
      btn.classList.add("nav-btn");
      btn.addEventListener("click", () => loadUnit(unit.file, btn));
      nav.appendChild(btn);
    });

    // Print Map button
    const printBtn = document.createElement("button");
    printBtn.textContent = "🖨️ Print Map";
    printBtn.classList.add("sidebar-btn");
    nav.appendChild(printBtn);
    printBtn.addEventListener("click", setupPrintMap);

    // Calendar button
    const calendarBtn = document.createElement("button");
    calendarBtn.textContent = "📅 Calendar";
    calendarBtn.classList.add("sidebar-btn");
    nav.appendChild(calendarBtn);
    calendarBtn.addEventListener("click", () => {
      window.location.href = "calendar.html";
    });

    // Load first unit by default
    if (indexData.units[0]) {
      const firstBtn = nav.querySelector(".nav-btn");
      loadUnit(indexData.units[0].file, firstBtn);
    }

  } catch (err) {
    nav.innerHTML = `<p class="error">❌ Error loading index.json</p>`;
    console.error(err);
  }
}

// -------------------------
// Load a unit JSON and render
// -------------------------
async function loadUnit(file, btn) {
  try {
    const res = await fetch(`content/${file}`);
    const data = await res.json();
    currentUnitData = data; // save current unit
    highlightActiveBtn(btn);
    renderContent(data);
  } catch (err) {
    document.getElementById("content").innerHTML =
      `<p class="error">❌ Error loading page: ${err.message}</p>`;
    console.error(err);
  }
}

function highlightActiveBtn(activeBtn) {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

// -------------------------
// Render unit content dynamically
// -------------------------
function renderContent(data) {
  const contentDiv = document.getElementById("content");

  contentDiv.innerHTML = `
    <h1>${data.unit}</h1>
    ${data.overview ? `<section><h3>Overview</h3><p>${data.overview}</p></section>` : ""}
    <h2>Class Length: ${data.classLength}</h2>

    ${data.establishedGoals?.length ? `
    <section>
      <h3>Established Goals</h3>
      <ul>${data.establishedGoals.map(g => `<li>${g}</li>`).join("")}</ul>
    </section>` : ""}

    ${data.transferGoals?.length ? `
    <section>
      <h3>Transfer Goals</h3>
      <ul>${data.transferGoals.map(g => `<li>${g}</li>`).join("")}</ul>
    </section>` : ""}

    ${data.understandings?.length ? `
    <section>
      <h3>Understandings</h3>
      <ul>${data.understandings.map(u => `<li>${u}</li>`).join("")}</ul>
    </section>` : ""}

    ${data.essentialQuestions?.length ? `
    <section>
      <h3>Essential Questions</h3>
      <ul>${data.essentialQuestions.map(q => `<li>${q}</li>`).join("")}</ul>
    </section>` : ""}

    ${data.knowledge?.length ? `
    <section>
      <h3>Knowledge</h3>
      <ul>${data.knowledge.map(k => `<li>${k}</li>`).join("")}</ul>
    </section>` : ""}

    ${data.skills?.length ? `
    <section>
      <h3>Skills</h3>
      <ul>${data.skills.map(s => `<li>${s}</li>`).join("")}</ul>
    </section>` : ""}

    ${data.assessment?.length ? `
    <section>
      <h3>Assessment</h3>
      <ul>${data.assessment.map(a => `<li>${a}</li>`).join("")}</ul>
    </section>` : ""}

    ${data.learningEvents?.length ? `
    <section>
      <h3>Learning Events</h3>
      <ul>${data.learningEvents.map(e => `<li>${e}</li>`).join("")}</ul>
    </section>` : ""}

    ${data.resources?.length ? `
    <section>
      <h3>Resources</h3>
      <ul>${data.resources.map(r => `<li>${r}</li>`).join("")}</ul>
    </section>` : ""}

    ${data.dlcsStandards ? `
    <section>
      <h3>MA DLCS Curriculum Standards (Grades 9–12)</h3>
      ${Object.entries(data.dlcsStandards).map(([strand, categories]) => `
        <h4>${strand}</h4>
        ${Object.entries(categories).map(([cat, items]) => `
          <h5>${cat}</h5>
          <ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>
        `).join("")}
      `).join("")}
    </section>` : ""}
  `;

  contentDiv.classList.add("fade-in");
}

// -------------------------
// Scroll-To-Top Button
// -------------------------
function setupScrollToTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 200 ? "block" : "none";
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// -------------------------
// Print Map functionality
// -------------------------
function setupPrintMap() {
  if (!currentUnitData) {
    alert("No unit loaded to print.");
    return;
  }

  const data = currentUnitData;
  const newWindow = window.open("", "_blank");

  let html = `
    <html>
    <head>
      <title>${data.unit} - Map</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; }
        h1 { font-size: 1.8rem; margin-bottom: 10px; }
        h2 { font-size: 1.2rem; margin-bottom: 8px; }
        h3 { font-size: 1rem; margin-top: 15px; margin-bottom: 5px; }
        ul { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 4px; }
      </style>
    </head>
    <body>
      <h1>${data.unit}</h1>
      ${data.overview ? `<h3>Overview</h3><p>${data.overview}</p>` : ""}
      <h2>Class Length: ${data.classLength}</h2>
  `;

  const sections = [
    { title: "Established Goals", key: "establishedGoals" },
    { title: "Transfer Goals", key: "transferGoals" },
    { title: "Understandings", key: "understandings" },
    { title: "Essential Questions", key: "essentialQuestions" },
    { title: "Knowledge", key: "knowledge" },
    { title: "Skills", key: "skills" },
    { title: "Assessment", key: "assessment" },
    { title: "Learning Events", key: "learningEvents" },
    { title: "Resources", key: "resources" }
  ];

  sections.forEach(sec => {
    if (data[sec.key]?.length) {
      html += `<h3>${sec.title}</h3><ul>`;
      data[sec.key].forEach(item => html += `<li>${item}</li>`);
      html += `</ul>`;
    }
  });

  if (data.dlcsStandards) {
    html += `<h3>MA DLCS Curriculum Standards (Grades 9–12)</h3>`;
    Object.entries(data.dlcsStandards).forEach(([strand, categories]) => {
      html += `<h4>${strand}</h4>`;
      Object.entries(categories).forEach(([cat, items]) => {
        html += `<h5>${cat}</h5><ul>`;
        items.forEach(i => html += `<li>${i}</li>`);
        html += `</ul>`;
      });
    });
  }

  html += `</body></html>`;
  newWindow.document.write(html);
  newWindow.document.close();
  newWindow.focus();
}