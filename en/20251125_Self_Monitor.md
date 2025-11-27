# Global Cloud Resource Monitoring System Without Managed Services

Published: *2025-11-26 18:20:00*

Category: __Cloud Computing__

Summary: Build a global resource monitoring system without using any cloud platform managed services.

---------

Public cloud platformes like AWS, Azure, and Google Cloud offer rich resource monitoring services, but these services are typically relatively expensive and monitoring services on different cloud platforms are generally incompatible. Users who deploy multi-cloud solutions also don't want to be locked into a single provider. Building a monitoring system using mainstream open-source software based on cloud platform IaaS services is an operations best practice.

This article uses AWS cloud as an example to introduce how to build a global resource monitoring system without managed services. Other cloud platforms follow similar approaches.

**Core Objective**: Monitor AWS infrastructure resource health and self-hosted digital system operational status, with no managed service dependencies, global high availability, and 99.99% availability.

## 1. Core Design Boundaries and Principles
### 1. Monitoring Targets (Clearly Focused)
- **AWS Infrastructure Resources**: EC2, VPC (subnets/route tables/security groups), ELB (NLB/ALB), S3 (buckets), EBS, Route53, etc.;
- **Self-hosted Digital Systems**: K8s clusters (Master/Worker nodes), middleware (Kafka/EMQ X), databases (MySQL/InfluxDB), application services (microservice containers), etc.;
- **Core Monitoring Dimensions**: Resource utilization (CPU/memory/disk/network), service availability (liveness/response latency), failure events (restarts/crashes/connection failures), performance metrics (QPS/throughput/query latency).

### 2. Design Principles
- No Managed Dependencies: Only use AWS basic resources (EC2, VPC, ELB, S3, ASG, IAM, KMS), self-host all monitoring components;
- High Availability Architecture: Multi-region (≥3) + multi-AZ (≥2 per region) deployment, no single point of failure;
- Global Coverage: Cross-region metric aggregation,就近 access to monitoring panels, global latency <1 second;
- Lightweight Collection: Minimize collector resource consumption to avoid monitoring itself affecting business systems;
- Fast Alerts: Fault detection → alert triggering ≤30 seconds, support multi-level alert routing.

## 2. Overall Layered Architecture Design
### Architecture Overview
```
Monitoring Targets (AWS Resources + Self-hosted Systems) → Metric Collection Layer (Self-deployed Collectors) → Transmission Forwarding Layer (Self-hosted Kafka) → Storage Analysis Layer (Prometheus + Thanos) → Visualization Alerting Layer (Grafana + Alertmanager)
                                  ↓                                      ↓
                          Cross-region Data Sync (Kafka MirrorMaker)        Disaster Recovery Backup Layer (S3 + Cross-region Replication)
```

## 3. Detailed Design of Each Layer (No Managed Service Dependencies)
### (1) Metric Collection Layer: Comprehensive Data Collection, Full Coverage
#### Core Objective: Lightweight, Multi-source Collection, Adapted for AWS Resources + Self-hosted Systems
1. **Technology Selection (Purely Self-deployed)**:
   - Resource Metric Collection: Node Exporter (system-level), AWS CLI custom scripts (AWS resources), cAdvisor (container-level);
   - Service Metric Collection: Blackbox Exporter (port/HTTP liveness), JMX Exporter (middleware), custom Exporters (databases/applications);
   - Collector Deployment: All collectors run as Docker containers on EC2 or K8s nodes, no managed collection service dependencies.

2. **Collection Scenarios**:

