# Database Design for SETU Timetable System

## System Description

The SETU Timetable System is designed to store and manage academic timetable data for South East Technological University. The system stores information about:

- **Academic Structure**: Schools, departments, and student groups
- **Timetable Data**: Weekly schedules with events (lectures, practicals, tutorials)
- **Resources**: Modules, lecturers, and rooms
- **Metadata**: Data scraping information and timezone settings

The database supports multiple student groups across different weeks, with the ability to track which groups share events, manage room assignments, and maintain historical timetable data.

---

## Database Entries (Tables/Entities)

### 1. **schools**
Stores information about academic schools within the university.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| school_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the school |
| school_name | VARCHAR(100) | NOT NULL, UNIQUE | Name of the school (e.g., "School of Science and Computing") |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Sample Data:**
- school_id: 1, school_name: "School of Science and Computing"

---

### 2. **departments**
Stores departments within schools.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| department_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the department |
| school_id | INT | FOREIGN KEY (schools.school_id), NOT NULL | Reference to the parent school |
| department_name | VARCHAR(100) | NOT NULL | Name of the department (e.g., "Computing and Maths") |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Sample Data:**
- department_id: 1, school_id: 1, department_name: "Computing and Maths"

---

### 3. **student_groups**
Stores student group information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| group_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the group |
| department_id | INT | FOREIGN KEY (departments.department_id), NOT NULL | Reference to the department |
| group_code | VARCHAR(50) | NOT NULL, UNIQUE | Group code (e.g., "KCRCO_B2-W_W") |
| group_name | VARCHAR(100) | | Display name for the group |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Sample Data:**
- group_id: 1, department_id: 1, group_code: "KCRCO_B2-W_W", group_name: "KCRCO_B2-W_W"
- group_id: 2, department_id: 1, group_code: "KCREA_D2-W_W", group_name: "KCREA_D2-W_W"

---

### 4. **academic_weeks**
Stores academic week information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| week_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the week |
| week_number | INT | NOT NULL | Week number (e.g., 2, 3, 10) |
| week_start_date | DATE | NOT NULL, UNIQUE | ISO date of week start (e.g., "2025-11-03") |
| week_label | VARCHAR(50) | NOT NULL | Display label (e.g., "week 10 (03-NOV-25)") |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Sample Data:**
- week_id: 1, week_number: 10, week_start_date: "2025-11-03", week_label: "week 10 (03-NOV-25)"

---

### 5. **modules**
Stores module/course information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| module_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the module |
| module_code | VARCHAR(20) | NOT NULL, UNIQUE | Module code (e.g., "COMP-0592") |
| module_title | VARCHAR(200) | NOT NULL | Module title (e.g., "Digital Audio Production") |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Sample Data:**
- module_id: 1, module_code: "COMP-0592", module_title: "Digital Audio Production"
- module_id: 2, module_code: "COMP-0185", module_title: "Database Fundamentals"

---

### 6. **lecturers**
Stores lecturer/staff information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| lecturer_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the lecturer |
| lecturer_name | VARCHAR(100) | NOT NULL, UNIQUE | Full name (e.g., "Windle, Peter") |
| email | VARCHAR(100) | | Email address (optional) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Sample Data:**
- lecturer_id: 1, lecturer_name: "Windle, Peter"
- lecturer_id: 2, lecturer_name: "Kealy, Anita"

---

### 7. **rooms**
Stores room/location information.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| room_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the room |
| room_code | VARCHAR(20) | NOT NULL, UNIQUE | Room code (e.g., "IT102", "C26") |
| room_name | VARCHAR(100) | | Full room name/description |
| capacity | INT | | Maximum capacity |
| building | VARCHAR(50) | | Building name |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Sample Data:**
- room_id: 1, room_code: "IT102", room_name: "IT102", capacity: 30
- room_id: 2, room_code: "C26", room_name: "C26", capacity: 50

---

### 8. **event_types**
Stores event type classifications.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| event_type_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the event type |
| type_code | VARCHAR(10) | NOT NULL, UNIQUE | Type code (e.g., "L", "P", "T") |
| type_name | VARCHAR(50) | NOT NULL | Full type name (e.g., "Lecture", "Practical", "Tutorial") |
| delivery_mode | VARCHAR(50) | | Delivery mode (e.g., "OnCampus", "Online") |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Sample Data:**
- event_type_id: 1, type_code: "L", type_name: "Lecture", delivery_mode: "OnCampus"
- event_type_id: 2, type_code: "P", type_name: "Practical", delivery_mode: "OnCampus"
- event_type_id: 3, type_code: "T", type_name: "Tutorial", delivery_mode: "OnCampus"

---

