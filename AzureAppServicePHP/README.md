# 使用自定义容器在 Azure App Servie 部署 PHP 8.4

## dockerfile 解释

## init_container.sh 解释
App Service 中自定义的环境变量，主要是数据库连接等机密信息需要添加到 /tmp/www.conf 文件中，php-fpm 才能用到。
自己安装 SSH 服务端，以便在 App Service 中使用 SSH 连接到容器中，方便调试。


## 本地构建和测试

## 推送到 Azure Container Registry

## 部署到 Azure App Service