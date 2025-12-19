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
async function setupPrintMap() {
  if (!currentUnitData) {
    alert("No unit loaded to print.");
    return;
  }

  const data = currentUnitData;
  
  // Fetch header data for course name
  let courseName = "AP Computer Science Principles";
  try {
    const headerRes = await fetch("content/header.json");
    const headerData = await headerRes.json();
    courseName = headerData.courseName || courseName;
  } catch (err) {
    console.warn("Could not load header data, using default course name");
  }

  // Get source information (if available in data, otherwise use default)
  const source = data.source || "(CMU Graphics, CodeHS)";
  
  const newWindow = window.open("", "_blank");

  // Helper function to format list items with citations
  const formatListItems = (items) => {
    if (!items || !Array.isArray(items)) return "";
    return items.map(item => {
      // Check if item already has citation markers
      if (item.includes("[cite")) {
        return `<li>${item}</li>`;
      }
      return `<li>[cite_start]${item} [cite: 3]</li>`;
    }).join("");
  };

  // Helper function to format established goals with DLCS standards
  const formatEstablishedGoals = () => {
    let goalsHtml = "";
    goalsHtml += `<strong>Mass. [cite_start]Curriculum Frameworks:</strong> [cite: 3]<br>`;
    
    if (data.dlcsStandards) {
      Object.entries(data.dlcsStandards).forEach(([strand, categories]) => {
        Object.entries(categories).forEach(([cat, items]) => {
          if (items && items.length > 0) {
            // Format as "Strand [Category]" or just "Strand" if category is generic
            const categoryLabel = cat && cat !== strand ? `${strand} [${cat}]` : strand;
            goalsHtml += `[cite_start]<em>${categoryLabel}</em> [cite: 3]<br>`;
            goalsHtml += `<ul>`;
            items.forEach(item => {
              goalsHtml += `[cite_start]<li>${item} [cite: 3]</li>`;
            });
            goalsHtml += `</ul>`;
          }
        });
      });
    }
    
    // Add any additional established goals that aren't in DLCS standards
    if (data.establishedGoals?.length) {
      data.establishedGoals.forEach(goal => {
        // Only add if it's not already represented in DLCS standards
        let foundInDLCS = false;
        if (data.dlcsStandards) {
          Object.values(data.dlcsStandards).forEach(categories => {
            Object.values(categories).forEach(items => {
              if (items && items.some(item => item.includes(goal) || goal.includes(item))) {
                foundInDLCS = true;
              }
            });
          });
        }
        if (!foundInDLCS) {
          goalsHtml += `[cite_start]<li>${goal} [cite: 3]</li>`;
        }
      });
    }
    
    return goalsHtml;
  };

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.unit} Curriculum Map</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        #document-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            margin-bottom: 30px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        .header-table td {
            padding: 10px;
            border: 1px solid #000;
        }
        .stage {
            margin-bottom: 30px;
        }
        .stage-title {
            background-color: #333;
            color: white;
            padding: 10px;
            margin: 0;
            font-size: 1.1em;
            font-weight: bold;
        }
        .ubd-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 20px;
        }
        .ubd-table th,
        .ubd-table td {
            border: 1px solid #000;
            padding: 10px;
            vertical-align: top;
        }
        .table-header {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .ubd-table ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .ubd-table li {
            margin-bottom: 5px;
        }
        #export-btn {
            background-color: #1a73e8;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 4px;
            margin: 20px 0;
        }
        #export-btn:hover {
            background-color: #1557b0;
        }
        .status-message {
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
        .status-message.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status-message.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        @media print {
            #export-btn {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div id="document-container">
        <header>
            <table class="header-table">
                <tr>
                    <td><strong>Course:</strong> ${courseName}</td>
                    <td><strong>Unit:</strong> ${data.unit}</td>
                    <td>${source}</td>
                </tr>
            </table>
        </header>

        <section class="stage">
            <h3 class="stage-title">STAGE 1: DESIRED RESULTS</h3>
            <table class="ubd-table">
                <tr class="table-header">
                    <th width="50%">ESTABLISHED GOALS</th>
                    <th width="50%">TRANSFER GOALS</th>
                </tr>
                <tr>
                    <td>
                        ${formatEstablishedGoals()}
                    </td>
                    <td>
                        [cite_start]Students will be able to independently use their learning to: [cite: 3]
                        ${data.transferGoals?.length ? data.transferGoals.map(goal => 
                          `<p><strong>[cite_start]${goal} [cite: 3]</strong></p>`
                        ).join("") : ""}
                    </td>
                </tr>
                <tr class="table-header">
                    <th colspan="2">MEANING</th>
                </tr>
                <tr>
                    <td>
                        <strong>UNDERSTANDINGS:</strong><br>
                        [cite_start]Students will understand that... ${data.understandings?.length ? 
                          data.understandings.map(u => `[cite_start]${u} [cite: 3]`).join(" ") : ""}
                    </td>
                    <td>
                        <strong>ESSENTIAL QUESTIONS:</strong>
                        <ul>
                            ${formatListItems(data.essentialQuestions)}
                        </ul>
                    </td>
                </tr>
                <tr class="table-header">
                    <th colspan="2">ACQUISITION</th>
                </tr>
                <tr>
                    <td>
                        <strong>KNOWLEDGE:</strong><br>
                        Students will know...
                        <ul>
                            ${formatListItems(data.knowledge)}
                        </ul>
                    </td>
                    <td>
                        <strong>SKILLS:</strong><br>
                        Students will be skilled at...
                        <ul>
                            ${formatListItems(data.skills)}
                        </ul>
                    </td>
                </tr>
            </table>
        </section>

        <section class="stage">
            <h3 class="stage-title">STAGE 2: ASSESSMENT EVIDENCE</h3>
            <table class="ubd-table">
                <tr class="table-header">
                    <th width="50%">EVALUATIVE CRITERIA</th>
                    <th width="50%">ASSESSMENT EVIDENCE</th>
                </tr>
                <tr>
                    <td>[cite_start]Students will demonstrate their understanding through functional programs that incorporate the concepts covered in this unit. [cite: 5]</td>
                    <td>
                        <strong>Evidence Collection:</strong>
                        <ul>
                            ${data.assessment?.length ? formatListItems(data.assessment) : 
                              `<li>[cite_start]Notebooks/Portfolios [cite: 5]</li>
                               <li>[cite_start]Quizzes [cite: 5]</li>
                               <li>[cite_start]Participation in group coding exercises and peer code reviews. [cite: 5]</li>`}
                        </ul>
                        [cite_start]<p><em>At the end of this unit, students will..</em> [cite: 5]</p>
                    </td>
                </tr>
            </table>
        </section>

        <section class="stage">
            <h3 class="stage-title">STAGE 3: LEARNING PLAN</h3>
            <table class="ubd-table">
                <tr class="table-header">
                    [cite_start]<th colspan="2">SUMMARY OF KEY LEARNING EVENTS AND INSTRUCTION [cite: 7]</th>
                </tr>
                <tr>
                    <td><strong>Pre-Assessments</strong></td>
                    [cite_start]<td>Assess students' understanding of prerequisite concepts and their readiness for this unit. [cite: 7]</td>
                </tr>
                <tr>
                    <td><strong>Learning Events</strong></td>
                    <td>
                        [cite_start]<em>Activities based on curriculum resources.</em> [cite: 7]
                        <ul>
                            ${data.learningEvents?.length ? formatListItems(data.learningEvents) : ""}
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td><strong>Resources</strong></td>
                    [cite_start]<td>${data.resources?.length ? data.resources.join(", ") : "Curriculum resources"} [cite: 7]</td>
                </tr>
            </table>
        </section>

        <button id="export-btn">Copy for Google Docs</button>
        <div class="status-message" id="statusMessage"></div>
    </div>
    <script>
        document.getElementById('export-btn').addEventListener('click', function() {
            const statusMsg = document.getElementById('statusMessage');
            statusMsg.style.display = 'none';
            
            try {
                // Get the document container content
                const container = document.getElementById('document-container');
                const clone = container.cloneNode(true);
                
                // Remove the export button and status message from clone
                const exportBtn = clone.querySelector('#export-btn');
                const statusDiv = clone.querySelector('#statusMessage');
                if (exportBtn) exportBtn.remove();
                if (statusDiv) statusDiv.remove();
                
                // Convert to text, preserving structure
                let textContent = '';
                
                // Header
                const headerTable = clone.querySelector('.header-table');
                if (headerTable) {
                    const cells = headerTable.querySelectorAll('td');
                    cells.forEach(cell => {
                        textContent += cell.textContent.trim() + ' | ';
                    });
                    textContent = textContent.slice(0, -3) + '\\n\\n';
                }
                
                // Process each stage
                const stages = clone.querySelectorAll('.stage');
                stages.forEach(stage => {
                    const stageTitle = stage.querySelector('.stage-title');
                    if (stageTitle) {
                        textContent += stageTitle.textContent.trim() + '\\n\\n';
                    }
                    
                    const tables = stage.querySelectorAll('.ubd-table');
                    tables.forEach(table => {
                        const rows = table.querySelectorAll('tr');
                        rows.forEach(row => {
                            const cells = row.querySelectorAll('th, td');
                            if (cells.length > 0) {
                                const rowText = Array.from(cells).map(cell => {
                                    let cellText = cell.textContent.trim();
                                    // Clean up citation markers for readability
                                    cellText = cellText.replace(/\\[cite[^\\]]*\\]/g, '');
                                    return cellText;
                                }).join(' | ');
                                textContent += rowText + '\\n';
                            }
                        });
                        textContent += '\\n';
                    });
                });
                
                // Copy to clipboard
                navigator.clipboard.writeText(textContent).then(() => {
                    statusMsg.textContent = '✓ Content copied to clipboard! Opening Google Docs...';
                    statusMsg.className = 'status-message success';
                    statusMsg.style.display = 'block';
                    
                    // Open Google Docs
                    window.open('https://docs.google.com/document/create', '_blank');
                    
                    setTimeout(() => {
                        statusMsg.style.display = 'none';
                    }, 5000);
                }).catch(err => {
                    statusMsg.textContent = '✗ Error copying to clipboard. Please copy the content manually.';
                    statusMsg.className = 'status-message error';
                    statusMsg.style.display = 'block';
                    console.error('Clipboard error:', err);
                });
            } catch (err) {
                statusMsg.textContent = '✗ Error exporting content: ' + err.message;
                statusMsg.className = 'status-message error';
                statusMsg.style.display = 'block';
                console.error('Export error:', err);
            }
        });
    </script>
</body>
</html>`;

  newWindow.document.write(html);
  newWindow.document.close();
  newWindow.focus();
}