### 9. **timetable_events**
Stores individual timetable events (main fact table).

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| event_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the event |
| week_id | INT | FOREIGN KEY (academic_weeks.week_id), NOT NULL | Reference to the academic week |
| module_id | INT | FOREIGN KEY (modules.module_id), NOT NULL | Reference to the module |
| lecturer_id | INT | FOREIGN KEY (lecturers.lecturer_id) | Reference to the lecturer (nullable) |
| room_id | INT | FOREIGN KEY (rooms.room_id) | Reference to the room (nullable) |
| event_type_id | INT | FOREIGN KEY (event_types.event_type_id), NOT NULL | Reference to the event type |
| event_date | DATE | NOT NULL | Date of the event (ISO format) |
| day_of_week | VARCHAR(10) | NOT NULL | Day abbreviation (e.g., "Mon", "Tue") |
| start_time | TIME | NOT NULL | Start time (e.g., "11:15:00") |
| end_time | TIME | NOT NULL | End time (e.g., "12:15:00") |
| duration_hours | DECIMAL(3,2) | | Duration in hours |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Indexes:**
- INDEX idx_week_date (week_id, event_date)
- INDEX idx_module (module_id)
- INDEX idx_date_time (event_date, start_time)

**Sample Data:**
- event_id: 1, week_id: 1, module_id: 1, lecturer_id: 1, room_id: 1, event_type_id: 2, event_date: "2025-11-03", day_of_week: "Mon", start_time: "11:15:00", end_time: "12:15:00", duration_hours: 1.00

---

### 10. **event_groups** (Junction Table)
Many-to-many relationship between events and student groups (an event can have multiple groups).

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| event_group_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| event_id | INT | FOREIGN KEY (timetable_events.event_id), NOT NULL | Reference to the event |
| group_id | INT | FOREIGN KEY (student_groups.group_id), NOT NULL | Reference to the student group |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Composite Unique Constraint:**
- UNIQUE (event_id, group_id) - Prevents duplicate group assignments

**Indexes:**
- INDEX idx_event (event_id)
- INDEX idx_group (group_id)

**Sample Data:**
- event_group_id: 1, event_id: 1, group_id: 1
- event_group_id: 2, event_id: 1, group_id: 2

---

### 11. **scraping_metadata**
Stores metadata about data scraping operations.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| metadata_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| week_id | INT | FOREIGN KEY (academic_weeks.week_id), NOT NULL | Reference to the academic week |
| group_id | INT | FOREIGN KEY (student_groups.group_id), NOT NULL | Reference to the student group |
| source_url | VARCHAR(500) | | Source URL where data was scraped |
| timezone | VARCHAR(50) | DEFAULT 'Europe/Dublin' | Timezone for the data |
| scraped_at | TIMESTAMP | NOT NULL | When the data was scraped |
| last_updated | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Composite Unique Constraint:**
- UNIQUE (week_id, group_id) - One metadata record per week-group combination

**Sample Data:**
- metadata_id: 1, week_id: 1, group_id: 1, source_url: "https://studentssp.setu.ie/timetables/StudentGroupTT.aspx", timezone: "Europe/Dublin", scraped_at: "2025-11-07 00:00:00"

---

## Normalization Analysis

### First Normal Form (1NF)
- ✅ All tables have atomic values (no repeating groups)
- ✅ Each column contains single values
- ✅ All rows are unique

### Second Normal Form (2NF)
- ✅ All tables are in 1NF
- ✅ All non-key attributes are fully dependent on the primary key
- ✅ Junction table (event_groups) properly handles many-to-many relationships

### Third Normal Form (3NF)
- ✅ All tables are in 2NF
- ✅ No transitive dependencies exist
- ✅ Example: In `timetable_events`, all attributes directly relate to the event, not through other attributes

### Additional Normalization Considerations
- **Event Types**: Separated into its own table to avoid redundancy (type codes and names stored once)
- **Many-to-Many Relationships**: Properly handled with junction table (`event_groups`) for events and groups
- **Referential Integrity**: All foreign keys properly defined to maintain data consistency
- **Indexes**: Strategic indexes on frequently queried columns for performance

---

## Conceptual Data Model

### Entity Relationship Diagram Description

