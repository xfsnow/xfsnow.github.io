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

-- 把上述代码解释成中文
-- 用户表，字段：用户ID，姓名，出生日期，身份证号，手机号，邮箱，密码，注册时间，最后登录时间

