// Create Timetable with localStorage functionality
const metaEl = document.querySelector("#meta");
const tableEl = document.querySelector("#table");
const searchInput = document.querySelector("#searchInput");
const addBtn = document.querySelector("#addBtn");
const clearBtn = document.querySelector("#clearBtn");
const addForm = document.querySelector("#addForm");
const newRowForm = document.querySelector("#newRowForm");
const cancelBtn = document.querySelector("#cancelBtn");

// Store current rows data
let currentRows = [];
let allRows = [];
const headers = ["Start", "End", "Title", "Type", "Room", "Lecturer", "Code"];
const STORAGE_KEY = "userTimetable";

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
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {{#each groupedRows}}
    <tr class="day-header">
      <td colspan="8" style="background: var(--muted); color: white; font-weight: bold; padding: 12px;">{{day}}</td>
    </tr>
    {{#each events}}
    <tr class="event" data-day="{{../day}}" data-index="{{@index}}">
      <td data-label="Start">{{Start}}</td>
      <td data-label="End">{{End}}</td>
      <td data-label="Title">{{Title}}</td>
      <td data-label="Type">{{Type}}</td>
      <td data-label="Room">{{Room}}</td>
      <td data-label="Lecturer">{{Lecturer}}</td>
      <td data-label="Code">{{Code}}</td>
      <td data-label="Actions">
        <button class="delete-btn" data-day="{{../day}}" data-index="{{@index}}">Delete</button>
      </td>
    </tr>
    {{/each}}
    {{/each}}
    {{#unless groupedRows}}
    <tr>
      <td colspan="8" style="text-align: center; padding: 20px;">No timetable entries. Click "Add New Row" to get started!</td>
    </tr>
    {{/unless}}
  </tbody>
</table>
`;

// Compile Handlebars template
const tableTemplate = Handlebars.compile(tableTemplateSource);

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRows));
    updateMeta();
  }

// Load from localStorage
function loadFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if rows are grouped
      if (parsed.length > 0 && parsed[0].Day && !parsed[0].day) {
        // if not - group them
        allRows = convertToGroupedRows(parsed);
      } else {
        allRows = parsed;
      }
      currentRows = [...allRows];
      return true;
    }
}

// Update metadata display
function updateMeta() {
  if (metaEl) {
    const totalEvents = allRows.reduce((sum, group) => sum + group.events.length, 0);
    metaEl.textContent = `Your timetable (${totalEvents} ${totalEvents === 1 ? 'entry' : 'entries'})`;
  }
}

// Creates a table with headers and rows using Handlebars template
function renderTable(headers, groupedRows) {
  const html = tableTemplate({ headers, groupedRows });
  tableEl.innerHTML = html;
  
  // Fix alternating row colors after day headers
  fixRowColors();
  
  // Add delete button event listeners
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const day = this.getAttribute("data-day");
      const index = parseInt(this.getAttribute("data-index"));
      deleteRow(day, index);
    });
  });
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
  updateSearchFeedback(searchTerm, totalEvents);
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
  saveToLocalStorage();
  searchRows(searchInput.value);
  addForm.style.display = "none";
  newRowForm.reset();
  
  // Show success message
  showMessage("Entry added successfully!", "success");
}

// Delete row function
function deleteRow(day, index) {
  // Find the day group
  const dayGroup = allRows.find(g => g.day === day);
  if (dayGroup && dayGroup.events[index]) {
    // Remove the event at the index
    dayGroup.events.splice(index, 1);
    
    // Remove day group if it has no events
    if (dayGroup.events.length === 0) {
      allRows = allRows.filter(g => g.day !== day);
    }
    
    saveToLocalStorage();
    // Update currentRows based on search
    searchRows(searchInput.value);
    
    // Show success message
    showMessage("Entry deleted successfully!", "success");
  }
}

// Clear all entries
function clearAll() {
  if (confirm("Are you sure you want to clear all timetable entries? This cannot be undone.")) {
    allRows = [];
    currentRows = [];
    saveToLocalStorage();
    searchRows("");
    showMessage("All entries cleared!", "success");
  }
}

// Validate form function
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

// Show temporary message
function showMessage(message, type) {
  const messageEl = document.createElement('div');
  messageEl.className = `message message-${type}`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#dbeafe' : '#fee2e2'};
    border: 1px solid ${type === 'success' ? '#93c5fd' : '#fecaca'};
    border-radius: 8px;
    color: ${type === 'success' ? '#1e40af' : '#991b1b'};
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(messageEl);
  
  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(messageEl);
    }, 300);
  }, 2000);
}

// Convert flat rows to grouped format
function convertToGroupedRows(flatRows) {
  const dayGroups = {};
  
  flatRows.forEach(row => {
    const day = row.Day;
    if (!dayGroups[day]) {
      dayGroups[day] = [];
    }
    dayGroups[day].push({
      "Start": row.Start,
      "End": row.End,
      "Code": row.Code,
      "Title": row.Title,
      "Type": row.Type,
      "Room": row.Room,
      "Lecturer": row.Lecturer
    });
  });
  
  // Convert to array (no sorting)
  const groupedRows = Object.keys(dayGroups).map(day => ({
    day: day,
    events: dayGroups[day]
  }));
  
  return groupedRows;
}

// Load initial data
function load() {
  if (loadFromLocalStorage()) {
    renderTable(headers, currentRows);
  } else {
    // No data in localStorage, start with empty
    allRows = [];
    currentRows = [];
    renderTable(headers, currentRows);
  }
  updateMeta();
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

addBtn.addEventListener("click", function() {
  addForm.style.display = "block";
});

cancelBtn.addEventListener("click", function() {
  addForm.style.display = "none";
  newRowForm.reset();
});

clearBtn.addEventListener("click", function() {
  clearAll();
});

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
});

// Load the page
load();

