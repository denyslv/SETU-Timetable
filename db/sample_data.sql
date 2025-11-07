-- ===== Modules =====
INSERT OR IGNORE INTO Module (Code, Title) VALUES
 ('COMP-0592','Digital Audio Production'),
 ('COMP-0593','Graphic Design 2'),
 ('COMP-0185','Database Fundamentals'),
 ('MATH-0029','Mathematics for Graphics'),
 ('COMP-0594','Website Development 2'),
 ('COMP-0591','2D Animation');

-- ===== Lecturers =====
INSERT OR IGNORE INTO Lecturer (FullName) VALUES
 ('Windle, Peter'),
 ('O Neill, Brenda'),
 ('Kealy, Anita'),
 ('Leonard, Francis'),
 ('O Halloran, Deirdre'),
 ('Mc Inerney, Patrick T.');

-- ===== Rooms =====
INSERT OR IGNORE INTO Room (Code) VALUES
 ('IT102'),('IT120'),('IT118'),('IT221'),('TL159'),('IT101'),
 ('C26'),('FTG11'),('IT220'),('W13'),('F27'),('W14'),('E04'),('FTG22');

-- ===== Student Groups (all that appear) =====
INSERT OR IGNORE INTO StudentGroup (Code) VALUES
 ('kcrco_b2-W_W'),
 ('kcrea_d2-W_W'),
 ('eauto_b3_W'),
 ('kinft_d2-W_W');

-- Helpers to look up IDs (SQLite syntax; for Postgres replace with CTEs or run separate SELECTs)
-- Monday = 2025-11-03 week
-- Resolve IDs via subqueries in each insert.

-- ===== Sessions (Mon–Fri) =====
-- Mon
INSERT INTO Session (ModuleID,Type,Mode,DayOfWeek,StartTime,DurationHours,LecturerID,RoomID,WeekStartISO)
SELECT m.ModuleID,'P','OnCampus','Mon','11:15',1,l.LecturerID,r.RoomID,'2025-11-03'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0592' AND l.FullName='Windle, Peter' AND r.Code='IT102';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Mon','12:15',1,l.LecturerID,r.RoomID,'2025-11-03'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0592' AND l.FullName='Windle, Peter' AND r.Code='IT102';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Mon','15:15',1,l.LecturerID,r.RoomID,'2025-11-03'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0593' AND l.FullName='O Neill, Brenda' AND r.Code='IT120';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Mon','16:15',1,l.LecturerID,r.RoomID,'2025-11-03'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0593' AND l.FullName='O Neill, Brenda' AND r.Code='IT120';

-- Tue
INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Tue','09:15',1,l.LecturerID,r.RoomID,'2025-11-04'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0593' AND l.FullName='O Neill, Brenda' AND r.Code='IT118';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Tue','10:15',1,l.LecturerID,r.RoomID,'2025-11-04'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0185' AND l.FullName='Kealy, Anita' AND r.Code='IT221';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Tue','11:15',1,l.LecturerID,r.RoomID,'2025-11-04'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0185' AND l.FullName='Kealy, Anita' AND r.Code='IT221';

INSERT INTO Session (...) SELECT m.ModuleID,'L','OnCampus','Tue','13:15',1,l.LecturerID,r.RoomID,'2025-11-04'
FROM Module m, Lecturer l, Room r
WHERE m.Code='MATH-0029' AND l.FullName='Leonard, Francis' AND r.Code='TL159';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Tue','14:15',1,l.LecturerID,r.RoomID,'2025-11-04'
FROM Module m, Lecturer l, Room r
WHERE m.Code='MATH-0029' AND l.FullName='Leonard, Francis' AND r.Code='IT101';

INSERT INTO Session (...) SELECT m.ModuleID,'L','OnCampus','Tue','16:15',1,l.LecturerID,r.RoomID,'2025-11-04'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0594' AND l.FullName='O Halloran, Deirdre' AND r.Code='C26';

-- Wed
INSERT INTO Session (...) SELECT m.ModuleID,'T','OnCampus','Wed','10:15',1,l.LecturerID,r.RoomID,'2025-11-05'
FROM Module m, Lecturer l, Room r
WHERE m.Code='MATH-0029' AND l.FullName='Leonard, Francis' AND r.Code='FTG11';

