-- SETU Timetable System Database Schema
-- Created for Database Development Assignment
-- Normalized to 3NF

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS scraping_metadata;
DROP TABLE IF EXISTS event_groups;
DROP TABLE IF EXISTS timetable_events;
DROP TABLE IF EXISTS event_types;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS lecturers;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS academic_weeks;
DROP TABLE IF EXISTS student_groups;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS schools;

-- Create schools table
CREATE TABLE schools (
    school_id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(school_id) ON DELETE CASCADE,
    INDEX idx_school (school_id)
);

-- Create student_groups table
CREATE TABLE student_groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    group_code VARCHAR(50) NOT NULL UNIQUE,
    group_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    INDEX idx_department (department_id)
);

-- Create academic_weeks table
CREATE TABLE academic_weeks (
    week_id INT AUTO_INCREMENT PRIMARY KEY,
    week_number INT NOT NULL,
    week_start_date DATE NOT NULL UNIQUE,
    week_label VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_week_start (week_start_date)
);

-- Create modules table
CREATE TABLE modules (
    module_id INT AUTO_INCREMENT PRIMARY KEY,
    module_code VARCHAR(20) NOT NULL UNIQUE,
    module_title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create lecturers table
CREATE TABLE lecturers (
    lecturer_id INT AUTO_INCREMENT PRIMARY KEY,
    lecturer_name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(20) NOT NULL UNIQUE,
    room_name VARCHAR(100),
    building VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create event_types table
CREATE TABLE event_types (
    event_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_code VARCHAR(10) NOT NULL UNIQUE,
    type_name VARCHAR(50) NOT NULL,
    delivery_mode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timetable_events table (main fact table)
CREATE TABLE timetable_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    week_id INT NOT NULL,
    module_id INT NOT NULL,
    lecturer_id INT,
    room_id INT,
    event_type_id INT NOT NULL,
    event_date DATE NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (week_id) REFERENCES academic_weeks(week_id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL,
    FOREIGN KEY (event_type_id) REFERENCES event_types(event_type_id) ON DELETE CASCADE,
    INDEX idx_week_date (week_id, event_date),
    INDEX idx_module (module_id),
    INDEX idx_date_time (event_date, start_time)
);

-- Create event_groups junction table (many-to-many relationship)
CREATE TABLE event_groups (
    event_group_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    group_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES timetable_events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES student_groups(group_id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_group (event_id, group_id),
    INDEX idx_event (event_id),
    INDEX idx_group (group_id)
);

-- Create scraping_metadata table
CREATE TABLE scraping_metadata (
    metadata_id INT AUTO_INCREMENT PRIMARY KEY,
    week_id INT NOT NULL,
    group_id INT NOT NULL,
    source_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'Europe/Dublin',
    scraped_at TIMESTAMP NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (week_id) REFERENCES academic_weeks(week_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES student_groups(group_id) ON DELETE CASCADE,
    UNIQUE KEY unique_week_group (week_id, group_id),
    INDEX idx_week (week_id),
    INDEX idx_group (group_id)
);
