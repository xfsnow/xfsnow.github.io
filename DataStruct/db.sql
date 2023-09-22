-- 用户表，字段：用户ID，姓名，出生日期，身份证号，手机号，邮箱，密码，注册时间，最后登录时间

-- 查询最近30天内注册的，年龄小于18岁的用户，返回其身份证号和邮箱

SELECT DISTINCT department.name
FROM department
JOIN employee ON department.id = employee.department_id
JOIN salary_payments ON employee.id = salary_payments.employee_id
WHERE salary_payments.date BETWEEN '2020-06-01' AND '2020-06-30'
GROUP BY department.name
HAVING COUNT(employee.id) > 10;
-- 上述SQL查询的功能是什么？