function pad(n) { 
  return String(n).padStart(2, "0"); 
}

function toICSDate(dateISO, timeHHMM) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [hh, mm] = timeHHMM.split(":").map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
}

function icsEscape(s) { 
  return s.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n"); 
}

export function downloadICS(payload) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MyTimetable//EN"
  ];
  
  for (const e of payload.events) {
    const dtStart = toICSDate(e.dateISO, e.start);
    const dtEnd = toICSDate(e.dateISO, e.end);
    const title = `${e.moduleCode || ""} ${e.title || ""}`.trim();
    const desc = [e.type, e.lecturer].filter(Boolean).join(" · ");
    
    lines.push(
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID()}@mytimetable`,
      `DTSTAMP:${toICSDate(payload.meta.weekStartISO, "09:00")}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${icsEscape(title)}`,
      e.room ? `LOCATION:${icsEscape(e.room)}` : "",
      desc ? `DESCRIPTION:${icsEscape(desc)}` : "",
      "END:VEVENT"
    );
  }
  
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.filter(Boolean).join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${payload.meta.group}-${payload.meta.weekStartISO}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

