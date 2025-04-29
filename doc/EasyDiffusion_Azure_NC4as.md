# 在 Azure 虚拟机上安装 EasyDiffusion
在 Linux 系统安装 Stable Diffusion 涉及组件众多，配置复杂，本文档将介绍如何在 Azure 上使用 EasyDiffusion 一键安装 Stable Diffusion。实践看来，EasyDiffusion 的安装和使用都非常简单，适合大部分用户使用。主要需要解决的挑战是在 Ubuntu 系统下安装 Nvidia 的驱动程序，以及下载某些不能在中国大陆访问的组件和模型文件。

## 创建虚拟机
以 Azure 中国区的 NC4as 虚拟机为例，创建虚拟机要注意 Security type 只能选 Standard，不能选 Trusted launch virtual machines 。因为后者会导致 Nvidia 驱动程序无法安装。
操作系统镜像 image 选择 Ubuntu 24.04 LTS - Gen2 ，其他配置可以根据需要进行调整。建议选择中国北3区，那里的计算资源相对充裕。
网络端口选择时，需要选择开放 SSH 22 端口，以便远程登录虚拟机。
虚拟机创建好后，在 Settings -> Networking 中，添加一个入站规则，允许 8080 端口任意协议流量。为我们后续通过公网访问 EasyDiffusion 做好准备。
远程连接上后执行更新命令

```bash
sudo apt update && sudo apt upgrade -y
```

