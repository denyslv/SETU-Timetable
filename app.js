// Schedule data embedded in the JavaScript file
const scheduleData = {
  metadata: {
    group: "KCRCO_B2-W_W",
    weekLabel: "week 10 (03-NOV-25)"
  },
  events: [
    { day: "Mon", start: "11:15", end: "12:15", moduleCode: "COMP-0592", title: "Digital Audio Production", type: "P - OnCampus", room: "IT102", lecturer: "Windle, Peter" },
    { day: "Mon", start: "12:15", end: "13:15", moduleCode: "COMP-0592", title: "Digital Audio Production", type: "P - OnCampus", room: "IT102", lecturer: "Windle, Peter" },
    { day: "Mon", start: "15:15", end: "16:15", moduleCode: "COMP-0593", title: "Graphic Design 2", type: "P - OnCampus", room: "IT120", lecturer: "O Neill, Brenda" },
    { day: "Mon", start: "16:15", end: "17:15", moduleCode: "COMP-0593", title: "Graphic Design 2", type: "P - OnCampus", room: "IT120", lecturer: "O Neill, Brenda" },
    { day: "Tue", start: "09:15", end: "10:15", moduleCode: "COMP-0593", title: "Graphic Design 2", type: "P - OnCampus", room: "IT118", lecturer: "O Neill, Brenda" },
    { day: "Tue", start: "10:15", end: "11:15", moduleCode: "COMP-0185", title: "Database Fundamentals", type: "P - OnCampus", room: "IT221", lecturer: "Kealy, Anita" },
    { day: "Tue", start: "11:15", end: "12:15", moduleCode: "COMP-0185", title: "Database Fundamentals", type: "P - OnCampus", room: "IT221", lecturer: "Kealy, Anita" },
    { day: "Tue", start: "13:15", end: "14:15", moduleCode: "MATH-0029", title: "Mathematics for Graphics", type: "L - OnCampus", room: "TL159", lecturer: "Leonard, Francis" },
    { day: "Tue", start: "14:15", end: "15:15", moduleCode: "MATH-0029", title: "Mathematics for Graphics", type: "P - OnCampus", room: "IT101", lecturer: "Leonard, Francis" },
    { day: "Tue", start: "16:15", end: "17:15", moduleCode: "COMP-0594", title: "Website Development 2", type: "L - OnCampus", room: "C26", lecturer: "O Halloran, Deirdre" },
    { day: "Wed", start: "10:15", end: "11:15", moduleCode: "MATH-0029", title: "Mathematics for Graphics", type: "T - OnCampus", room: "FTG11", lecturer: "Leonard, Francis" },
    { day: "Wed", start: "11:15", end: "12:15", moduleCode: "MATH-0029", title: "Mathematics for Graphics", type: "L - OnCampus", room: "FTG11", lecturer: "Leonard, Francis" },
    { day: "Wed", start: "13:15", end: "14:15", moduleCode: "COMP-0591", title: "2D Animation", type: "P - OnCampus", room: "IT101", lecturer: "Mc Inerney, Patrick T." },
    { day: "Wed", start: "14:15", end: "15:15", moduleCode: "COMP-0591", title: "2D Animation", type: "P - OnCampus", room: "IT101", lecturer: "Mc Inerney, Patrick T." },
    { day: "Wed", start: "15:15", end: "16:15", moduleCode: "COMP-0594", title: "Website Development 2", type: "P - OnCampus", room: "IT220", lecturer: "O Halloran, Deirdre" },
    { day: "Wed", start: "16:15", end: "17:15", moduleCode: "COMP-0594", title: "Website Development 2", type: "P - OnCampus", room: "IT220", lecturer: "O Halloran, Deirdre" },
    { day: "Thu", start: "09:15", end: "10:15", moduleCode: "COMP-0185", title: "Database Fundamentals", type: "L - OnCampus", room: "C26", lecturer: "Kealy, Anita" },
    { day: "Thu", start: "11:15", end: "12:15", moduleCode: "MATH-0029", title: "Mathematics for Graphics", type: "L - OnCampus", room: "W13", lecturer: "Leonard, Francis" },
    { day: "Thu", start: "13:15", end: "14:15", moduleCode: "COMP-0185", title: "Database Fundamentals", type: "L - OnCampus", room: "F27", lecturer: "Kealy, Anita" },
    { day: "Thu", start: "14:15", end: "15:15", moduleCode: "COMP-0593", title: "Graphic Design 2", type: "L - OnCampus", room: "W14", lecturer: "O Neill, Brenda" },
    { day: "Thu", start: "15:15", end: "16:15", moduleCode: "COMP-0592", title: "Digital Audio Production", type: "P - OnCampus", room: "IT102", lecturer: "Windle, Peter" },
    { day: "Thu", start: "16:15", end: "17:15", moduleCode: "COMP-0592", title: "Digital Audio Production", type: "P - OnCampus", room: "IT102", lecturer: "Windle, Peter" },
    { day: "Fri", start: "09:15", end: "10:15", moduleCode: "COMP-0594", title: "Website Development 2", type: "L - OnCampus", room: "E04", lecturer: "O Halloran, Deirdre" },
    { day: "Fri", start: "11:15", end: "12:15", moduleCode: "COMP-0594", title: "Website Development 2", type: "P - OnCampus", room: "IT220", lecturer: "O Halloran, Deirdre" },
    { day: "Fri", start: "13:15", end: "14:15", moduleCode: "COMP-0185", title: "Database Fundamentals", type: "L - OnCampus", room: "FTG22", lecturer: "Kealy, Anita" },
    { day: "Fri", start: "14:15", end: "15:15", moduleCode: "COMP-0591", title: "2D Animation", type: "P - OnCampus", room: "IT101", lecturer: "Mc Inerney, Patrick T." },
    { day: "Fri", start: "15:15", end: "16:15", moduleCode: "COMP-0591", title: "2D Animation", type: "P - OnCampus", room: "IT101", lecturer: "Mc Inerney, Patrick T." }
  ]
};

