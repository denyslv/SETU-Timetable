// Handlebars templating for timetable
const metaEl = document.querySelector("#meta");
const tableEl = document.querySelector("#table");
const searchInput = document.querySelector("#searchInput");
const addForm = document.querySelector("#addForm");
const newRowForm = document.querySelector("#newRowForm");
const cancelBtn = document.querySelector("#cancelBtn");

// Store current rows data
let currentRows = [];
let allRows = [];
let scheduleData = null;
const headers = ["Start", "End", "Title", "Type", "Room", "Lecturer", "Code"];

// Handlebars template for table with day grouping
const tableTemplateSource = `
<table class="table">
  <thead>
    <tr>
      <th>Start</th>
      <th>End</th>
      <th>Title</th>
      <th>Type</th>
      <th>Room</th>
      <th>Lecturer</th>
      <th>Code</th>
    </tr>
  </thead>
  <tbody>
    {{#each groupedRows}}
    <tr class="day-header">
      <td colspan="7" style="background: var(--muted); color: white; font-weight: bold; padding: 12px;">{{day}}</td>
    </tr>
    {{#each events}}
    <tr class="event" data-index="{{@../index}}-{{@index}}">
      <td data-label="Start">{{Start}}</td>
      <td data-label="End">{{End}}</td>
      <td data-label="Title">{{Title}}</td>
      <td data-label="Type">{{Type}}</td>
      <td data-label="Room">{{Room}}</td>
      <td data-label="Lecturer">{{Lecturer}}</td>
      <td data-label="Code">{{Code}}</td>
    </tr>
    {{/each}}
    {{/each}}
    {{#unless groupedRows}}
    <tr>
      <td colspan="7" style="text-align: center; padding: 20px;">No timetable entries found</td>
    </tr>
    {{/unless}}
  </tbody>
</table>
`;

// Register custom Handlebars helper for time formatting
Handlebars.registerHelper('formatTime', function(time) {
  return time; // Can be extended for formatting if needed
});

// Register custom helper to check if array is empty
Handlebars.registerHelper('isEmpty', function(array) {
  return !array || array.length === 0;
});

// Compile Handlebars template
const tableTemplate = Handlebars.compile(tableTemplateSource);

// Converts the schedule data into grouped rows by day
function toGroupedRows(data) {
  if (!data || !data.events) return [];
  
  // Group events by day
  const dayGroups = {};
  data.events.forEach(e => {
    if (!dayGroups[e.day]) {
      dayGroups[e.day] = [];
    }
    dayGroups[e.day].push({
      "Start": e.start,
      "End": e.end,
      "Code": e.moduleCode,
      "Title": e.title,
      "Type": e.type,
      "Room": e.room,
      "Lecturer": e.lecturer
    });
  });
  
  // Convert to array (no sorting)
  const groupedRows = Object.keys(dayGroups).map(day => ({
    day: day,
    events: dayGroups[day]
  }));
  
  return groupedRows;
}

// Creates a table with headers and rows using Handlebars template
function renderTable(headers, groupedRows) {
  const html = tableTemplate({ headers, groupedRows });
  tableEl.innerHTML = html;
  
  // Fix alternating row colors after day headers
  fixRowColors();
}

// Fix alternating row background colors (reset after each day header)
function fixRowColors() {
  const rows = tableEl.querySelectorAll('tbody tr');
  let eventIndex = 0;
  
  rows.forEach((row) => {
    // Check if previous row is a day header to reset counter
    const prevRow = row.previousElementSibling;
    if (prevRow && prevRow.classList.contains('day-header')) {
      eventIndex = 0; // Reset counter after day header
    }
    
    // Only process event rows (not day headers)
    if (row.classList.contains('event')) {
      // Every second event (index 1, 3, 5...) gets darker color
      if (eventIndex % 2 === 1) {
        row.querySelectorAll('td').forEach(td => {
          td.style.backgroundColor = 'hsl(39, 42%, 80%)';
        });
      } else {
        // First, third, fifth... events get white (default)
        row.querySelectorAll('td').forEach(td => {
          td.style.backgroundColor = '';
        });
      }
      eventIndex++;
    }
  });
}

// Search function to filter rows with real-time updates
function searchRows(searchTerm) {
  let filteredGroupedRows;
  
  if (!searchTerm || searchTerm.trim() === "") {
    filteredGroupedRows = currentRows;
  } else {
    const term = searchTerm.toLowerCase();
    // Filter grouped rows
    filteredGroupedRows = currentRows.map(dayGroup => {
      const filteredEvents = dayGroup.events.filter(event => {
        return Object.values(event).some(value => 
          String(value).toLowerCase().includes(term)
        );
      });
      return { day: dayGroup.day, events: filteredEvents };
    }).filter(dayGroup => dayGroup.events.length > 0);
  }
  
  renderTable(headers, filteredGroupedRows);
  
  // Update search feedback - count total events
  const totalEvents = filteredGroupedRows.reduce((sum, group) => sum + group.events.length, 0);
  if (searchInput) {
    updateSearchFeedback(searchTerm, totalEvents);
  }
}

