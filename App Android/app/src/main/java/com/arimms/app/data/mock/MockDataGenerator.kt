package com.arimms.app.data.mock

import com.arimms.app.domain.model.*

object MockDataGenerator {

    fun createInitialNodes(): List<ServerNode> {
        val node1 = ServerNode(
            id = "SRV-NODE-01",
            name = "Compute Worker Node 01",
            ipAddress = "192.168.1.101",
            rackId = "rack-a1",
            rackUnitPosition = 12,
            unitHeight = 2,
            markerCode = "SRV-NODE-01",
            model = "Dell PowerEdge R750",
            cpuModel = "Intel Xeon Silver 4314 @ 2.40GHz (32 Cores)",
            totalCores = 32,
            totalRamGb = 64,
            totalDiskGb = 2000,
            osName = "Ubuntu Server 22.04 LTS",
            currentTelemetry = TelemetryMetric(
                nodeId = "SRV-NODE-01",
                cpuUsagePercent = 45.2,
                memoryUsagePercent = 58.0,
                memoryUsedGb = 37.12,
                memoryTotalGb = 64.0,
                diskUsagePercent = 32.5,
                temperatureCelsius = 42.1,
                networkInKbps = 1200.0,
                networkOutKbps = 3400.0,
                powerWatts = 280.0,
                fanSpeedRpm = 4500,
                status = NodeHealthStatus.HEALTHY
            ),
            containers = listOf(
                ContainerWorkload(
                    id = "c-nginx",
                    name = "nginx-gateway",
                    image = "nginx:alpine-slim",
                    state = ContainerState.RUNNING,
                    cpuPercent = 3.5,
                    memoryUsageMb = 128.0,
                    memoryLimitMb = 1024.0,
                    uptimeSeconds = 345600,
                    portMappings = listOf("80:80", "443:443")
                ),
                ContainerWorkload(
                    id = "c-traefik",
                    name = "traefik-proxy",
                    image = "traefik:v2.10",
                    state = ContainerState.RUNNING,
                    cpuPercent = 8.2,
                    memoryUsageMb = 450.0,
                    memoryLimitMb = 2048.0,
                    uptimeSeconds = 345600,
                    portMappings = listOf("8080:8080")
                )
            )
        )

        val node2 = ServerNode(
            id = "SRV-NODE-02",
            name = "Database Primary Node 02",
            ipAddress = "192.168.1.102",
            rackId = "rack-a1",
            rackUnitPosition = 16,
            unitHeight = 2,
            markerCode = "SRV-NODE-02",
            model = "HP ProLiant DL380 Gen10",
            cpuModel = "AMD EPYC 7302 @ 3.00GHz (32 Cores)",
            totalCores = 32,
            totalRamGb = 128,
            totalDiskGb = 8000,
            osName = "Debian 12 Bookworm",
            currentTelemetry = TelemetryMetric(
                nodeId = "SRV-NODE-02",
                cpuUsagePercent = 72.4,
                memoryUsagePercent = 86.5,
                memoryUsedGb = 110.72,
                memoryTotalGb = 128.0,
                diskUsagePercent = 68.0,
                temperatureCelsius = 56.4,
                networkInKbps = 8900.0,
                networkOutKbps = 12400.0,
                powerWatts = 340.0,
                fanSpeedRpm = 6200,
                status = NodeHealthStatus.WARNING
            ),
            containers = listOf(
                ContainerWorkload(
                    id = "c-postgres",
                    name = "postgres-primary-db",
                    image = "postgres:15-alpine",
                    state = ContainerState.RUNNING,
                    cpuPercent = 48.0,
                    memoryUsageMb = 92000.0,
                    memoryLimitMb = 110000.0,
                    uptimeSeconds = 1209600,
                    portMappings = listOf("5432:5432")
                ),
                ContainerWorkload(
                    id = "c-redis",
                    name = "redis-cluster-cache",
                    image = "redis:7.0-alpine",
                    state = ContainerState.RUNNING,
                    cpuPercent = 4.5,
                    memoryUsageMb = 1200.0,
                    memoryLimitMb = 4096.0,
                    uptimeSeconds = 864000,
                    portMappings = listOf("6379:6379")
                )
            )
        )

        val node3 = ServerNode(
            id = "SRV-NODE-03",
            name = "Microservices Cluster Node 03",
            ipAddress = "192.168.1.103",
            rackId = "rack-a1",
            rackUnitPosition = 22,
            unitHeight = 2,
            markerCode = "SRV-NODE-03",
            model = "Dell PowerEdge R640",
            cpuModel = "Intel Xeon Silver 4210R @ 2.40GHz (20 Cores)",
            totalCores = 20,
            totalRamGb = 64,
            totalDiskGb = 1000,
            osName = "Ubuntu Server 22.04 LTS",
            currentTelemetry = TelemetryMetric(
                nodeId = "SRV-NODE-03",
                cpuUsagePercent = 28.0,
                memoryUsagePercent = 44.0,
                memoryUsedGb = 28.16,
                memoryTotalGb = 64.0,
                diskUsagePercent = 24.0,
                temperatureCelsius = 38.5,
                networkInKbps = 2400.0,
                networkOutKbps = 1800.0,
                powerWatts = 160.0,
                fanSpeedRpm = 4100,
                status = NodeHealthStatus.HEALTHY
            ),
            containers = listOf(
                ContainerWorkload(
                    id = "c-rabbitmq",
                    name = "rabbitmq-telemetry-broker",
                    image = "rabbitmq:3.12-alpine",
                    state = ContainerState.RUNNING,
                    cpuPercent = 9.0,
                    memoryUsageMb = 1420.0,
                    memoryLimitMb = 4096.0,
                    uptimeSeconds = 432000,
                    portMappings = listOf("5672:5672")
                )
            )
        )

        val node4 = ServerNode(
            id = "SRV-NODE-04",
            name = "Object Storage Node 04",
            ipAddress = "192.168.1.104",
            rackId = "rack-a2",
            rackUnitPosition = 10,
            unitHeight = 2,
            markerCode = "SRV-NODE-04",
            model = "Supermicro SuperServer 2029U",
            cpuModel = "AMD EPYC 7302P @ 3.0GHz (16 Cores)",
            totalCores = 16,
            totalRamGb = 128,
            totalDiskGb = 32000,
            osName = "AlmaLinux 9.2",
            currentTelemetry = TelemetryMetric(
                nodeId = "SRV-NODE-04",
                cpuUsagePercent = 24.5,
                memoryUsagePercent = 38.0,
                memoryUsedGb = 48.64,
                memoryTotalGb = 128.0,
                diskUsagePercent = 54.0,
                temperatureCelsius = 37.2,
                networkInKbps = 14200.0,
                networkOutKbps = 16800.0,
                powerWatts = 290.0,
                fanSpeedRpm = 4000,
                status = NodeHealthStatus.HEALTHY
            ),
            containers = listOf(
                ContainerWorkload(
                    id = "c-minio",
                    name = "minio-s3-cluster",
                    image = "minio/minio:latest",
                    state = ContainerState.RUNNING,
                    cpuPercent = 7.0,
                    memoryUsageMb = 2100.0,
                    memoryLimitMb = 8192.0,
                    uptimeSeconds = 2592000,
                    portMappings = listOf("9000:9000")
                )
            )
        )

        val node5 = ServerNode(
            id = "SRV-NODE-05",
            name = "AI GPU Inference Worker 05",
            ipAddress = "192.168.1.105",
            rackId = "rack-a2",
            rackUnitPosition = 24,
            unitHeight = 4,
            markerCode = "SRV-NODE-05",
            model = "Gigabyte G482-Z54 (4x RTX 4090)",
            cpuModel = "AMD EPYC 7742 @ 2.25GHz (64 Cores)",
            totalCores = 64,
            totalRamGb = 256,
            totalDiskGb = 16000,
            osName = "Ubuntu Server 22.04 LTS (NVIDIA Cuda 12.4)",
            currentTelemetry = TelemetryMetric(
                nodeId = "SRV-NODE-05",
                cpuUsagePercent = 94.0,
                memoryUsagePercent = 89.5,
                memoryUsedGb = 229.12,
                memoryTotalGb = 256.0,
                diskUsagePercent = 65.0,
                temperatureCelsius = 86.8, // Critical Overheat!
                networkInKbps = 28000.0,
                networkOutKbps = 22000.0,
                powerWatts = 1480.0,
                fanSpeedRpm = 8900,
                status = NodeHealthStatus.CRITICAL
            ),
            containers = listOf(
                ContainerWorkload(
                    id = "c-vllm",
                    name = "vllm-openai-engine",
                    image = "vllm/vllm-openai:latest",
                    state = ContainerState.RUNNING,
                    cpuPercent = 82.0,
                    memoryUsageMb = 154000.0,
                    memoryLimitMb = 200000.0,
                    uptimeSeconds = 86400,
                    portMappings = listOf("8000:8000")
                ),
                ContainerWorkload(
                    id = "c-aruco",
                    name = "aruco-spatial-detector",
                    image = "arimms/vision-detector:v1.2",
                    state = ContainerState.CRASHED,
                    cpuPercent = 0.0,
                    memoryUsageMb = 0.0,
                    memoryLimitMb = 4096.0,
                    uptimeSeconds = 0,
                    portMappings = listOf("8080:8080")
                )
            )
        )

        return listOf(node1, node2, node3, node4, node5)
    }