| Monitoring Target     | Collection Tool/Method                                                              | Core Metrics Collected                                                             |
|-----------------------|------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| AWS EC2/EBS           | Node Exporter + AWS CLI scripts (timed AWS API calls)                               | CPU usage, memory usage, disk IO, network throughput, EBS read/write latency, instance status (running/stopped/restarted) |
| AWS VPC/Security Groups | Custom Shell scripts (timed verification of route table reachability, security group rule validity) + Route53 health checks | Available IPs in subnets, route table association status, security group port openness, VPC traffic drop rate |
| AWS ELB/S3            | AWS CLI scripts (timed queries of ELB health status, S3 storage usage/success rate) | Healthy backend instances of ELB, request volume, response latency, S3 storage usage, PUT/GET success rate |
| Self-hosted K8s Cluster | cAdvisor + Kube-state-metrics (self-deployed)                                     | Pod/Node resource usage, Pod restart count, Deployment replica readiness, Node readiness status |
| Middleware (Kafka/MySQL) | JMX Exporter (Kafka) + Custom SQL scripts (MySQL)                                | Kafka partition health, Topic backlog, MySQL connections, query latency, master-slave sync delay |
| Application Services  | Custom Exporters (instrumentation exposure/log parsing)                            | Interface response time, error rate, QPS, thread pool status                       |

3. **Collection Optimization**:
   - Collection Frequency: Core metrics (CPU/memory/liveness status) every 10 seconds, non-core metrics (storage usage/S3 status) every 60 seconds;
   - Lightweight: Collector containers limited to CPU≤0.2vCPU, memory≤256MB to avoid occupying business resources;
   - Fault Tolerance: Cache metrics locally for 5 minutes when collection fails, batch upload upon recovery to avoid data loss.

### (2) Transmission Forwarding Layer: Reliable, Low-latency Metric Flow
#### Core Objective: Peak shaving and valley filling, cross-region transmission, prevent metric 

1. **Technology Selection**: Self-hosted Kafka cluster (alternative to managed messaging services) + Kafka MirrorMaker (cross-region sync);

2. **Deployment Architecture**:
   - Within Region: Deploy 1 EC2 (i3.large, local SSD) in each of 3 AZs as Kafka Brokers, 1 EC2 as ZooKeeper (3-node cluster), Topics configured with 3 replicas (cross-AZ);
   - Cross-region Sync: Deploy Kafka MirrorMaker 2.0 to sync metric Topics from each region's Kafka to other regions, ensuring cross-region data consistency;
   - Topic Design: Split by metric type, such as `monitor/aws/ec2`, `monitor/system/k8s`, `monitor/middleware/kafka`, partitions per Topic = brokers in region;

3. **Key Guarantees**:
   - Reliability: Kafka Topic data retention period 24 hours, supports metric replay; enable ACK=all to ensure data is written to all replicas before success;
   - Peak Shaving: Handle metric collection peaks (bulk reporting during system restarts), Kafka buffer queues prevent backend storage overload;
   | Encryption in Transit: Enable TLS 1.3 for Kafka node communication, SASL authentication + TLS encryption for collector→Kafka transmission.

### (3) Storage Analysis Layer: Time-series Data Storage + Cross-region Aggregation
#### Core Objective: High-throughput writes, low-latency queries, long-term storage, global data aggregation

1. **Technology Selection**: Self-hosted Prometheus cluster (real-time metrics) + Thanos (long-term storage + cross-region aggregation) + S3 (cold data archiving);

2. **Deployment Architecture**:
   - Regional Prometheus: Deploy 1 highly available Prometheus cluster (2 Server nodes + shared storage) in each of 3 core regions (US East, EU West, Asia Pacific) to consume Kafka metrics via Kafka Adapter and write to Prometheus;
     - Storage Configuration: Local SSD storage for hot data (last 7 days), write throughput supporting 100k metrics/sec;
     - High Availability: 2 Prometheus Servers with identical collection rules, data synchronized via Thanos Sidecar to avoid single point of failure;
   - Thanos Cluster (Cross-region Aggregation):
     - Thanos Query: Deploy 1 EC2 (m5.large) per region to receive Grafana queries, aggregating data from local + other regions' Prometheus;
     - Thanos Store Gateway: Deployed in S3-access-optimized region, interfacing with S3 cold data storage (metrics older than 7 days), supporting historical data queries;
     - Thanos Compactor: Periodically compress historical metrics in S3 to reduce storage costs;
   - Long-term Storage: Prometheus hot data migrated to S3 via Thanos Uploader after 7 days, S3 enables cross-region replication (sync to 2 backup regions), data retained for 90 days (configurable).

