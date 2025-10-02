# 硬盘安装 Fedora 14

发布时间: *2011-03-23 15:22:00*

分类: __系统管理__

简介: 介绍如何通过硬盘安装 Fedora 14 操作系统

---------

## 概述

硬盘安装确实比光盘安装快。只是整个安装过程都得是英文，即使是后来进入图形界面。

## 准备工作

我现在的机器是 C 区装 Windows 2003，单独分出 E 区放安装 Fedora 的文件。为了安装过程中选择镜像路径时方便，我把安装相关文件都放在 E 区顶层，除了 ISO 文件，还要把 ISO 文件里面的 images 目录也解压出来，ISO 文件和解压出来的目录等都不要改文件名。最后的目录结构是：

```
E:/Fedora-14-i386-DVD.iso
E:/images
```

再把 ISO 里面的 isolinux 目录下的 vmlinuz 和 initrd.img 解压到 C 区根目录。然后配置 GRUB 引导进 Fedora 安装程序。GRUB 的下载和用法这里不赘述。

## 配置引导

### 修改 boot.ini 文件

将 c:/boot.ini 备份一下，然后把内容改成如下：

```ini
[boot loader]
timeout=10
default=c:/grldr

[operating systems]
c:/grldr="Grub"
multi(0)disk(0)rdisk(0)partition(1)/WINDOWS="Windows Server 2003, Enterprise" /fastdetect /Noexecute=AlwaysOff
```

### 创建 GRUB 配置文件

在 C 区根目录建一个 MENU.LST 文件，这是 GRUB 用的配置文件，内容如下：

```conf
# 等待 5 秒
timeout=5

# 默认选项，选项键是从 0 开始排的
default=0

title Install Fedora 14
root (hd0,0)
kernel /vmlinuz
initrd /initrd.img

title Other
rootnoverify (hd0,0)
chainloader +1
```

## 开始安装

重启机器，启动菜单会多出"Grub"一项，选了 Grub 后会看到"Install Fedora 14"，选它就可进入 Fedora 的安装。

### 语言选择

Choose a Language 上来先选语言，只能选英语，选其它的都会说文本方式下只支持英语。

### 键盘设置

KeyBoard Type 然后是选键盘，默认即可。

### 安装媒介

Installation Method 安装媒介选"Local Drive"，然后提示让找硬盘上的镜像文件。我把光盘镜像放在 E 区根目录了，因为我只有一个硬盘，它的 4 个主分区排号是1到4，逻辑分区从 5 开始，所以我的 E 区对应 sda6，这里应该选 sda6，并且在路径里写上 "/" 表示根。如果不对，可以按 F2 找，但我这里一按 F2 就停滞了，不如重启再试。

然后就进入图形界面的安装了。

### 时区设置

Time Zoom 选择时区，选 Aisa/Shanghai(没有 Beijing)。并将左下角 SystemClock Use UTC 的钩去掉，这一步很关键，不然会导致进入 linux 后时间跟正式时间不同。

### 硬盘分区

然后是硬盘分区，如果对分区很熟悉的，可以选 Create Custom Layout，像我对分区不很熟悉，并且我的硬盘上已经空出了未分区的空间，所以我选 Use Free Space，先看一下安装程序推荐的分区方式：

```
lvm groups
vg_user 94752
lv_root 51200 /
lv_home 39520 /home
lv_swap 4032

sda3 /boot
sda4 vg_user LVM groups
```

自己再稍做调整，比如改一下分区大小，或单独挂载新分区，比完全自己分区要简便得多。

### 引导设置

install boot loader 引导安装在哪里，一般选默认的 Master Boot Record。

---
*原文链接: https://www.snowpeak.fun/cn/article/detail/install_fedora_14_from_hard_disk/*