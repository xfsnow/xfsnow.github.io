# Disable Access Time Recording to Improve Linux Hard Disk Performance

Published: *2011-01-25 10:42:00*

Category: __System__

Summary: Disable access time recording to improve Linux hard disk performance.

---------


Linux file system updates the last access time when reading files, which means each read operation also involves a write operation. Recording access time is usually unnecessary, and disabling access time recording with the following configuration can greatly improve hard disk access speed.

Edit the /etc/fstab configuration file, add ",noatime" after "defaults" in the ext format partition configuration. Note that there should be no space before the comma, and then reboot the system.

Although my current Fedora 13 is already using ext4 file system, adding noatime is still effective.

The following is my modified configuration file for reference:

```conf
#
# /etc/fstab
# Created by anaconda on Mon Jan 10 04:09:34 2011
#
# Accessible filesystems, by reference, are maintained under '/dev/disk'
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
#
/dev/mapper/vg_xuefeng-lv_root / ext4 defaults,noatime 1 1
UUID=6d0037b4-ecd4-47ae-beea-459f70594f09 /boot ext4 defaults,noatime 1 2
/dev/mapper/vg_xuefeng-lv_home /home ext4 defaults,noatime 1 2
/dev/mapper/vg_xuefeng-lv_swap swap swap defaults 0 0
tmpfs /dev/shm tmpfs defaults 0 0
devpts /dev/pts devpts gid=5,mode=620 0 0
sysfs /sys sysfs defaults 0 0
proc /proc proc defaults 0 0
```


---
*Original link: https://www.snowpeak.fun/cn/article/detail/disable_access_time_to_boost_hard_disk_performance/*