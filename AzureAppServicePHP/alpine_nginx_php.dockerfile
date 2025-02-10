# 使用 Alpine 最新版
FROM alpine:3.21

# 复制当前目录下的文件到容器的 /var/www 目录下
COPY . /var/www

# 安装 PHP8 和必要的扩展 [2025-2-9 最新版是 PHP8.4.3，发布日期是2025年1月17日]
RUN apk update \
        && apk add --no-cache \
        php84 \
        php84-fpm \
        php84-opcache \
        php84-mysqli \
        php84-mbstring \
        php84-json \
        php84-zlib \
        php84-session \
        php84-curl \
        php84-fileinfo \
        php84-simplexml \
        php84-xml \
        php84-ctype \
        php84-openssl \
        php84-dom \
        php84-iconv \
        php84-zip \
        php84-xmlwriter\
        nginx \
        curl \
        bash \
        openssh \
    && mkdir -p /run/nginx \
    && touch /run/nginx/nginx.pid \
    && echo "root:Docker!" | chpasswd

# 暴露端口
EXPOSE 80 443 22 8081 2222
# 把初始化容器的脚本设置为可执行
RUN chmod +x /var/www/init_container.sh

# 调用守护进程
ENTRYPOINT ["/var/www/init_container.sh"]

# 构建并推送到 Azure Container Registry
# docker build -f alpine_nginx_php.dockerfile -t contoso.azurecr.cn/php:1 .
# 本地运行
# docker run -d -p 8880:80 --name php contoso.azurecr.cn/php:1
# 推送到 Azure Container Registry
# az cloud set -n AzureChinaCloud
# az login
# az acr login --name snowpeak
# docker push contoso.azurecr.cn/php:1