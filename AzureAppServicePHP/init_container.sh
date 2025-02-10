#!/bin/bash
# 所有文件都已复制到镜像的 /var/www 目录下，所有文件操作都要加上目录使用绝对路径。
# apline 默认没有 ll 命令，可以通过别名的方式实现
alias ll='ls -la'

# 使用root权限启动php, 修改最大子进程数且一次性分配, 需修改配置如下
sed 's/user = nobody/user = root/g' /etc/php84/php-fpm.d/www.conf | sed 's/group = nobody/group = root/g' | sed 's/pm.max_children = 5/pm.max_children = 30/g' | sed 's/pm = dynamic/pm = static/g' > /tmp/www.conf
# App Service 中自定义的环境变量，主要是数据库连接等机密信息需要添加到 /tmp/www.conf 文件中，php-fpm 才能用到。
# 以下命令把当前环境变量将被转换格式并写入到 /tmp/www.conf 文件中。方便后续在 App Service 控制台中调整环境变量也不用重新构建镜像。
printenv | sed -n "s/^\([^=]\+\)=\(.*\)$/env[\1]=\2/p" | sed 's/"/\\\"/g' | sed '/=/s//="/' | sed 's/$/"/' >> /tmp/www.conf

mv /tmp/www.conf /etc/php84/php-fpm.d/www.conf

# 要配置 App Service 控制台的 SSH，需要自己安装 SSH 服务，然后启动 SSH 服务，这样就可以通过 SSH 连接到容器中
echo "Preparing SSH."
# 复制 sshd_config 文件到 /etc/ssh/ 目录
cp /var/www/sshd_config /etc/ssh/
# 生成 RSA 密钥
ssh-keygen -f /etc/ssh/ssh_host_rsa_key -N '' -t rsa
# 生成 ECDSA 密钥
ssh-keygen -f /etc/ssh/ssh_host_ecdsa_key -N '' -t ecdsa
# 生成 ED25519 密钥
ssh-keygen -f /etc/ssh/ssh_host_ed25519_key -N '' -t ed25519
#prepare run dir
if [ ! -d "/var/run/sshd" ]; then
  mkdir -p /var/run/sshd
fi
/usr/sbin/sshd
echo "SSH started."

# 使用root权限启动nginx, 开启gzip压缩, 修改配置的站点配置文件，覆盖默认的站点配置
cp /var/www/nginx_default_website.conf /etc/nginx/http.d/default.conf

# Start php and nginx
/usr/sbin/php-fpm84 -R
echo "PHP started."
# 启动 Nginx 并保持前台运行
/usr/sbin/nginx -g 'daemon off;'
echo "Nginx started."