    fun createInitialRacks(nodes: List<ServerNode>): List<Rack> {
        val rack1Nodes = nodes.filter { it.rackId == "rack-a1" }
        val rack2Nodes = nodes.filter { it.rackId == "rack-a2" }

        val rack1 = Rack(
            id = "rack-a1",
            name = "Rack A1 - HPC & Cloud Core",
            code = "RACK-A1",
            roomId = "room-01",
            totalUnits = 42,
            powerCapacityWatts = 10000.0,
            currentPowerWatts = rack1Nodes.sumOf { it.currentTelemetry.powerWatts },
            currentTemperatureCelsius = 23.8,
            nodes = rack1Nodes
        )

        val rack2 = Rack(
            id = "rack-a2",
            name = "Rack A2 - Storage & AI Testbed",
            code = "RACK-A2",
            roomId = "room-01",
            totalUnits = 42,
            powerCapacityWatts = 12000.0,
            currentPowerWatts = rack2Nodes.sumOf { it.currentTelemetry.powerWatts },
            currentTemperatureCelsius = 28.5,
            nodes = rack2Nodes
        )

        return listOf(rack1, rack2)
    }

    fun createInitialSites(racks: List<Rack>): List<Site> {
        val room1 = Room(
            id = "room-01",
            name = "Server Room 01 (Data Hall Alpha)",
            siteId = "site-01",
            racks = racks,
            targetPue = 1.25,
            currentPue = 1.28
        )

        val site1 = Site(
            id = "site-01",
            name = "DC Saigon High-Tech Park (Testbed)",
            location = "Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh",
            rooms = listOf(room1)
        )

        return listOf(site1)
    }

