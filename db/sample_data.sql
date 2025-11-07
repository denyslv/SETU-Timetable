-- Sample Data for SETU Timetable System
-- This file contains sample data to populate the database

-- Insert schools
INSERT INTO schools (school_name) VALUES
('School of Science and Computing');

-- Insert departments
INSERT INTO departments (school_id, department_name) VALUES
(1, 'Computing and Maths');

-- Insert student groups
INSERT INTO student_groups (department_id, group_code, group_name) VALUES
(1, 'KCRCO_B2-W_W', 'KCRCO_B2-W_W'),
(1, 'KCREA_D2-W_W', 'KCREA_D2-W_W'),
(1, 'EAUTO_B3_W', 'EAUTO_B3_W'),
(1, 'KINFT_D2-W_W', 'KINFT_D2-W_W');

-- Insert academic weeks
INSERT INTO academic_weeks (week_number, week_start_date, week_label) VALUES
(2, '2025-09-08', 'week 2 (08-SEP-25)'),
(3, '2025-09-15', 'week 3 (15-SEP-25)'),
(4, '2025-09-22', 'week 4 (22-SEP-25)'),
(5, '2025-09-29', 'week 5 (29-SEP-25)'),
(6, '2025-10-06', 'week 6 (06-OCT-25)'),
(7, '2025-10-13', 'week 7 (13-OCT-25)'),
(8, '2025-10-20', 'week 8 (20-OCT-25)'),
(9, '2025-10-27', 'week 9 (27-OCT-25)'),
(10, '2025-11-03', 'week 10 (03-NOV-25)'),
(11, '2025-11-10', 'week 11 (10-NOV-25)'),
(12, '2025-11-17', 'week 12 (17-NOV-25)'),
(13, '2025-11-24', 'week 13 (24-NOV-25)'),
(14, '2025-12-01', 'week 14 (01-DEC-25)'),
(15, '2025-12-08', 'week 15 (08-DEC-25)'),
(16, '2025-12-15', 'week 16 (15-DEC-25)'),
(17, '2025-12-22', 'week 17 (22-DEC-25)');

-- Insert modules
INSERT INTO modules (module_code, module_title) VALUES
('COMP-0592', 'Digital Audio Production'),
('COMP-0593', 'Graphic Design 2'),
('COMP-0185', 'Database Fundamentals'),
('MATH-0029', 'Mathematics for Graphics'),
('COMP-0594', 'Website Development 2'),
('COMP-0591', '2D Animation');

-- Insert lecturers
INSERT INTO lecturers (lecturer_name) VALUES
('Windle, Peter'),
('O Neill, Brenda'),
('Kealy, Anita'),
('Leonard, Francis'),
('O Halloran, Deirdre'),
('Mc Inerney, Patrick T.');

-- Insert rooms
INSERT INTO rooms (room_code, room_name) VALUES
('IT102', 'IT102'),
('IT120', 'IT120'),
('IT118', 'IT118'),
('IT221', 'IT221'),
('TL159', 'TL159'),
('IT101', 'IT101'),
('C26', 'C26'),
('FTG11', 'FTG11'),
('IT220', 'IT220'),
('W13', 'W13'),
('F27', 'F27'),
('W14', 'W14'),
('E04', 'E04'),
('FTG22', 'FTG22');

-- Insert event types
INSERT INTO event_types (type_code, type_name, delivery_mode) VALUES
('L', 'Lecture', 'OnCampus'),
('P', 'Practical', 'OnCampus'),
('T', 'Tutorial', 'OnCampus');

