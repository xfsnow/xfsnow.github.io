-- 用户表，字段：用户ID，姓名，出生日期，身份证号，手机号，邮箱，密码，注册时间，最后登录时间
CREATE TABLE users (
	user_id INT PRIMARY KEY,
	name VARCHAR(255) NOT NULL,	
	birthdate DATE NOT NULL,
	id_number VARCHAR(18) NOT NULL,
	phone_number VARCHAR(11) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_login_time TIMESTAMP,
	user_status ENUM('ACTIVE', 'INACTIVE') NOT NULL
  );

-- 查询最近30天内注册的，年龄小于18岁的用户，返回其身份证号和邮箱
SELECT id_number, email FROM users WHERE registration_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND birthdate >= DATE_SUB(CURDATE(), INTERVAL 18 YEAR);


SELECT DISTINCT department.name
FROM department
JOIN employee ON department.id = employee.department_id
JOIN salary_payments ON employee.id = salary_payments.employee_id
WHERE salary_payments.date BETWEEN '2020-06-01' AND '2020-06-30'
GROUP BY department.name
HAVING COUNT(employee.id) > 10;
-- Explanation of the above query in human readable format
-- Select the department name from the department table
-- Join the department table with the employee table on the department id
-- Join the employee table with the salary_payments table on the employee id
-- Filter the salary_payments table by date between 2020-06-01 and 2020-06-30