INSERT INTO Session (...) SELECT m.ModuleID,'L','OnCampus','Wed','11:15',1,l.LecturerID,r.RoomID,'2025-11-05'
FROM Module m, Lecturer l, Room r
WHERE m.Code='MATH-0029' AND l.FullName='Leonard, Francis' AND r.Code='FTG11';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Wed','13:15',1,l.LecturerID,r.RoomID,'2025-11-05'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0591' AND l.FullName='Mc Inerney, Patrick T.' AND r.Code='IT101';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Wed','14:15',1,l.LecturerID,r.RoomID,'2025-11-05'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0591' AND l.FullName='Mc Inerney, Patrick T.' AND r.Code='IT101';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Wed','15:15',1,l.LecturerID,r.RoomID,'2025-11-05'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0594' AND l.FullName='O Halloran, Deirdre' AND r.Code='IT220';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Wed','16:15',1,l.LecturerID,r.RoomID,'2025-11-05'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0594' AND l.FullName='O Halloran, Deirdre' AND r.Code='IT220';

-- Thu
INSERT INTO Session (...) SELECT m.ModuleID,'L','OnCampus','Thu','09:15',1,l.LecturerID,r.RoomID,'2025-11-06'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0185' AND l.FullName='Kealy, Anita' AND r.Code='C26';

INSERT INTO Session (...) SELECT m.ModuleID,'L','OnCampus','Thu','11:15',1,l.LecturerID,r.RoomID,'2025-11-06'
FROM Module m, Lecturer l, Room r
WHERE m.Code='MATH-0029' AND l.FullName='Leonard, Francis' AND r.Code='W13';

INSERT INTO Session (...) SELECT m.ModuleID,'L','OnCampus','Thu','13:15',1,l.LecturerID,r.RoomID,'2025-11-06'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0185' AND l.FullName='Kealy, Anita' AND r.Code='F27';

INSERT INTO Session (...) SELECT m.ModuleID,'L','OnCampus','Thu','14:15',1,l.LecturerID,r.RoomID,'2025-11-06'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0593' AND l.FullName='O Neill, Brenda' AND r.Code='W14';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Thu','15:15',1,l.LecturerID,r.RoomID,'2025-11-06'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0592' AND l.FullName='Windle, Peter' AND r.Code='IT102';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Thu','16:15',1,l.LecturerID,r.RoomID,'2025-11-06'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0592' AND l.FullName='Windle, Peter' AND r.Code='IT102';

-- Fri
INSERT INTO Session (...) SELECT m.ModuleID,'L','OnCampus','Fri','09:15',1,l.LecturerID,r.RoomID,'2025-11-07'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0594' AND l.FullName='O Halloran, Deirdre' AND r.Code='E04';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Fri','11:15',1,l.LecturerID,r.RoomID,'2025-11-07'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0594' AND l.FullName='O Halloran, Deirdre' AND r.Code='IT220';

INSERT INTO Session (...) SELECT m.ModuleID,'L','OnCampus','Fri','13:15',1,l.LecturerID,r.RoomID,'2025-11-07'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0185' AND l.FullName='Kealy, Anita' AND r.Code='FTG22';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Fri','14:15',1,l.LecturerID,r.RoomID,'2025-11-07'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0591' AND l.FullName='Mc Inerney, Patrick T.' AND r.Code='IT101';

INSERT INTO Session (...) SELECT m.ModuleID,'P','OnCampus','Fri','15:15',1,l.LecturerID,r.RoomID,'2025-11-07'
FROM Module m, Lecturer l, Room r
WHERE m.Code='COMP-0591' AND l.FullName='Mc Inerney, Patrick T.' AND r.Code='IT101';

-- ===== Map sessions to groups =====
-- For every session we just inserted, attach all groups that appear in your text per row.
-- Example mapping for the first Monday 11:15 (COMP-0592): both KCRCO_B2-W_W and KCREA_D2-W_W.
-- We’ll attach by matching Module+Day+StartTime+WeekStartISO.

-- A helper view (SQLite) to fetch SessionID by a natural key:
WITH s AS (
  SELECT SessionID, m.Code AS Mod, DayOfWeek, StartTime, WeekStartISO
  FROM Session
  JOIN Module m ON m.ModuleID = Session.ModuleID
)
-- Monday
INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID
FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0592' AND s.DayOfWeek='Mon' AND s.StartTime='11:15' AND s.WeekStartISO='2025-11-03';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0592' AND s.DayOfWeek='Mon' AND s.StartTime='12:15' AND s.WeekStartISO='2025-11-03';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0593' AND s.DayOfWeek='Mon' AND s.StartTime='15:15' AND s.WeekStartISO='2025-11-03';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0593' AND s.DayOfWeek='Mon' AND s.StartTime='16:15' AND s.WeekStartISO='2025-11-03';

