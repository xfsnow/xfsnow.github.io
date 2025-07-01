# 在Azure Pipeline中显示代码覆盖率

发布时间: *2023-01-23 10:00:00*

分类: __Azure__

简介: Azure Pipeline是微软云上全线DevOps工具集中负责自动化流水线的托管服务，具备完备的流水线管理功能，还方便和各种测试、构建和部署工具集成。代码覆盖率是自动化测试中的一个重要指标，统计测试过程中被执行的源代码占全部源代码的比例，进而间接度量软件质量。如果项目代码配置了导出代码覆盖率，Azure Pipeline可以采集相应的数据并存储下来。不过默认情况下，这些数据只提供下载，再使用其它工具查看。本文简单介绍如何在Azure Pipeline的控制台上可视化地显示代码覆盖率。

------------------------------------

Azure Pipeline是微软云上全线DevOps工具集中负责自动化流水线的托管服务，具备完备的流水线管理功能，还方便和各种测试、构建和部署工具集成。代码覆盖率是自动化测试中的一个重要指标，统计测试过程中被执行的源代码占全部源代码的比例，进而间接度量软件质量。如果项目代码配置了导出代码覆盖率，Azure Pipeline可以采集相应的数据并存储下来。不过默认情况下，这些数据只提供下载，再使用其它工具查看。本文简单介绍如何在Azure Pipeline的控制台上可视化地显示代码覆盖率。

## 准备项目源码

我们以dotnet new xunit来初始化一个标准的.NET测试用例项目。在VS Code中显示如下：

![Text Description automatically
generated](../assets/img/20230123_Azure_DevOps_Coverage_01.png)

要实现代码覆盖率，核心的配置在NetCodeCoverage.csproj这个文件中的下面这段

```xml
<PackageReference Include="coverlet.collector" Version="3.1.2">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
</PackageReference>
```

如果没有，可以自己手动添加上去。

然后执行 dotnet build和dotnet test命令，可以看到以下输出。

![A screenshot of a computer Description automatically
generated](../assets/img/20230123_Azure_DevOps_Coverage_02.png)

默认创建的测试使用里面没有任何代码逻辑，当然是测试通过啦。如果有问题，还可以从我的GitHub直接fork源码。

<https://github.com/xfsnow/NetCodeCoverage>

## 创建Azure Pipeline

在 Azure DevOps控制台找到Pipeline下的Pipeline，右上角New pipeline创建一个新的yaml格式的pipeline。

Where is your code 先GitHub。连接到前面刚刚提交的GitHub源码库。

Configure页选Starter template。最后来到Review页，我们看到以下一个起始的流水线样子。

![Graphical user interface, text, application, email Description
automatically generated](../assets/img/20230123_Azure_DevOps_Coverage_03.png)

把现有的 2 条script 任务删掉。点右上角的Show assistant，在Tasks中点击 .NET Core，如下图所示，先添加一个build任务。

![Graphical user interface, text, application Description automatically
generated](../assets/img/20230123_Azure_DevOps_Coverage_04.png)

然后Command菜单选择test

![Graphical user interface, text, application Description automatically
generated](../assets/img/20230123_Azure_DevOps_Coverage_05.png)

注意保持Publish test results and code coverage选中不动，再添加一个测试任务。

最后添加一个发布代码覆盖率任务。

最后点击右上角Save and run按钮，按提示commit到源码库并执行。

- [ ] 待完成