-- Insert timetable events for week 10 (2025-11-03)
-- Note: This is a sample of events from the JSON data
INSERT INTO timetable_events (week_id, module_id, lecturer_id, room_id, event_type_id, event_date, day_of_week, start_time, end_time, duration_hours) VALUES
-- Monday events
(9, 1, 1, 1, 2, '2025-11-03', 'Mon', '11:15:00', '12:15:00', 1.00),
(9, 1, 1, 1, 2, '2025-11-03', 'Mon', '12:15:00', '13:15:00', 1.00),
(9, 2, 2, 2, 2, '2025-11-03', 'Mon', '15:15:00', '16:15:00', 1.00),
(9, 2, 2, 2, 2, '2025-11-03', 'Mon', '16:15:00', '17:15:00', 1.00),
-- Tuesday events
(9, 2, 2, 3, 2, '2025-11-04', 'Tue', '09:15:00', '10:15:00', 1.00),
(9, 3, 3, 4, 2, '2025-11-04', 'Tue', '10:15:00', '11:15:00', 1.00),
(9, 3, 3, 4, 2, '2025-11-04', 'Tue', '11:15:00', '12:15:00', 1.00),
(9, 4, 4, 5, 1, '2025-11-04', 'Tue', '13:15:00', '14:15:00', 1.00),
(9, 4, 4, 6, 2, '2025-11-04', 'Tue', '14:15:00', '15:15:00', 1.00),
(9, 5, 5, 7, 1, '2025-11-04', 'Tue', '16:15:00', '17:15:00', 1.00),
-- Wednesday events
(9, 4, 4, 8, 3, '2025-11-05', 'Wed', '10:15:00', '11:15:00', 1.00),
(9, 4, 4, 8, 1, '2025-11-05', 'Wed', '11:15:00', '12:15:00', 1.00),
(9, 6, 6, 6, 2, '2025-11-05', 'Wed', '13:15:00', '14:15:00', 1.00),
(9, 6, 6, 6, 2, '2025-11-05', 'Wed', '14:15:00', '15:15:00', 1.00),
(9, 5, 5, 9, 2, '2025-11-05', 'Wed', '15:15:00', '16:15:00', 1.00),
(9, 5, 5, 9, 2, '2025-11-05', 'Wed', '16:15:00', '17:15:00', 1.00),
-- Thursday events
(9, 3, 3, 7, 1, '2025-11-06', 'Thu', '09:15:00', '10:15:00', 1.00),
(9, 4, 4, 10, 1, '2025-11-06', 'Thu', '11:15:00', '12:15:00', 1.00),
(9, 3, 3, 11, 1, '2025-11-06', 'Thu', '13:15:00', '14:15:00', 1.00),
(9, 2, 2, 12, 1, '2025-11-06', 'Thu', '14:15:00', '15:15:00', 1.00),
(9, 1, 1, 1, 2, '2025-11-06', 'Thu', '15:15:00', '16:15:00', 1.00),
(9, 1, 1, 1, 2, '2025-11-06', 'Thu', '16:15:00', '17:15:00', 1.00),
-- Friday events
(9, 5, 5, 13, 1, '2025-11-07', 'Fri', '09:15:00', '10:15:00', 1.00),
(9, 5, 5, 9, 2, '2025-11-07', 'Fri', '11:15:00', '12:15:00', 1.00),
(9, 3, 3, 14, 1, '2025-11-07', 'Fri', '13:15:00', '14:15:00', 1.00),
(9, 6, 6, 6, 2, '2025-11-07', 'Fri', '14:15:00', '15:15:00', 1.00),
(9, 6, 6, 6, 2, '2025-11-07', 'Fri', '15:15:00', '16:15:00', 1.00);

-- Insert event_groups relationships
-- Note: This links events to student groups based on the groupsRaw field in the JSON
-- For events that have multiple groups, we create multiple entries
INSERT INTO event_groups (event_id, group_id) VALUES
-- Monday events (group 1 and 2)
(1, 1), (1, 2),
(2, 1), (2, 2),
(3, 1), (3, 2),
(4, 1), (4, 2),
-- Tuesday events
(5, 1), (5, 2),
(6, 1), (6, 2),
(7, 1), (7, 2),
(8, 1), (8, 2),
(9, 1), (9, 2),
(10, 1), (10, 2),
-- Wednesday events
(11, 1), (11, 2),
(12, 1), (12, 2),
(13, 1), (13, 2),
(14, 1), (14, 2),
(15, 1), (15, 2),
(16, 1), (16, 2),
-- Thursday events (some have multiple groups)
(17, 1), (17, 2), (17, 3), (17, 4),
(18, 1), (18, 2),
(19, 1), (19, 2), (19, 3), (19, 4),
(20, 1), (20, 2),
(21, 1), (21, 2),
(22, 1), (22, 2),
-- Friday events
(23, 1), (23, 2),
(24, 1), (24, 2),
(25, 1), (25, 2), (25, 3), (25, 4),
(26, 1), (26, 2),
(27, 1), (27, 2);

-- Insert scraping metadata
INSERT INTO scraping_metadata (week_id, group_id, source_url, timezone, scraped_at) VALUES
(9, 1, 'https://studentssp.setu.ie/timetables/StudentGroupTT.aspx', 'Europe/Dublin', '2025-11-07 00:00:00');
