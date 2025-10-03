# Linux Remote Desktop with TigerVNC

Published: *2011-11-28 17:40:00*

Category: __System__

Summary: This article describes how to configure remote desktop services using TigerVNC on Linux systems, including server-side configuration, client connections, and secure connection methods via SSH tunneling.

---------

## TigerVNC Configuration Steps

### 1. Confirm SSH is Running

Ensure that the SSH service is started and running properly.

### 2. Install TigerVNC Server

```bash
yum install tigervnc-server
```

For cases where it has already been installed, you can use the following command to check the installation status:

```bash
yum info tigervnc-server
```

### 3. Configure Display Resolution, Screen and User

Edit [/etc/sysconfig/vncservers](file:///etc/sysconfig/vncservers):

```bash
VNCSERVERS="2:myname"
VNCSERVERARGS[2]="-geometry 1024x768 -nolisten tcp"
```

At this step, remove the `-localhost` option first.

### 4. Configure VNC Desktop Environment and Password

Log in to Linux with the username configured above, then start vncserver. At this point, vncserver loads the local path and environment information of the corresponding user, storing the user's VNC authentication, logs, etc. in the corresponding path.

Execute in command line:

```bash
$ vncserver
```

When executed for the first time, it will prompt to set a password. Follow the prompts to enter it.

```
You will require a password to access your desktops.

Password:
Verify:

xauth: creating new authority file /home/xf/.Xauthority

New 'xf:1 (xf)' desktop is xf:1

Creating default startup script /home/xf/.vnc/xstartup
Starting applications specified in /home/xf/.vnc/xstartup
Log file is /home/xf/.vnc/xf:1.log
```

As shown above, a .vnc directory and several files are generated in the current user directory.

### 5. Start VNC Server Service

Log in as administrator, first stop the service:

```bash
# service vncserver stop
```

If you see error messages, it's okay, it just means the service hasn't been started yet.

Start the service:

```bash
# service vncserver start
```

I didn't use steps 6 (SELinux) and 7 (firewall) from the original text because I had already disabled them directly.

### 6. Configure Router Port Forwarding

I don't have a router here, so I skipped this step.

### 7. Install VNC Client

Windows systems can use VNC Viewer, Fedora Linux has the built-in Remote Desktop Viewer, and you can also choose to install other excellent client software, such as TightVNC client.

### 8. Connect to VNC Server

At this point, you should be able to connect from another machine. Enter the remote machine's name or IP address in the connection address. The default port is 5902, for example:

```
10.0.10.208:5092
```

Enter the password set by the user when running vncserver as prompted. If successful, you should be able to see the remote desktop. Note that VNC starts a completely different second desktop, which is different from the desktop seen when the user logs in directly to the Linux machine. Desktop preferences can be configured separately.

### 9. Connect via SSH Tunnel

First create a connection to the target Linux server in SecureCRT, then go to Options menu -> Session Options -> Connection -> Port Forwarding. Click "Add" under "Local Port Forwarding", write a descriptive name such as "VNC" in the name field, then enter the port used by the remote VNC server in both the local port and remote port fields, which is 5902 in this case. Exit and reconnect.

### 10. Server Security Settings

Log in as administrator and edit [/etc/sysconfig/vncservers](file:///etc/sysconfig/vncservers):

Change:

```
VNCSERVERARGS[2]="-geometry 1024x768 -nolisten tcp"
```

to:

```
VNCSERVERARGS[2]="-geometry 1024x768 -nolisten tcp -localhost"
```

Then execute:

```bash
# service vncserver restart
```

You must keep the SecureCRT connection active, then open the VNC client. At this point, the server address to connect to should be changed from the previous `ip_address:5902` to `localhost:5902`, and you should be able to connect.