const metaEl = document.querySelector("#meta");
const tableEl = document.querySelector("#table");
const searchInput = document.querySelector("#searchInput");
const addBtn = document.querySelector("#addBtn");
const addForm = document.querySelector("#addForm");
const newRowForm = document.querySelector("#newRowForm");
const cancelBtn = document.querySelector("#cancelBtn");

// Store current rows data
let currentRows = [];
let allRows = [];
const headers = ["Day", "Start", "End", "Code", "Title", "Type", "Room", "Lecturer"];

// Creates a table with headers and rows and displays it on the page
function renderTable(headers, rows) {
  let tableHTML = '<table class="table"><thead><tr>';
  
  //For each header, add a th element
  headers.forEach(h => {
    tableHTML += `<th>${h}</th>`;
  });
  tableHTML += '<th>Actions</th>';
  
  tableHTML += '</tr></thead><tbody>';
  
  //For each row, add a tr element
  rows.forEach((r, index) => {
    tableHTML += '<tr data-index="' + index + '">';
    headers.forEach(h => {
      //get the value of the row for each header
      const value = r[h] || "";
      tableHTML += `<td data-label="${h}">${value}</td>`;
    });
    tableHTML += '<td data-label="Actions"><button class="delete-btn" data-index="' + index + '">Delete</button></td>';
    tableHTML += '</tr>';
  });
  
  tableHTML += '</tbody></table>';
  tableEl.innerHTML = tableHTML;
  
  // Add delete button event listeners
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const index = parseInt(this.getAttribute("data-index"));
      deleteRow(index);
    });
  });
}

// Converts the schedule data into an array of objects with headers and rows
function toRows(data) {
  const rows = data.events.map(e => ({
    "Day": e.day,
    "Start": e.start,
    "End": e.end,
    "Code": e.moduleCode,
    "Title": e.title,
    "Type": e.type,
    "Room": e.room,
    "Lecturer": e.lecturer
  }));
  return rows;
}

// Search function to filter rows
function searchRows(searchTerm) {
  if (!searchTerm || searchTerm.trim() === "") {
    currentRows = [...allRows];
  } else {
    const term = searchTerm.toLowerCase();
    currentRows = allRows.filter(row => {
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(term)
      );
    });
  }
  renderTable(headers, currentRows);
}

// Add new row function
function addRow(newRowData) {
  allRows.push(newRowData);
  currentRows = [...allRows];
  searchRows(searchInput.value);
  addForm.style.display = "none";
  newRowForm.reset();
}

// Delete row function
function deleteRow(index) {
  const rowToDelete = currentRows[index];
  // Find and remove from allRows by comparing all properties
  allRows = allRows.filter(row => {
    let isMatch = true;
    headers.forEach(header => {
      if (row[header] !== rowToDelete[header]) {
        isMatch = false;
      }
    });
    return !isMatch;
  });
  // Update currentRows based on search
  searchRows(searchInput.value);
}

// Loads the schedule data and displays it in the table
function load() {
  metaEl.textContent = `${scheduleData.metadata.group} · ${scheduleData.metadata.weekLabel}`;
  allRows = toRows(scheduleData);
  currentRows = [...allRows];
  renderTable(headers, currentRows);
}

// Event listeners
searchInput.addEventListener("input", function() {
  searchRows(this.value);
});

addBtn.addEventListener("click", function() {
  addForm.style.display = "block";
});

cancelBtn.addEventListener("click", function() {
  addForm.style.display = "none";
  newRowForm.reset();
});

newRowForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const newRow = {};
  headers.forEach(header => {
    newRow[header] = formData.get(header);
  });
  addRow(newRow);
});

// Load the page
load();