3. **Query Optimization**:
   - Metric Sharding: Shard storage by region + metric type, route queries only to target shards;
   - Cache Strategy: Thanos Query enables local caching (cache hotspot query results for 5 minutes) to reduce cross-region query latency;
   - Index Optimization: Prometheus enables inverted indexing to support fast filtering of metrics by resource ID (e.g., EC2 instance ID, K8s Pod name).

### (4) Visualization Alerting Layer: Global Unified View + Real-time Alerts
#### Core Objective: Intuitive display, fast alerts, fault localization

1. **Technology Selection**: Self-hosted Grafana (visualization) + Alertmanager (alerts) + Custom alert routing service;

2. **Deployment Architecture**:
   - Grafana Cluster: Deploy 1 EC2 (t3.medium) in each of 3 regions, achieve global就近 access via NLB + Route53 intelligent DNS;
     - Data Sources: Connect to all regions' Thanos Query, support "Global Overview - Regional Details - Resource Details" three-level dashboards;
     - Access Control: Enable LDAP authentication (self-hosted OpenLDAP cluster), divide resource access permissions by role (admin/ops/dev);
   - Alertmanager Cluster: Deploy 1 EC2 (t3.small) per region, associated with Prometheus cluster, support alert grouping, silencing, inhibition;
   - Alert Routing: Self-developed alert forwarding service (deployed in K8s), support pushing alerts to email, collaboration systems, and ticketing systems, route to different responsible parties by fault level (P0-P3).

3. **Core Feature Adaptation**:
   - Visualization Dashboards:
     - Global Overview: AWS resource availability, system service health, TOP5 alert types by region;
     - Resource Details: Real-time metric curves for EC2/ELB/S3 (CPU/memory/traffic), abnormal metric marking;
     - Fault Troubleshooting: Correlated metrics + logs (integrated with self-hosted ELK cluster), support retrospective analysis of data before/after faults by time range;
   - Alert Rules:
     - P0 (Critical): Region-level service crashes (e.g., Kafka cluster unavailable), core EC2 instance offline >30 seconds;
     - P1 (Severe): Resource utilization exceeding thresholds (CPU>90% for 5 minutes), database connections exceeding limits;
     - P2 (Moderate): Non-critical service response delay >1 second, S3 storage usage >80%;
     - P3 (Info): Resource configuration nearing expiration, non-critical metric fluctuations.

### (5) Disaster Recovery and High Availability Layer: Seamless Failure Switching
#### Core Objective: Monitoring uninterrupted and data not lost during single-region failures

1. **Region-level Failover**:

   - Route53 Health Checks: Monitor availability of each region's Grafana and Thanos Query, automatically forward user requests to nearest healthy region when a region fails;
   - Data Redundancy: Kafka cross-region sync ensures metrics don't depend on single region, Prometheus hot data stored across AZs, S3 cold data backed up across regions;

2. **Service-level Self-healing**:

   - Collectors: Deployed in ASG, collector containers automatically restarted when EC2 nodes fail;
   - Kafka/Prometheus: Custom monitoring scripts (deployed on EC2) detect service status, automatically restart on failure, trigger ASG to scale new nodes if restart fails;
   - Databases (OpenLDAP/MySQL): Master-slave replication + Keepalived automatic switching, failover time <10 seconds.

## 4. Core Monitoring Scenario Implementation

### 1. AWS Infrastructure Resource Health Monitoring

- EC2 Fault Detection: Node Exporter collects instance status, Prometheus rules judge "instance status ≠ running" or "CPU usage = 0 and memory usage < 10%", triggers P1 alert;
- VPC Network Anomalies: Custom scripts periodically verify subnet route reachability, if failed 3 times consecutively, alert and push route table configuration snapshot;
- S3 Availability Monitoring: AWS CLI scripts periodically perform S3 Put/GET operations, request success rate < 99.99% or latency > 500ms triggers P2 alert.

