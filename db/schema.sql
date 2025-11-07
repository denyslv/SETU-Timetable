-- ===== Core reference tables =====
CREATE TABLE IF NOT EXISTS Module (
  ModuleID     INTEGER PRIMARY KEY,
  Code         TEXT UNIQUE NOT NULL,
  Title        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Lecturer (
  LecturerID   INTEGER PRIMARY KEY,
  FullName     TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Room (
  RoomID       INTEGER PRIMARY KEY,
  Code         TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS StudentGroup (
  GroupID      INTEGER PRIMARY KEY,
  Code         TEXT UNIQUE NOT NULL
);

-- ===== Timetabled sessions =====
-- weekStartISO = Monday (yyyy-mm-dd) for the timetable week
CREATE TABLE IF NOT EXISTS Session (
  SessionID      INTEGER PRIMARY KEY,
  ModuleID       INTEGER NOT NULL REFERENCES Module(ModuleID),
  Type           TEXT NOT NULL,              -- 'L'|'P'|'T'
  Mode           TEXT NOT NULL,              -- 'OnCampus' (etc.)
  DayOfWeek      TEXT NOT NULL,              -- 'Mon'..'Sun'
  StartTime      TEXT NOT NULL,              -- 'HH:MM'
  DurationHours  INTEGER NOT NULL,           -- usually 1
  LecturerID     INTEGER NOT NULL REFERENCES Lecturer(LecturerID),
  RoomID         INTEGER NOT NULL REFERENCES Room(RoomID),
  WeekStartISO   TEXT NOT NULL               -- '2025-11-03'
);

-- many-to-many: a session can belong to multiple groups
CREATE TABLE IF NOT EXISTS SessionGroup (
  SessionID   INTEGER NOT NULL REFERENCES Session(SessionID),
  GroupID     INTEGER NOT NULL REFERENCES StudentGroup(GroupID),
  PRIMARY KEY (SessionID, GroupID)
);
