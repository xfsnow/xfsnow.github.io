package main
import "time"
/*
表的定义是以下SQL 
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
根据表的定义，定义一个结构体User  
*/
type User struct {
  UserID int `json:"user_id"`
  Name string `json:"name"`
  Birthdate time.Time `json:"birthdate"`
  IDNumber string `json:"id_number"`
  PhoneNumber string `json:"phone_number"`
  Email string `json:"email"`
  Password string `json:"password"`
  RegistrationTime time.Time `json:"registration_time"`
  LastLoginTime time.Time `json:"last_login_time"`
  UserStatus string `json:"user_status"`
}
