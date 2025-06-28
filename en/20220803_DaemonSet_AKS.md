# Customizing AKS Worker Nodes Using DaemonSet

Published: *2022-08-03 15:16:52*

Category: __Azure__

Summary: Often we need to run supporting software on AKS (Azure Kubernetes Service) worker nodes, such as malware scanners, Policy Enforcers, etc. Currently, AKS worker nodes can only use operating system images specified by the cloud platform and cannot directly use custom images to customize worker nodes. Regular pod operations are isolated within containers and cannot affect their host machines. This article, inspired by the Kured project, guides you through the process of bootstrapping an AKS cluster using DaemonSets to make this possible.

Original article: [https://snowpeak.blog.csdn.net/article/details/126140523](https://snowpeak.blog.csdn.net/article/details/126140523)

---------

Often we need to run supporting software on AKS (Azure Kubernetes Service) worker nodes, such as malware scanners, Policy Enforcers, etc. Currently, AKS worker nodes can only use operating system images specified by the cloud platform and cannot directly use custom images to customize worker nodes. Regular pod operations are isolated within containers and cannot affect their host machines. This article, inspired by the Kured project, guides you through the process of bootstrapping an AKS cluster using DaemonSets to make this possible.

Before reading this article, you need to master [basic Kubernetes knowledge and operations](<https://kubernetes.io/docs/> "basic Kubernetes knowledge and operations"), [DaemonSet](<https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/> "DaemonSet"), as well as AKS [basic concepts](<https://docs.microsoft.com/en-us/azure/aks/> "basic concepts") and [deployment](<https://docs.microsoft.com/en-us/azure/aks/tutorial-kubernetes-deploy-cluster> "deployment").

## Principle

DaemonSets in Kubernetes allow you to run pods on every node; this is a great choice if you want to bootstrap new nodes and install software. You can configure privileges to run with DaemonSets and adjust the access level required by the DaemonSet according to the tasks you need to perform.

If you need to run commands on the host running the container, you can use the nsenter command. As a prerequisite for being able to do this, you need to ensure that the DaemonSet container has elevated privileges. This can be achieved by setting hostPID = true and privileged = true in the Daemonset YAML for high privileges, as shown below.

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

This way you can get permission to execute commands on the host machine, and then use configMap to set the commands to execute. For example, here are 2 configuration files. One configmap_cowsay.yaml is used to install cowsay, a small program purely for text output.

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

Another configmap_nginx.yaml is used to install nginx. The programs installed by these 2 configuration files are only for demonstration. We can extend them to other commands needed to initialize AKS worker nodes according to actual work needs and the actual operating system of the host machine.

## Basic Deployment

### Application

The demo source code is here: [https://github.com/xfsnow/container/tree/master/AKSNodeInstaller](https://github.com/xfsnow/container/tree/master/AKSNodeInstaller)

### Azure Resources

Create an ACR for storing container images. Note that currently only the East 2 region can support the az acr build command to build and push locally to ACR. So we create the ACR resource in East 2, while the AKS cluster can be in any domestic region.

#### Define Environment Variables

```
REGION_NAME=ChinaEast2
RESOURCE_GROUP=aksNodeInstaller
AKS_CLUSTER_NAME=NodeInstaller
ACR_NAME=NodeInstaller$RANDOM
```

#### Create Resource Group

```
az group create --location $REGION_NAME --name $RESOURCE_GROUP
```

#### Create ACR

```
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --location $REGION_NAME --sku Standard
```

List the results

```
az acr list -o table
NAME              RESOURCE GROUP     LOCATION     SKU      LOGIN SERVER                   CREATION DATE         ADMIN ENABLED
--------          ----------------   -----------  -----    -------------------           --------------------  ---------------
NodeInstaller1044 aksNodeInstaller   chinaeast2   Standard nodeinstaller.azurecr.cn    2021-03-28T14:37:32Z  False
```

#### Create AKS Cluster

```
az aks create \
    --resource-group $RESOURCE_GROUP \
    --name $AKS_CLUSTER_NAME \
    --location $REGION_NAME \
    --node-count 1 \
    --attach-acr $ACR_NAME
```

Parameter explanation:

--resource-group specifies the resource group.

--name AKS cluster name.

--location AKS cluster region.

--node-count Number of worker nodes in the AKS cluster. For a demo cluster, we specify only 1. In actual production environments, you can specify multiple nodes. Using DaemonSet can update multiple worker nodes simultaneously.

--attach-acr The bound container image registry ACR resource, so that this AKS cluster can directly pull images from this ACR later.

This step is slow, please wait patiently until there are return results.

View the created AKS cluster

```
az aks show --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME -o table
Name           Location     ResourceGroup     KubernetesVersion    ProvisioningState    Fqdn
-------------  -----------  ----------------  -------------------  -------------------  ------
NodeInstaller  chinaeast2   aksNodeInstaller  1.18.14              Succeeded            xxxx.azk8s.cn
```

Also view the virtual machine scale set behind the AKS cluster and the virtual machines inside it.

```
CLUSTER_RESOURCE_GROUP=$(az aks show --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME --query nodeResourceGroup -o tsv)
SCALE_SET_NAME=$(az vmss list --resource-group $CLUSTER_RESOURCE_GROUP --query '[0].name' -o tsv)
```

Finally list the instances in the virtual machine scale set

```
az vmss list-instances -g $CLUSTER_RESOURCE_GROUP -n $SCALE_SET_NAME -o table \
--query "[].{instanceId:instanceId, Name:name, State:provisioningState}"
InstanceId    Name                           State
------------  -----------------------------  ---------
0             aks-nodepool1-29740120-vmss_0  Succeeded
```

At this point, Azure resources have been created, totaling 1 AKS cluster, including 1 virtual machine scale set with 1 virtual machine.

### Deploy Kubernetes

#### Build Image and Push to Image Registry

`git clone https://github.com/xfsnow/AKSNodeInstaller`

Pull the source code.

First build and push the image

```
cd app
IMAGE_NAME=node-installer
az acr build --file Dockerfile_centos \
    --resource-group $RESOURCE_GROUP \
    --registry $ACR_NAME \
    --image $IMAGE_NAME:1.0 .
```

Then get the specific URL of the image registry

```
az acr repository show -n $ACR_NAME --repository $IMAGE_NAME --query "registry"
"nodeinstaller11044.azurecr.cn"
```

Note down this URL like nodeinstaller11044.azurecr.cn. Adding node-installer:1.0 after it gives the complete image pull address, like "acr11044.azurecr.cn/node-installer:1.0".

Find this line in daemonset_centos.yaml

```
# Container image uses ACR service on Azure.
- image: snowpeak.azurecr.cn/node-installer:centos
```

Replace it with your own ACR image URL "acr11044.azurecr.cn/node-installer:1.0".

#### Connect to AKS Cluster and Deploy Image

Connect to AKS cluster

```
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_CLUSTER_NAME
```

First view the nodes in the AKS cluster

```
kubectl get nodes -o wide --namespace node-installer
NAME                                STATUS   ROLES   AGE    VERSION    INTERNAL-IP   EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION     CONTAINER-RUNTIME
aks-nodepool1-40474697-vmss000000   Ready    agent   142m   v1.18.14   10.240.0.4    <none>        Ubuntu 18.04.5 LTS   5.4.0-1035-azure   docker://19.3.14
```

Then view the pods.

```
kubectl get pods -o wide
No resources found in default namespace.
```

At this time, no images have been deployed yet, so there are no resources.

Then use cd ./k8s/ to go to the Kubernetes configuration file directory.

Deploy to the AKS cluster with kubectl apply -f daemonset_centos.yaml and kubectl apply -f configmap_cowsay.yaml. The deployed cluster looks like this.

```
kubectl get pods -o wide --namespace node-installer
NAME              READY   STATUS    RESTARTS   AGE   IP           NODE                                NOMINATED NODE   READINESS GATES
installer-c68jv   1/1     Running   0          32s   10.244.0.8   aks-nodepool1-40474697-vmss000000   <none>           <none>
```

View the pod logs

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

You can see that the logs finally show that cowsay has been successfully installed.

## Login and Verification

Below we will remotely connect to the AKS worker node via SSH and finally verify that cowsay has been successfully installed. Use kubectl debug to run a privileged container on the node. In the previous steps, we saw that the current worker node name is aks-nodepool1-40474697-vmss000000.

1. Use kubectl debug to run a container image on the node to connect to that container.

```
kubectl debug node/aks-nodepool1-40474697-vmss000000 \
 -it --image=mcr.microsoft.com/dotnet/runtime-deps:6.0
Creating debugging pod node-debugger-aks-nodepool1-40474697-vmss000000-5bw76 with container debugger on node aks-nodepool1-40474697-vmss000000.
If you don't see a command prompt, try pressing enter.
root@aks-nodepool1-40474697-vmss000000:/#
```

2. In this privileged container, run the chroot /host command to get an isolated root path and safely interact with the worker node session. Note that after switching the root path, commands need to use absolute paths and cannot use command shortcuts. You can use exec bash to switch from dash to bash to restore normal commands. For example:

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

This proves that cowsay was indeed successfully installed on the VM worker node.

Of course, this cowsay is just a small demo program with no practical use. You can create other configmap.yaml files according to your needs. For example, the source code also includes a configmap_nginx.yaml that can be used to install nginx. You just need to delete the existing DaemonSet and re-execute the relevant configuration files.

## Resource Cleanup

```
az group delete --name $RESOURCE_GROUP --yes
```

Delete the resource group and all its resources. The experiment is complete.