// Add new row function
function addRow(newRowData) {
  // Convert flat row to event format
  const event = {
    "Start": newRowData.Start,
    "End": newRowData.End,
    "Code": newRowData.Code,
    "Title": newRowData.Title,
    "Type": newRowData.Type,
    "Room": newRowData.Room,
    "Lecturer": newRowData.Lecturer
  };
  
  // Find or create day group
  const day = newRowData.Day;
  let dayGroup = allRows.find(g => g.day === day);
  if (!dayGroup) {
    dayGroup = { day: day, events: [] };
    allRows.push(dayGroup);
  }
  
  dayGroup.events.push(event);
  
  currentRows = [...allRows];
  searchRows(searchInput.value);
  addForm.style.display = "none";
  newRowForm.reset();
}

// Delete row function (not used in timetable page, but kept for compatibility)
function deleteRow(index) {
  // This function is not used in the timetable page
}

// Loads the schedule data from JSON and displays it in the table
async function load() {
  try {
    const response = await fetch('timetable_store.json');
    scheduleData = await response.json();
    
    // Display metadata
    if (metaEl && scheduleData.metadata) {
      metaEl.textContent = `${scheduleData.metadata.group} - ${scheduleData.metadata.weekLabel}`;
    }
    
    // Convert schedule data to grouped rows
    allRows = toGroupedRows(scheduleData);
    currentRows = [...allRows];
    renderTable(headers, currentRows);
  } catch (error) {
    console.error('Error loading schedule data:', error);
    tableEl.innerHTML = '<p class="muted">Error loading timetable data. Please try again later.</p>';
  }
}

// Dynamic validation feedback
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    const value = input.value.trim();
    if (!value) {
      input.style.borderColor = '#ef4444';
      isValid = false;
    } else {
      input.style.borderColor = '';
    }
  });
  
  return isValid;
}

// Real-time search feedback
function updateSearchFeedback(term, resultCount) {
  let feedbackEl = document.querySelector('#searchFeedback');
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.id = 'searchFeedback';
    feedbackEl.className = 'muted';
    feedbackEl.style.marginTop = '8px';
    searchInput.parentElement.appendChild(feedbackEl);
  }
  
  if (term && term.trim() !== '') {
    feedbackEl.textContent = `Found ${resultCount} ${resultCount === 1 ? 'result' : 'results'}`;
    feedbackEl.style.display = 'block';
  } else {
    feedbackEl.style.display = 'none';
  }
}

// Event listeners
if (searchInput) {
  searchInput.addEventListener("input", function() {
    const term = this.value;
    searchRows(term);
  });
  
  // Clear feedback on blur if empty
  searchInput.addEventListener("blur", function() {
    if (!this.value.trim()) {
      const feedbackEl = document.querySelector('#searchFeedback');
      if (feedbackEl) {
        feedbackEl.style.display = 'none';
      }
    }
  });
}


if (newRowForm) {
  // Real-time validation on input
  newRowForm.querySelectorAll('input[required]').forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim()) {
        this.style.borderColor = '';
      } else {
        this.style.borderColor = '#ef4444';
      }
    });
    
    input.addEventListener('input', function() {
      if (this.value.trim()) {
        this.style.borderColor = '';
      }
    });
  });
  
  newRowForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (!validateForm(this)) {
      // Show error message
      let errorMsg = document.querySelector('#formError');
      if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.id = 'formError';
        errorMsg.style.cssText = 'color: #991b1b; margin-top: 8px; font-size: 14px;';
        this.appendChild(errorMsg);
      }
      errorMsg.textContent = 'Please fill in all required fields.';
      
      setTimeout(() => {
        if (errorMsg) {
          errorMsg.textContent = '';
        }
      }, 3000);
      return;
    }
    
    const formData = new FormData(this);
    const newRow = {
      "Day": formData.get("Day"),
      "Start": formData.get("Start"),
      "End": formData.get("End"),
      "Code": formData.get("Code"),
      "Title": formData.get("Title"),
      "Type": formData.get("Type"),
      "Room": formData.get("Room"),
      "Lecturer": formData.get("Lecturer")
    };
    addRow(newRow);
    
    // Show success feedback
    showAddSuccess();
  });
}

// Show success message after adding
function showAddSuccess() {
  const successMsg = document.createElement('div');
  successMsg.textContent = 'Entry added successfully!';
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #dbeafe;
    border: 1px solid #93c5fd;
    border-radius: 8px;
    color: #1e40af;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(successMsg);
  
  setTimeout(() => {
    successMsg.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (document.body.contains(successMsg)) {
        document.body.removeChild(successMsg);
      }
    }, 300);
  }, 2000);
}

// Load the page
load();

