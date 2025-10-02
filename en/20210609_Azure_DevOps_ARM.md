# Automating Cloud Resource Management with Azure DevOps and ARM

Published: *2021-09-09 10:01:44*

Category: __Azure__

Introduction: While using pipelines in DevOps to deploy applications is the most common scenario for automated deployment, there is also automated deployment of infrastructure resources. Especially after adopting cloud computing platforms, combining infrastructure-as-code approaches can more conveniently integrate cloud resource management into DevOps pipelines, achieving overall automated deployment from resources to applications using DevOps. Today, using Azure cloud as an example, we introduce a basic automated cloud resource management solution.

---------

While using pipelines in DevOps to deploy applications is the most common scenario for automated deployment, there is also automated deployment of infrastructure resources. Especially after adopting cloud computing platforms, combining infrastructure-as-code approaches can more conveniently integrate cloud resource management into DevOps pipelines, achieving overall automated deployment from resources to applications using DevOps. Today, using Azure cloud as an example, we introduce a basic automated cloud resource management solution.

## Preparing ARM Templates

Azure Resource Manager (ARM) templates are JavaScript Object Notation (JSON) files that define the deployment of Azure solutions. These templates define the resources of a solution and the properties for deploying those resources. ARM templates follow a declarative syntax where you specify what you want to deploy without writing the sequence of commands for the deployment.

### Verifying Azure AD User Permissions

Before starting, ensure your Azure AD user has appropriate permissions to deploy resources. Usually the following permissions are required:
- "Contributor" role or higher permissions on the target resource group
- Permissions to create and manage Azure resources
- Access permissions to the Azure DevOps project

## Configuring Azure DevOps Release Pipeline

### Creating Azure DevOps Service Connection

In Azure DevOps, service connections allow you to connect external services to Azure DevOps. To deploy to Azure, you need to create an Azure Resource Manager service connection.

1. In the Azure DevOps project, navigate to "Project Settings"
2. Select "Service connections"
3. Click "New service connection"
4. Select "Azure Resource Manager"
5. Choose the appropriate authentication method (service principal is usually recommended)
6. Fill in subscription details and complete the configuration

### Creating Release Pipeline

1. In Azure DevOps, navigate to "Pipelines" -> "Releases"
2. Click "New pipeline" to create a new pipeline
3. Select "Empty job" template
4. Add a "Stage" and name it "Deploy to Azure"
5. Add an "Azure Resource Group Deployment" task in the Stage
6. Configure task parameters:
   - Select the service connection created earlier
   - Specify the target resource group
   - Select deployment mode (incremental or complete)
   - Specify ARM template file path
   - If needed, specify parameter file path

## ARM Template Best Practices

1. Use parameterized templates to make templates reusable
2. Use clear naming conventions for parameters and variables
3. Use nested templates for complex deployments
4. Include resource dependencies in templates
5. Use conditional deployment to control resource creation
6. Validate templates to ensure correctness

## Summary

By combining ARM templates with Azure DevOps pipelines, automated deployment and management of infrastructure can be achieved. This approach provides a repeatable, reliable, and auditable deployment process, which is an essential part of modern cloud-native application development. As organizations' demand for automation grows, this infrastructure-as-code approach will become increasingly important.