-- Tuesday
INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0593' AND s.DayOfWeek='Tue' AND s.StartTime='09:15' AND s.WeekStartISO='2025-11-04';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0185' AND s.DayOfWeek='Tue' AND s.StartTime='10:15' AND s.WeekStartISO='2025-11-04';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0185' AND s.DayOfWeek='Tue' AND s.StartTime='11:15' AND s.WeekStartISO='2025-11-04';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='MATH-0029' AND s.DayOfWeek='Tue' AND s.StartTime='13:15' AND s.WeekStartISO='2025-11-04';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='MATH-0029' AND s.DayOfWeek='Tue' AND s.StartTime='14:15' AND s.WeekStartISO='2025-11-04';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0594' AND s.DayOfWeek='Tue' AND s.StartTime='16:15' AND s.WeekStartISO='2025-11-04';

-- Wednesday
INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='MATH-0029' AND s.DayOfWeek='Wed' AND s.StartTime='10:15' AND s.WeekStartISO='2025-11-05';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='MATH-0029' AND s.DayOfWeek='Wed' AND s.StartTime='11:15' AND s.WeekStartISO='2025-11-05';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0591' AND s.DayOfWeek='Wed' AND s.StartTime='13:15' AND s.WeekStartISO='2025-11-05';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0591' AND s.DayOfWeek='Wed' AND s.StartTime='14:15' AND s.WeekStartISO='2025-11-05';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0594' AND s.DayOfWeek='Wed' AND s.StartTime='15:15' AND s.WeekStartISO='2025-11-05';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0594' AND s.DayOfWeek='Wed' AND s.StartTime='16:15' AND s.WeekStartISO='2025-11-05';

-- Thursday (note the 09:15/13:15 include 4 different groups)
INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('eauto_b3_W','kcrco_b2-W_W','kcrea_d2-W_W','kinft_d2-W_W')
WHERE s.Mod='COMP-0185' AND s.DayOfWeek='Thu' AND s.StartTime='09:15' AND s.WeekStartISO='2025-11-06';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='MATH-0029' AND s.DayOfWeek='Thu' AND s.StartTime='11:15' AND s.WeekStartISO='2025-11-06';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('eauto_b3_W','kcrco_b2-W_W','kcrea_d2-W_W','kinft_d2-W_W')
WHERE s.Mod='COMP-0185' AND s.DayOfWeek='Thu' AND s.StartTime='13:15' AND s.WeekStartISO='2025-11-06';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0593' AND s.DayOfWeek='Thu' AND s.StartTime='14:15' AND s.WeekStartISO='2025-11-06';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0592' AND s.DayOfWeek='Thu' AND s.StartTime='15:15' AND s.WeekStartISO='2025-11-06';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0592' AND s.DayOfWeek='Thu' AND s.StartTime='16:15' AND s.WeekStartISO='2025-11-06';

-- Friday
INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0594' AND s.DayOfWeek='Fri' AND s.StartTime='09:15' AND s.WeekStartISO='2025-11-07';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0594' AND s.DayOfWeek='Fri' AND s.StartTime='11:15' AND s.WeekStartISO='2025-11-07';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('eauto_b3_W','kcrco_b2-W_W','kcrea_d2-W_W','kinft_d2-W_W')
WHERE s.Mod='COMP-0185' AND s.DayOfWeek='Fri' AND s.StartTime='13:15' AND s.WeekStartISO='2025-11-07';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0591' AND s.DayOfWeek='Fri' AND s.StartTime='14:15' AND s.WeekStartISO='2025-11-07';

INSERT OR IGNORE INTO SessionGroup
SELECT s.SessionID, g.GroupID FROM s
JOIN StudentGroup g ON g.Code IN ('kcrco_b2-W_W','kcrea_d2-W_W')
WHERE s.Mod='COMP-0591' AND s.DayOfWeek='Fri' AND s.StartTime='15:15' AND s.WeekStartISO='2025-11-07';