## 安装 Nvidia 驱动程序
注意微软官方文档安装 Nvidia 驱动程序的步骤已经过时，安装的版本是 470，当前最新版本的 EasyDiffusion 运行起来后不能识别 GPU 卡。
根据上述创建的 Ubuntu 24.04 LTS 系统，安装合适版本的 Nvidia 驱动程序和 CUDA 工具包。访问 NVIDIA官网 [ Datacenter Driver 535 Downloads](https://developer.nvidia.com/datacenter-driver-535-download-archive?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=deb_local) 中的说明进行安装。

```bash
# 下载 Nvidia 驱动程序安装包
wget https://developer.download.nvidia.com/compute/nvidia-driver/535.247.01/local_installers/nvidia-driver-local-repo-ubuntu2204-535.247.01_1.0-1_amd64.deb
sudo dpkg -i nvidia-driver-local-repo-ubuntu2204-535.247.01_1.0-1_amd64.deb
sudo cp /var/nvidia-driver-local-repo-ubuntu2204-535.247.01/nvidia-driver-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
# 我使用的驱动程序是 open kernel module 模式的
sudo apt-get install -y nvidia-kernel-open-535
sudo apt-get install -y cuda-drivers-535
```
安装完成后按照提示重启虚拟机。

```bash
sudo reboot
```
然后就可以使用 nvidia-smi 命令查看 GPU 卡的状态了。

```bash
nvidia-smi
Mon Apr 28 02:09:40 2025
+---------------------------------------------------------------------------------------+
| NVIDIA-SMI 535.247.01             Driver Version: 535.247.01   CUDA Version: 12.2     |
|-----------------------------------------+----------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |         Memory-Usage | GPU-Util  Compute M. |
|                                         |                      |               MIG M. |
|=========================================+======================+======================|
|   0  Tesla T4                       On  | 00000001:00:00.0 Off |                  Off |
| N/A   32C    P8               9W /  70W |      2MiB / 16384MiB |      0%      Default |
|                                         |                      |                  N/A |
+-----------------------------------------+----------------------+----------------------+

+---------------------------------------------------------------------------------------+
| Processes:                                                                            |
|  GPU   GI   CI        PID   Type   Process name                            GPU Memory |
|        ID   ID                                                             Usage      |
|=======================================================================================|
|  No running processes found                                                           |
+---------------------------------------------------------------------------------------+
```
可以看到版本分别是 Driver Version: 535.247.01 和 CUDA Version: 12.2。

## 安装 EasyDiffusion
Ubuntu 24.04 LTS 系统下安装 EasyDiffusion 的操作完全按照 [EasyDiffusion 的官方文档](https://github.com/easydiffusion/easydiffusion?tab=readme-ov-file#on-linuxmac) 进行。真的就是一键安装。

到 [EasyDiffusion 的 GitHub 页面](https://github.com/easydiffusion/easydiffusion/releases) 下载最新版本的 EasyDiffusion 安装包。此文发表时最新版本是 3.0.9c 。解压安装包，进入解压后的目录，执行脚本 `./start.sh`，首次运行会安装所有依赖，后续再运行就会直接启动。

我的虚拟机选在中国北3区，安装过程中要访问 github.com 检测版本更新，以及从 huggingface.co 下载模型文件。中国大陆无法访问这两个网站，所以还要变通一下。

### github.com 的访问
`./start.sh` 执行过程中看到的错误信息如下：

```
fatal: unable to access 'https://github.com/easydiffusion/easydiffusion.git/': Failed to connect to github.com port 443
```
表示无法访问 github.com 。简单的解决办法是在 /etc/hosts 文件中添加几行，指定 github.com 的 IP 地址。此文发表时可用的 IP 配置如下：

```bash
140.82.114.3    github.com
151.101.1.6     github.global.ssl.fastly.net
151.101.65.6    github.global.ssl.fastly.net
151.101.129.6   github.global.ssl.fastly.net
151.101.193.6   github.global.ssl.fastly.net
```
具体的IP地址可以在 https://www.ipaddress.com/website/github.com/#dns 和 https://www.ipaddress.com/website/fastly.net/#dns 查询。

### huggingface.co 下载模型文件
`./start.sh` 执行过程中看到的错误信息如下：

```
> download vae vae-ft-mse-840000-ema-pruned
02:49:30.711 ERROR MainThread HTTPSConnectionPool(host='huggingface.co', port=443): Max retries   model_downloader.py:70
exceeded with url:
/stabilityai/sd-vae-ft-mse-original/resolve/main/vae-ft-mse-840000-ema-pruned.ckpt (Caused by NewConnectionError('<urllib3.connection.HTTPSConnection object at 0x711f4901c6a0>: Failed to establish a new connection: [Errno 101] Network is unreachable'))
```
表示无法访问 huggingface.co 。可以自己搜索国内镜像站点，比如 https://git.ustc.edu.cn/eeethon/stable-diffusion-datafiles/-/blob/main/download/vae-ft-mse-840000-ema-pruned.ckpt 下载模型文件。

然后上传到虚拟机上，放在 EasyDiffusion 的 models/vae 目录下。

## 设置反向代理实现公网访问
解决完上述 2 个网络访问的问题后，执行 `./start.sh` 就可以正常启动 EasyDiffusion 了。
但是默认的访问地址是 http://localhost:9000 ，只能在本地访问。我们需要设置反向代理，允许公网访问。
```bash
sudo apt install nginx apache2-utils -y

# 获取当前VM的公网IP
public_ip=$(curl -s ifconfig.me)

# 生成随机密码
ngpassword=$(uuidgen)
sudo htpasswd -b -c /etc/nginx/.htpasswd your_username $ngpassword
# 把访问地址和密码写入日志文件

echo "访问地址: http://$public_ip:8080 您的用户名是: your_username 您的密码是: $ngpassword" > easy-diffusion-access.log

sudo touch /etc/nginx/conf.d/sd.conf
sudo vi /etc/nginx/conf.d/sd.conf
# 输入下面内容保存
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
upstream sd {
    server 127.0.0.1:9000;
}
server {
    listen 8080;
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "$connection_upgrade";
        proxy_pass http://sd;
        auth_basic "Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
# 重启 nginx 服务
sudo nginx -s reload
```
查看 easy-diffusion-access.log 文件中的信息，访问地址是 http://<your_public_ip>:8080 ，用户名是 your_username，密码是随机生成的。
然后就可以通过 http://<your_public_ip>:8080 访问 EasyDiffusion 了。
在浏览器中输入访问地址，按提示输入用户名和密码，就可以访问 EasyDiffusion 的 Web 界面了。

## 设置随系统自动启动
nginx 服务是随系统自动启动的，但是 EasyDiffusion 的 Web 服务需要手动启动。可以设置成系统的服务，随系统自动启动 EasyDiffusion 的 Web 服务。

1. 在终端中运行以下命令来创建一个新的服务文件
```bash
sudo vi /etc/systemd/system/easy-diffusion.service
```
在打开的编辑器中，添加以下内容
```ini

[Unit]
Description=Easy Diffusion Service
After=network.target

[Service]
ExecStart=/path/to/easy-diffusion/start.sh
WorkingDirectory=/path/to/easy-diffusion
User=azureuser
Group=azureuser
Restart=always

[Install]
WantedBy=multi-user.target
```
/path/to/easy-diffusion 是 EasyDiffusion 的安装目录，如果默认下载到 Azure VM 的用户目录下，应该是 /home/azureuser/easy-diffusion 。

2. 保存并关闭文件后，运行以下命令来重新加载 systemd 配置
```bash
sudo systemctl daemon-reload
```
3. 运行以下命令来启用服务，使其在系统启动时自动启动
```bash
sudo systemctl enable easy-diffusion.service
```
4. 运行以下命令来启动服务
```bash
sudo systemctl start easy-diffusion.service
```

5. 用以下命令来检查服务的状态，确保它已成功启动并运行，还可以查看到运行输出的日志
```bash
sudo systemctl status easy-diffusion.service
```

重启系统后，EasyDiffusion 以及反向代理的服务就能自动启动了。