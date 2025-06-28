# 使用DaemonSet定制AKS工作节点

发布时间: *2022-08-03 15:16:52*

分类: __Azure__

简介: 很多时候我们需要在AKS (Azure Kubernetes Service)工作节点上运行支持软件，例如，恶意软件扫描程序，Policy Enforcer等。目前AKS的工作节点只能使用云平台指定的操作系统镜像，不能直接用自定义的镜像来定制工作节点。常规操作pod被隔离在容器以内，不能影响其所在的宿主机。这篇文章受到Kured 项目的启发，引导您完成使用守护程序集引导AKS集群的过程，以使其成为可能。

原文链接: [https://snowpeak.blog.csdn.net/article/details/126140523](https://snowpeak.blog.csdn.net/article/details/126140523)

---------

很多时候我们需要在AKS (Azure Kubernetes Service)工作节点上运行支持软件，例如，恶意软件扫描程序，Policy Enforcer等。目前AKS的工作节点只能使用云平台指定的操作系统镜像，不能直接用自定义的镜像来定制工作节点。常规操作pod被隔离在容器以内，不能影响其所在的宿主机。这篇文章受到Kured 项目的启发，引导您完成使用守护程序集引导AKS集群的过程，以使其成为可能。

阅读本文之前需要掌握[Kubernetes的基本知识和操作](<https://kubernetes.io/zh/> "Kubernetes的基本知识和操作")，[DaemonSet](<https://kubernetes.io/zh/docs/concepts/workloads/controllers/daemonset/> "DaemonSet")，以及AKS的[基本概念](<https://docs.azure.cn/zh-cn/aks/> "基本概念")和[部署](<https://github.com/Azure/container-service-for-azure-china/blob/master/aks/README.md> "部署")。

## 原理

Kubernetes中的DaemonSets允许您在每个节点上运行pod; 如果要引导新节点并安装软件，这是一个很好的选择。 您可以配置与DaemonSet一起运行的特权，并根据需要执行的任务来调整DaemonSet所需的访问级别。

如果需要在运行容器的主机上运行命令，则可以使用nsenter命令。 作为能够执行此操作的先决条件，您需要确保DaemonSet容器具有提升的特权。可以通过在Daemonset YAML中将hostPID = true和privileged = true设置为高权限，如下所示。


```
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: installer
  namespace: node-installer
spec:
  selector:
matchLabels:
  job: installer
  template:
metadata:
  labels:
job: installer
spec:
  hostPID: true
  restartPolicy: Always
  containers:
  - image: snowpeak.azurecr.cn/node-installer:centos
name: installer
securityContext:
  privileged: true
volumeMounts:
- name: install-script
  mountPath: /tmp
- name: host-mount
  mountPath: /host
  volumes:
  - name: install-script
configMap:
  name: sample-installer-config
  - name: host-mount
hostPath:
  path: /tmp/install
```

这样就可以获得在宿主机执行命令的权限，再通过configMap来设置要执行的命令。比如这里有2个配置文件。一个configmap_cowsay.yaml用于执行安装 cowsay 这个纯用作输出文本的小程序。


```
apiVersion: v1
kind: ConfigMap
metadata:
  name: sample-installer-config
  namespace: node-installer
data:
  install.sh: |
#!/bin/bash

# Update and install packages
apt-get update
apt-get install cowsay -y
```

另一个configmap_nginx.yaml用于执行安装 nginx，这2个配置文件安装的程序都只用作演示。咱们可以根据实际工作需要，以及实际宿主机的操作系统，扩展成其它需要初始化AKS工作节点的命令。

## 基本部署

### 应用

演示用的源码在这里: [https://github.com/xfsnow/container/tree/master/AKSNodeInstaller](https://github.com/xfsnow/container/tree/master/AKSNodeInstaller)

### Azure资源

创建一个ACR，用于保存容器镜像，注意目前只有东2区域可以支持az acr build 命令在本地直接构建并推送到ACR。所以我们创建的ACR资源在东2区，而AKS集群可以在任何一个国内的区域。

#### 定义环境变量


```
REGION_NAME=ChinaEast2
RESOURCE_GROUP=aksNodeInstaller
AKS_CLUSTER_NAME=NodeInstaller
ACR_NAME=NodeInstaller$RANDOM
```

#### 创建资源组


```
az group create --location $REGION_NAME --name $RESOURCE_GROUP
```

#### 创建ACR


```
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --location $REGION_NAME --sku Standard
```

列表看一下结果


```
az acr list -o table
NAME      RESOURCE GROUP    LOCATION     SKU    LOGIN SERVER         CREATION DATE         ADMIN ENABLED
--------  ----------------  -----------  -----  -------------------  --------------------  ---------------
NodeInstaller1044  aksNodeInstaller  chinaeast2  Standard  nodeinstaller.azurecr.cn  2021-03-28T14:37:32Z  False
```

#### 创建 AKS 集群


```
az aks create \
    --resource-group $RESOURCE_GROUP \
    --name $AKS_CLUSTER_NAME \
    --location $REGION_NAME \
    --node-count 1 \
    --attach-acr $ACR_NAME
```

参数解释一下：

\--resource-group 指定资源组。

\--name AKS集群的名称。

\--location AKS集群所在的区域。

\--node-count AKS集群中工作节点台数，作为演示用的集群，我们这个集群只指定1台。实际生产环境中可以指定多台，使用DaemonSet可以同时更新多台工作节点。

\--attach-acr 绑定的容器镜像注册表ACR的资源，以便后续可以由这个 AKS集群直接从这个ACR拉取镜像。

这步比较慢，请耐心等待，直到有返回结果。

看一下创建好的 AKS集群


```
az aks show --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME -o table
Name           Location     ResourceGroup     KubernetesVersion    ProvisioningState    Fqdn
-------------  -----------  ----------------  -------------------  -------------------  ------
NodeInstaller  chinaeast2  aksNodeInstaller  1.18.14              Succeeded       xxxx.azk8s.cn
```

再看一下AKS集群背后的虚机扩展组，及里面的虚机。


```
CLUSTER_RESOURCE_GROUP=$(az aks show --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME --query nodeResourceGroup -o tsv)
SCALE_SET_NAME=$(az vmss list --resource-group $CLUSTER_RESOURCE_GROUP --query '[0].name' -o tsv)
```

最后列一下虚拟机扩展集中的实例


```
az vmss list-instances -g $CLUSTER_RESOURCE_GROUP -n $SCALE_SET_NAME -o table \
--query "[].{instanceId:instanceId, Name:name, State:provisioningState}"
InstanceId    Name                           State
------------  -----------------------------  ---------
0	aks-nodepool1-29740120-vmss_0  Succeeded

```

到此，Azure资源已创建完毕，总共1个AKS集群，包含1个虚拟机扩展集，其中有1台虚拟机。

### 部署Kubernetes

#### 构建镜像推送到镜像注册表。

`git clone https://github.com/xfsnow/AKSNodeInstaller`

拉取源码。

先构建并推送镜像


```
cd app
IMAGE_NAME=node-installer
az acr build --file Dockerfile_centos \
    --resource-group $RESOURCE_GROUP \
    --registry $ACR_NAME \
    --image $IMAGE_NAME:1.0 .
```

然后获取镜像注册表具体的URL


```
az acr repository show -n $ACR_NAME --repository $IMAGE_NAME --query "registry"
"nodeinstaller11044.azurecr.cn"
```

记下这个形如nodeinstaller11044.azurecr.cn的URL，后面接上node-installer:1.0就是完整的镜像拉取地址，形如 “acr11044.azurecr.cn/node-installer:1.0”。

找到 daemonset_centos.yaml 中的这行


```
# 容器镜像使用 Azure 上的 ACR 服务。
- image: snowpeak.azurecr.cn/node-installer:centos
```

替换成你自己的 ACR 镜像的URL “acr11044.azurecr.cn/node-installer:1.0”。

#### 连接AKS集群并部署镜像

连接AKS集群


```
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME
```

先查看一下AKS集群中的节点


```
kubectl get nodes -o wide –-namespace node-installer
NAME                                STATUS   ROLES   AGE    VERSION    INTERNAL-IP   EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION     CONTAINER-RUN
TIME
aks-nodepool1-40474697-vmss000000   Ready    agent   142m   v1.18.14   10.240.0.4    <none>        Ubuntu 18.04.5 LTS   5.4.0-1035-azure   docker://19.3.14
```

再看一下pod。


```
kubectl get pods -o wide
No resources found in default namespace.
```

此时尚未部署镜像，所以没有资源。

然后用 cd ./k8s/ 来到Kubernetes 配置文件目录下。

kubectl apply -f daemonset_centos.yaml 和kubectl apply -f configmap_cowsay.yaml 部署到 AKS 集群中。部署好的集群是这样的。


```
kubectl get pods -o wide --namespace node-installer
NAME                          READY   STATUS    RESTARTS   AGE   IP           NODE                                NOMINATED NODE   READINESS GATES
installer-c68jv   1/1     Running   0          32s   10.244.0.8   aks-nodepool1-40474697-vmss000000   <none>           <none>
```

查看一下 pod 日志


```
kubectl logs installer-c68jv --namespace node-installer
……
The following NEW packages will be installed:
  cowsay
0 upgraded, 1 newly installed, 0 to remove and 14 not upgraded.
Need to get 17.7 kB of archives.
After this operation, 89.1 kB of additional disk space will be used.
Get:1 http://azure.archive.ubuntu.com/ubuntu bionic/universe amd64 cowsay all 3.03+dfsg2-4 [17.7 kB]
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline
debconf: unable to initialize frontend: Readline
debconf: (This frontend requires a controlling tty.)
debconf: falling back to frontend: Teletype
dpkg-preconfigure: unable to re-open stdin:
Fetched 17.7 kB in 1s (24.6 kB/s)
Selecting previously unselected package cowsay.
(Reading database ... 121200 files and directories currently installed.)
Preparing to unpack .../cowsay_3.03+dfsg2-4_all.deb ...
Unpacking cowsay (3.03+dfsg2-4) ...
Setting up cowsay (3.03+dfsg2-4) ...
Processing triggers for man-db (2.8.3-2ubuntu0.1) ...
```

可以看到日志最后显示 cowsay 已安装成功。

## 登录并验证

下面我们通过SSH远程连接上AKS的工作节点，最终验证一下 cowsay已经成功安装。使用 kubectl debug 在节点上运行特权容器。在之前的步骤中我们曾查看过当前的工作节点名称是aks-nodepool1-40474697-vmss000000。

1\. 使用 kubectl debug 在节点上运行容器镜像以连接到该容器。


```
kubectl debug node/aks-nodepool1-40474697-vmss000000
 -it --image=mcr.microsoft.com/dotnet/runtime-deps:6.0
Creating debugging pod node-debugger-aks-nodepool1-40474697-vmss000000-5bw76 with container debugger on node aks-nodepool1-40474697-vmss000000.
If you don't see a command prompt, try pressing enter.
root@aks-nodepool1-40474697-vmss000000:/#
```

2\. 在这个特权容器运行 chroot /host 命令获取隔离的根路径，安全地与工作节点会话进行交互。注意切换根路径后，再执行命令需要使用绝对路径，不能使用命令快捷名字了。可以使用exec bash来从dash切换到bash，就恢复正常的命令了。如：


```
root@aks-nodepool1-40474697-vmss000000:/# chroot /host
# exec bash
root@aks-nodepool1-40474697-vmss000000:/# cowsay -l
Cow files in /usr/share/cowsay/cows:
apt bud-frogs bunny calvin cheese cock cower daemon default dragon
dragon-and-cow duck elephant elephant-in-snake eyes flaming-sheep
ghostbusters gnu hellokitty kiss koala kosh luke-koala mech-and-cow milk
moofasa moose pony pony-smaller ren sheep skeleton snowman stegosaurus
stimpy suse three-eyes turkey turtle tux unipony unipony-smaller vader
vader-koala www
```

证明在VM工作节点上cowsay确实安装成功了。

当然这个cowsay只是一个纯演示用的小程序，没有什么实际用处。大家可以根据自己的需求再编辑或创建其它的configmap.yaml文件，比如源码中还有一个configmap_nginx.yaml可以用来安装 nginx。只需要删除现有的DaemonSet再重新执行相关的配置文件就可以了。

## 资源清理


```
az group delete --name $RESOURCE_GROUP --yes
```

删除该资源组及其所有资源，实验结束。