    fun createInitialAlerts(): List<SystemAlert> {
        return listOf(
            SystemAlert(
                id = "ALT-2026-1001",
                nodeId = "SRV-NODE-05",
                nodeName = "AI GPU Inference Worker 05",
                rackId = "rack-a2",
                title = "Nhiệt độ Chassis vượt ngưỡng nguy hiểm (86.8°C)",
                message = "Cảm biến nhiệt độ Chassis Fan 2 vượt ngưỡng cảnh báo đỏ (80.0°C). Nguy cơ tự ngắt nguồn khẩn cấp (Thermal Shutdown).",
                severity = AlertSeverity.CRITICAL,
                state = AlertState.OPEN,
                timestamp = System.currentTimeMillis() - 15 * 60 * 1000
            ),
            SystemAlert(
                id = "ALT-2026-1002",
                nodeId = "SRV-NODE-05",
                nodeName = "AI GPU Inference Worker 05",
                rackId = "rack-a2",
                title = "Container 'aruco-spatial-detector' gặp sự cố OOM",
                message = "Dịch vụ thị giác máy tính AR gặp lỗi Out Of Memory (Exit Code 137). Yêu cầu khởi động lại workload.",
                severity = AlertSeverity.CRITICAL,
                state = AlertState.OPEN,
                timestamp = System.currentTimeMillis() - 25 * 60 * 1000
            ),
            SystemAlert(
                id = "ALT-2026-1003",
                nodeId = "SRV-NODE-02",
                nodeName = "Database Primary Node 02",
                rackId = "rack-a1",
                title = "Tải bộ nhớ RAM cao liên tục (86.5%)",
                message = "Tiến trình PostgreSQL Shared Buffers chiếm 110.72 / 128 GB RAM trong hơn 30 phút.",
                severity = AlertSeverity.WARNING,
                state = AlertState.ACKNOWLEDGED,
                timestamp = System.currentTimeMillis() - 60 * 60 * 1000,
                acknowledgedBy = "System Administrator"
            )
        )
    }

