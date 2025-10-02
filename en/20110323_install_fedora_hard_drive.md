# Installing Fedora 14 from Hard Drive

Published: *2011-03-23 15:22:00*

Category: __System__

Summary: Introduction to installing Fedora 14 operating system from hard drive

---------

## Overview

Installing from hard drive is indeed faster than installing from CD. However, the entire installation process must be in English, even when entering the graphical interface later.

## Preparation

My current machine has Windows 2003 installed on drive C, and I've allocated drive E separately for Fedora installation files. To make it easier to select the image path during installation, I put all installation-related files at the top level of drive E. In addition to the ISO file, I also extracted the images directory from within the ISO file. Do not rename the ISO file or extracted directories. The final directory structure is:

```
E:/Fedora-14-i386-DVD.iso
E:/images
```

Next, extract vmlinuz and initrd.img from the isolinux directory within the ISO to the root of drive C. Then configure GRUB to boot into the Fedora installer. The download and usage of GRUB will not be elaborated here.

## Boot Configuration

### Modify boot.ini File

Backup c:/boot.ini, then change its content to the following:

```ini
[boot loader]
timeout=10
default=c:/grldr

[operating systems]
c:/grldr="Grub"
multi(0)disk(0)rdisk(0)partition(1)/WINDOWS="Windows Server 2003, Enterprise" /fastdetect /Noexecute=AlwaysOff
```

### Create GRUB Configuration File

Create a MENU.LST file in the root of drive C. This is the configuration file used by GRUB, with the following content:

```conf
# Wait 5 seconds
timeout=5

# Default option, numbered from 0
default=0

title Install Fedora 14
root (hd0,0)
kernel /vmlinuz
initrd /initrd.img

title Other
rootnoverify (hd0,0)
chainloader +1
```

## Start Installation

Reboot the machine. The boot menu will have an additional "Grub" option. After selecting Grub, you'll see "Install Fedora 14". Select it to enter the Fedora installation.

### Language Selection

Choose a Language - First select the language. Only English can be selected, as other languages will show a message that only English is supported in text mode.

### Keyboard Setup

KeyBoard Type - Then select the keyboard, default is fine.

### Installation Media

Installation Method - Select "Local Drive" as the installation media, then you'll be prompted to find the image file on the hard drive. I placed the disc image in the root of drive E. Since I have only one hard drive with 4 primary partitions numbered 1 to 4, and logical partitions starting from 5, my drive E corresponds to sda6. Here you should select sda6, and enter "/" in the path to represent root. If incorrect, you can press F2 to search, but in my case pressing F2 caused a hang, so it's better to restart and try again.

Then you'll enter the graphical installation interface.

### Time Zone Setting

Time Zoom - Select the time zone, choose Asia/Shanghai (no Beijing). Also uncheck SystemClock Use UTC in the lower left corner. This step is critical, otherwise the time in Linux will be different from the actual time.

### Hard Drive Partitioning

Next is hard drive partitioning. If you're familiar with partitioning, you can select Create Custom Layout. Since I'm not very familiar with partitioning, and there's already unpartitioned space on my hard drive, I selected Use Free Space. First, let's look at the partitioning scheme recommended by the installer:

```
lvm groups
vg_user 94752
lv_root 51200 /
lv_home 39520 /home
lv_swap 4032

sda3 /boot
sda4 vg_user LVM groups
```

Make some adjustments yourself, such as changing partition sizes or mounting new partitions separately. This is much simpler than partitioning completely by yourself.

### Boot Loader Setup

Install boot loader - Where to install the boot loader. Generally, select the default Master Boot Record.

---
*Original link: https://www.snowpeak.fun/cn/article/detail/install_fedora_14_from_hard_disk/*