### 2. Self-hosted System Operation Monitoring
- K8s Cluster Health: Kube-state-metrics collects Pod restart counts, triggers P1 alert if restarted >3 times in 10 minutes; Node readiness status anomaly >1 minute automatically triggers ASG to scale new nodes;
- Kafka Fault Monitoring: JMX Exporter collects partition replica sync status, if "ISR replicas < 2" or "Topic backlog > 100k messages", triggers P0/P1 alerts;
- Application Service Monitoring: Custom Exporter collects interface error rates, triggers P2 alert if error rate >1% in 5 minutes, P1 alert and automatic application restart API call if error rate >5%.

### 3. Fault Root Cause Localization
- Metric Correlation: Grafana supports "resource metrics + service metrics" linked queries (e.g., EC2 CPU 100% → correlated K8s Pod resource usage → locate overloaded Pod);
- Log Correlation: Self-hosted ELK cluster (EC2 deployed) collects system/application logs, Grafana embeds ELK query entry, can correlate metrics and logs by resource ID/time range for rapid fault cause identification.

## 5. Security and Compliance Design

1. **Data Security**:

   - Transmission Encryption: All links (collector→Kafka, Kafka→Prometheus, Grafana→Thanos) enable TLS 1.3;
   - Storage Encryption: EC2 disk EBS encryption, S3 buckets enable SSE-KMS encryption, Prometheus/MySQL data files encrypted;
   - Access Control: IAM roles limit EC2 access to AWS resources (e.g., only allow collector EC2 to call EC2/S3 APIs), Grafana/LDAP isolate monitoring data access permissions by role.

2. **Compliance Adaptation**:

   - Audit Logs: All monitoring operations (alert triggering, permission changes, dashboard modifications) logged, stored in S3 retained for 1 year, compliant with GDPR/CCPA audit requirements;
   - Data Masking: Hide sensitive information in monitoring metrics (e.g., EC2 instance passwords, database connection strings), retain only resource IDs, metric values and other necessary information.

## 6. Operations Automation Design (No Managed Ops Services)

1. **Infrastructure Orchestration**:

   - Terraform IaC: Write modular code to batch create EC2, VPC, ELB, Route53 and other basic resources, as well as deployment configurations for self-hosted components like Kafka, Prometheus, Grafana;
   - Environment Consistency: Differentiate dev/test/prod via Terraform workspaces, state files stored in S3 + DynamoDB locks to avoid configuration conflicts.

2. **Service Automated Operations**:

   - Custom Shell/Python Scripts: Monitor collector, Kafka, Prometheus operational status, automatically restart services on anomalies, trigger ASG to scale if restart fails;
   - Configuration Auto-sync: Sync all monitoring component config files (Prometheus rules, Grafana dashboards) via Git+Ansible, automatically distribute to all nodes after modification;
   - Version Upgrades: Use blue-green deployment model to upgrade monitoring components (e.g., Grafana/Prometheus), ensure monitoring uninterrupted during upgrades.

## 7. Core Metrics Assurance
| Metric Type         | Target Value              | Implementation Approach                      |
|---------------------|---------------------------|---------------------------------------------|
| System Availability | 99.99% (annual downtime<53 mins) | Multi-region + multi-AZ deployment, automatic failover, service multi-replica |
| Metric Collection Latency | <30 seconds          | Lightweight collectors, Kafka low-latency transmission |
| Alert Triggering Latency  | <30 seconds          | Prometheus real-time rule evaluation, Alertmanager second-level forwarding |
| Cross-region Query Latency| <1 second            | Thanos aggregation, cache optimization  |
| Data Retention Period     | Hot data 7 days, cold data 90 days | Prometheus + S3 tiered storage             |

## Summary
This architecture is completely self-hosted based on AWS basic resources, with no managed service dependencies. Through a closed-loop design of "comprehensive collection → reliable transmission → layered storage → global aggregation → real-time alerting", it achieves unified monitoring of AWS infrastructure resources and self-hosted digital systems. Multi-region + multi-AZ deployment guarantees 99.99% availability, cross-region data synchronization and access adapt to global business, lightweight collection and optimized storage balance performance and cost, fully satisfying global monitoring needs for "systems + cloud resources" while adapting to security compliance requirements of foreign enterprises.