```
┌─────────────┐
│   schools   │
│─────────────│
│ school_id*  │
│ school_name │
└──────┬──────┘
       │ 1
       │
       │ M
┌──────▼──────────┐
│  departments    │
│────────────────│
│ department_id* │
│ school_id      │──FK
│ department_name│
└──────┬─────────┘
       │ 1
       │
       │ M
┌──────▼──────────┐
│ student_groups │
│────────────────│
│ group_id*      │
│ department_id  │──FK
│ group_code     │
│ group_name     │
└──────┬─────────┘
       │ M
       │
       │ M
       │
┌──────▼──────────────┐     ┌──────────────┐
│   event_groups      │     │academic_weeks│
│  (Junction Table)   │     │──────────────│
│────────────────────│     │ week_id*     │
│ event_group_id*    │     │ week_number  │
│ event_id           │──FK │ week_start_  │
│ group_id           │──FK │   date      │
└──────┬─────────────┘     │ week_label   │
       │ M                 └──────┬───────┘
       │                          │ 1
       │ 1                        │
       │                          │ M
┌──────▼──────────────────────────▼──────┐
│      timetable_events                  │
│────────────────────────────────────────│
│ event_id*                              │
│ week_id              ──FK              │
│ module_id            ──FK              │
│ lecturer_id          ──FK              │
│ room_id              ──FK              │
│ event_type_id        ──FK              │
│ event_date                              │
│ day_of_week                             │
│ start_time                              │
│ end_time                                │
│ duration_hours                          │
└──────┬──────────────────────────────────┘
       │
       │ M
       │
       │ 1
┌──────▼──────────┐  ┌──────────────┐  ┌──────────────┐
│    modules      │  │  lecturers   │  │    rooms     │
│────────────────│  │──────────────│  │──────────────│
│ module_id*     │  │ lecturer_id* │  │ room_id*     │
│ module_code    │  │ lecturer_    │  │ room_code    │
│ module_title   │  │   name       │  │ room_name    │
└────────────────┘  └──────────────┘  └──────────────┘

┌─────────────────┐
│  event_types    │
│─────────────────│
│ event_type_id* │
│ type_code      │
│ type_name      │
│ delivery_mode  │
└─────────────────┘

┌──────────────────┐
│scraping_metadata │
│──────────────────│
│ metadata_id*     │
│ week_id      ──FK│
│ group_id     ──FK│
│ source_url       │
│ timezone         │
│ scraped_at       │
└──────────────────┘
```

### Key Relationships:

1. **schools** → **departments** (1:M)
   - One school has many departments
   - Foreign key: `departments.school_id`

2. **departments** → **student_groups** (1:M)
   - One department has many student groups
   - Foreign key: `student_groups.department_id`

3. **academic_weeks** → **timetable_events** (1:M)
   - One week has many events
   - Foreign key: `timetable_events.week_id`

4. **modules** → **timetable_events** (1:M)
   - One module has many events
   - Foreign key: `timetable_events.module_id`

5. **lecturers** → **timetable_events** (1:M)
   - One lecturer can teach many events
   - Foreign key: `timetable_events.lecturer_id` (nullable)

6. **rooms** → **timetable_events** (1:M)
   - One room can host many events
   - Foreign key: `timetable_events.room_id` (nullable)

7. **event_types** → **timetable_events** (1:M)
   - One event type has many events
   - Foreign key: `timetable_events.event_type_id`

8. **timetable_events** ↔ **student_groups** (M:M)
   - Many events can have many groups
   - Junction table: `event_groups`
   - Foreign keys: `event_groups.event_id`, `event_groups.group_id`

9. **academic_weeks** + **student_groups** → **scraping_metadata** (M:M)
   - One metadata record per week-group combination
   - Foreign keys: `scraping_metadata.week_id`, `scraping_metadata.group_id`

---

## Database Design Benefits

1. **Data Integrity**: Foreign key constraints ensure referential integrity
2. **Elimination of Redundancy**: Normalized structure prevents duplicate data
3. **Scalability**: Easy to add new schools, departments, groups, modules, etc.
4. **Query Performance**: Indexes on frequently queried columns
5. **Flexibility**: Supports multiple groups per event, optional lecturers/rooms
6. **Historical Tracking**: Timestamps track when data was created/updated
7. **Audit Trail**: Scraping metadata table tracks data source and collection time

---

## Sample Queries

### Get all events for a specific group and week:
```sql
SELECT 
    te.event_date,
    te.day_of_week,
    te.start_time,
    te.end_time,
    m.module_code,
    m.module_title,
    et.type_name,
    r.room_code,
    l.lecturer_name
FROM timetable_events te
JOIN event_groups eg ON te.event_id = eg.event_id
JOIN student_groups sg ON eg.group_id = sg.group_id
JOIN modules m ON te.module_id = m.module_id
JOIN event_types et ON te.event_type_id = et.event_type_id
LEFT JOIN rooms r ON te.room_id = r.room_id
LEFT JOIN lecturers l ON te.lecturer_id = l.lecturer_id
JOIN academic_weeks aw ON te.week_id = aw.week_id
WHERE sg.group_code = 'KCRCO_B2-W_W'
  AND aw.week_start_date = '2025-11-03'
ORDER BY te.event_date, te.start_time;
```

### Get all groups sharing an event:
```sql
SELECT 
    sg.group_code,
    sg.group_name
FROM student_groups sg
JOIN event_groups eg ON sg.group_id = eg.group_id
WHERE eg.event_id = 1;
```

### Get room utilization for a specific week:
```sql
SELECT 
    r.room_code,
    COUNT(te.event_id) as event_count,
    SUM(te.duration_hours) as total_hours
FROM rooms r
JOIN timetable_events te ON r.room_id = te.room_id
JOIN academic_weeks aw ON te.week_id = aw.week_id
WHERE aw.week_start_date = '2025-11-03'
GROUP BY r.room_id, r.room_code
ORDER BY event_count DESC;
```

