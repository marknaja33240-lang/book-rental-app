CREATE DATABASE IF NOT EXISTS book_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE book_db;

SET NAMES utf8mb4;

-- 1. หมวดหมู่หนังสือ
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. รายการหนังสือ
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    book_name VARCHAR(200) NOT NULL,
    rental_price DECIMAL(10,2) NOT NULL,
    condition_detail VARCHAR(100) DEFAULT 'สภาพดี',
    status ENUM('Available', 'Rented') DEFAULT 'Available',
    CONSTRAINT fk_book_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ข้อมูลผู้เช่า
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ข้อมูลการเช่า-คืน
CREATE TABLE IF NOT EXISTS rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    book_id INT NOT NULL,
    rental_date DATE NOT NULL,
    return_date DATE NOT NULL,
    status ENUM('Rented', 'Returned') DEFAULT 'Rented',
    CONSTRAINT fk_rental_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_rental_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ข้อมูลตัวอย่าง
INSERT INTO categories (category_name) VALUES ('วรรณกรรม / นิยาย'), ('การพัฒนาตนเอง'), ('เทคโนโลยี / คอมพิวเตอร์');
INSERT INTO books (category_id, book_name, rental_price, condition_detail, status) VALUES
(1, 'แฮร์รี่ พอตเตอร์ กับหินวิเศษ', 50.00, 'ปกแข็ง สภาพ 95%', 'Rented'),
(2, 'Atomic Habits', 40.00, 'ไม่มีรอยขีดเขียน', 'Available');

INSERT INTO customers (customer_name, phone_number) VALUES
('นายสมชาย ใจดี', '081-234-5678'),
('นางสาวมณี รักษ์ดี', '089-876-5432');

INSERT INTO rentals (customer_id, book_id, rental_date, return_date, status) VALUES
(1, 1, '2026-10-20', '2026-10-25', 'Rented');
