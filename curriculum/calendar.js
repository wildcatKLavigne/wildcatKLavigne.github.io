let scheduleData = [];
let currentMonthIndex = 0; // Will be set automatically to current month

document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();
  document.getElementById("prevMonthBtn").addEventListener("click", prevMonth);
  document.getElementById("nextMonthBtn").addEventListener("click", nextMonth);
});

async function loadSchedule() {
  try {
    const res = await fetch("content/schedule.json");
    scheduleData = await res.json();

    if (!scheduleData || !scheduleData.months || !scheduleData.months.length) {
      throw new Error("Schedule JSON is empty or invalid");
    }

    // Auto-select current month
    const today = new Date();
    const currentMonthName = today.toLocaleString("default", { month: "long" });
    const currentYear = today.getFullYear();

    const monthIndex = scheduleData.months.findIndex(month => {
      return month.name.includes(currentMonthName) && month.name.includes(currentYear);
    });

    currentMonthIndex = monthIndex !== -1 ? monthIndex : 0;

    renderCalendar();
  } catch (err) {
    document.getElementById("calendarContent").innerHTML = `<p class="error">Error loading calendar: ${err.message}</p>`;
    console.error(err);
  }
}

function renderCalendar() {
  const monthData = scheduleData.months[currentMonthIndex];
  document.getElementById("currentMonth").textContent = monthData.name;

  const body = document.getElementById("calendarBody");
  body.innerHTML = ""; // Clear previous content

  // Optional: unique colors per unit
  const unitColors = {
    "Unit 1": "#f9c74f",
    "Unit 2": "#90be6d",
    "Unit 3": "#f9844a",
    "Unit 4": "#577590"
  };

  monthData.days.forEach(day => {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day-block");
    if (day.noSchool) dayDiv.classList.add("no-school");

    if (day.unit && unitColors[day.unit]) {
      dayDiv.style.borderColor = unitColors[day.unit];
      dayDiv.style.backgroundColor = `${unitColors[day.unit]}33`; // light tint
    }

    dayDiv.innerHTML = `
      <span class="day-date">${day.date}</span><br>
      <span class="day-unit">${day.unit || ""}</span><br>
      <span class="day-activity">${day.activity}</span>
    `;
    body.appendChild(dayDiv);
  });
}

function prevMonth() {
  if (currentMonthIndex > 0) {
    currentMonthIndex--;
    renderCalendar();
  }
}

function nextMonth() {
  if (currentMonthIndex < scheduleData.months.length - 1) {
    currentMonthIndex++;
    renderCalendar();
  }
}