    fun createInitialTickets(): List<MaintenanceTicket> {
        return listOf(
            MaintenanceTicket(
                id = "TCK-2026-001",
                title = "Xử lý khẩn cấp tản nhiệt Server SRV-NODE-05 (Rack A2 / U24)",
                description = "Kiểm tra khe hút gió phía trước và quạt làm mát số 2 trên server SRV-NODE-05. Khởi động lại dịch vụ aruco-spatial-detector.",
                priority = TicketPriority.EMERGENCY,
                status = TicketStatus.IN_PROGRESS,
                assignedToUserId = "USR-001",
                assignedToName = "System Administrator",
                nodeId = "SRV-NODE-05",
                nodeName = "AI GPU Inference Worker 05",
                rackCode = "RACK-A2",
                roomName = "Server Room 01",
                alertId = "ALT-2026-1001",
                createdAt = System.currentTimeMillis() - 30 * 60 * 1000,
                checkedInAt = System.currentTimeMillis() - 10 * 60 * 1000,
                rootCauseNotes = "Bụi bám khe thông gió mặt sau U24, quạt phụ số 2 bị kẹt nhẹ."
            ),
            MaintenanceTicket(
                id = "TCK-2026-002",
                title = "Bảo trì định kỳ & Kiểm tra cáp mạng 10Gbps SRV-NODE-02",
                description = "Kiểm tra suy hao tín hiệu cổng eth0 trên máy chủ CSDL SRV-NODE-02.",
                priority = TicketPriority.MEDIUM,
                status = TicketStatus.ASSIGNED,
                assignedToUserId = "USR-001",
                assignedToName = "System Administrator",
                nodeId = "SRV-NODE-02",
                nodeName = "Database Primary Node 02",
                rackCode = "RACK-A1",
                roomName = "Server Room 01",
                alertId = "ALT-2026-1003",
                createdAt = System.currentTimeMillis() - 2 * 3600 * 1000
            ),
            MaintenanceTicket(
                id = "TCK-2026-003",
                title = "Nâng cấp RAM từ 32GB lên 64GB cho Server SRV-NODE-03",
                description = "Lắp thêm 2 thanh DDR4 ECC 16GB Bus 3200MHz vào Slot 3 và Slot 4 trên mainboard.",
                priority = TicketPriority.LOW,
                status = TicketStatus.RESOLVED,
                assignedToUserId = "USR-001",
                assignedToName = "System Administrator",
                nodeId = "SRV-NODE-03",
                nodeName = "Microservices Cluster Node 03",
                rackCode = "RACK-A1",
                roomName = "Server Room 01",
                createdAt = System.currentTimeMillis() - 24 * 3600 * 1000,
                checkedInAt = System.currentTimeMillis() - 20 * 3600 * 1000,
                resolvedAt = System.currentTimeMillis() - 18 * 3600 * 1000,
                rootCauseNotes = "Nâng cấp theo kế hoạch mở rộng hàng quý.",
                resolutionNotes = "Đã cắm 2x16GB ECC, kiểm tra BIOS nhận đủ 64GB, memtest86 pass 100%."
            )
        )
    }

    fun getDefaultUser(role: UserRole = UserRole.TECHNICIAN): User {
        return when (role) {
            UserRole.TECHNICIAN -> User(
                id = "USR-002",
                username = "technician@ar-imms.dc",
                fullName = "Trần Kỹ Thuật Viên",
                role = UserRole.TECHNICIAN,
                email = "tech.arimms@ar-imms.dc",
                token = "jwt-mock-tech-token-12345"
            )
            UserRole.OPERATOR -> User(
                id = "USR-003",
                username = "operator@ar-imms.dc",
                fullName = "Lê Quản Trị Vận Hành",
                role = UserRole.OPERATOR,
                email = "operator.arimms@ar-imms.dc",
                token = "jwt-mock-oper-token-67890"
            )
            UserRole.ADMIN -> User(
                id = "USR-001",
                username = "admin@ar-imms.dc",
                fullName = "System Administrator",
                role = UserRole.ADMIN,
                email = "admin@ar-imms.dc",
                token = "jwt-mock-admin-token-99999"
            )
        }
    }
}
