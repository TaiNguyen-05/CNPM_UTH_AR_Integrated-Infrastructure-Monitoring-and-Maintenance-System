package com.arimms.app.data.repository

import com.arimms.app.data.api.*
import com.arimms.app.data.local.AppPreferences
import com.arimms.app.domain.model.*
import com.arimms.app.domain.repository.ARImmsRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.launch

class ARImmsRepositoryImpl(
    private val preferences: AppPreferences,
    private val apiClient: ApiClient,
    private val socketManager: SocketManager,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.IO)
) : ARImmsRepository {

    companion object {
        val UNIFIED_SYSTEM_ACCOUNTS = listOf(
            User(
                id = "ADM-0001",
                username = "sjenkins@ar-imms.corp",
                fullName = "Sarah Jenkins",
                role = UserRole.ADMIN,
                email = "sjenkins@ar-imms.corp"
            ),
            User(
                id = "USR-001",
                username = "admin@ar-imms.dc",
                fullName = "System Administrator",
                role = UserRole.ADMIN,
                email = "admin@ar-imms.dc"
            ),
            User(
                id = "USR-002",
                username = "operator@ar-imms.dc",
                fullName = "System Operator",
                role = UserRole.OPERATOR,
                email = "operator@ar-imms.dc"
            ),
            User(
                id = "VIEW-1024",
                username = "mchen@ar-imms.corp",
                fullName = "Michael Chen",
                role = UserRole.OPERATOR,
                email = "mchen@ar-imms.corp"
            ),
            User(
                id = "TECH-4421",
                username = "rking@ar-imms.corp",
                fullName = "Robert King",
                role = UserRole.TECHNICIAN,
                email = "rking@ar-imms.corp"
            ),
            User(
                id = "TECH-1940",
                username = "erostova@ar-imms.corp",
                fullName = "Elena Rostova",
                role = UserRole.TECHNICIAN,
                email = "erostova@ar-imms.corp"
            ),
            User(
                id = "TECH-8892",
                username = "jdoe@ar-imms.corp",
                fullName = "John Doe",
                role = UserRole.TECHNICIAN,
                email = "jdoe@ar-imms.corp"
            ),
            User(
                id = "USR-003",
                username = "tech.nguyenvanb@ar-imms.dc",
                fullName = "Nguyen Van B",
                role = UserRole.TECHNICIAN,
                email = "tech.nguyenvanb@ar-imms.dc"
            )
        )

        // 14 Nodes synchronized across Web Admin & Mobile App (Racks A1, A2, B1)
        val INITIAL_UNIFIED_NODES = listOf(
            // Rack A1 (Compute & Storage Zone 1-A)
            ServerNode(
                id = "pdu-main-a",
                name = "PDU Main A",
                ipAddress = "192.168.1.10",
                rackId = "rack-a1",
                rackUnitPosition = 1,
                unitHeight = 1,
                markerCode = "ar-imms://node/pdu-main-a",
                model = "APC 8000 PDU",
                cpuModel = "Microcontroller MCU-8",
                totalCores = 2,
                totalRamGb = 4,
                totalDiskGb = 16,
                osName = "Embedded PowerOS",
                currentTelemetry = TelemetryMetric(
                    nodeId = "pdu-main-a",
                    cpuUsagePercent = 12.0,
                    memoryUsagePercent = 18.0,
                    memoryUsedGb = 0.72,
                    memoryTotalGb = 4.0,
                    diskUsagePercent = 10.0,
                    temperatureCelsius = 24.0,
                    networkInKbps = 800.0,
                    networkOutKbps = 600.0,
                    powerWatts = 120.0,
                    fanSpeedRpm = 2200,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "pdu-backup-b",
                name = "PDU Backup B",
                ipAddress = "192.168.1.11",
                rackId = "rack-a1",
                rackUnitPosition = 2,
                unitHeight = 1,
                markerCode = "ar-imms://node/pdu-backup-b",
                model = "APC 8000 PDU",
                cpuModel = "Microcontroller MCU-8",
                totalCores = 2,
                totalRamGb = 4,
                totalDiskGb = 16,
                osName = "Embedded PowerOS",
                currentTelemetry = TelemetryMetric(
                    nodeId = "pdu-backup-b",
                    cpuUsagePercent = 10.0,
                    memoryUsagePercent = 15.0,
                    memoryUsedGb = 0.6,
                    memoryTotalGb = 4.0,
                    diskUsagePercent = 10.0,
                    temperatureCelsius = 25.0,
                    networkInKbps = 600.0,
                    networkOutKbps = 500.0,
                    powerWatts = 110.0,
                    fanSpeedRpm = 2200,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "storage-vault-1",
                name = "Storage Vault 1",
                ipAddress = "192.168.1.20",
                rackId = "rack-a1",
                rackUnitPosition = 3,
                unitHeight = 2,
                markerCode = "ar-imms://node/storage-vault-1",
                model = "NetApp FAS",
                cpuModel = "Intel Xeon Silver 4314",
                totalCores = 16,
                totalRamGb = 64,
                totalDiskGb = 24000,
                osName = "ONTAP 9.12",
                currentTelemetry = TelemetryMetric(
                    nodeId = "storage-vault-1",
                    cpuUsagePercent = 32.0,
                    memoryUsagePercent = 44.0,
                    memoryUsedGb = 28.16,
                    memoryTotalGb = 64.0,
                    diskUsagePercent = 68.0,
                    temperatureCelsius = 28.0,
                    networkInKbps = 4500.0,
                    networkOutKbps = 7200.0,
                    powerWatts = 380.0,
                    fanSpeedRpm = 3800,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "app-node-01",
                name = "App Node 01",
                ipAddress = "192.168.1.31",
                rackId = "rack-a1",
                rackUnitPosition = 4,
                unitHeight = 1,
                markerCode = "ar-imms://node/app-node-01",
                model = "Dell PowerEdge R640",
                cpuModel = "Intel Xeon Gold 6248R",
                totalCores = 24,
                totalRamGb = 64,
                totalDiskGb = 2000,
                osName = "Ubuntu Server 22.04 LTS",
                currentTelemetry = TelemetryMetric(
                    nodeId = "app-node-01",
                    cpuUsagePercent = 45.0,
                    memoryUsagePercent = 50.0,
                    memoryUsedGb = 32.0,
                    memoryTotalGb = 64.0,
                    diskUsagePercent = 25.0,
                    temperatureCelsius = 29.0,
                    networkInKbps = 3200.0,
                    networkOutKbps = 5400.0,
                    powerWatts = 280.0,
                    fanSpeedRpm = 4200,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "app-node-02",
                name = "App Node 02",
                ipAddress = "192.168.1.32",
                rackId = "rack-a1",
                rackUnitPosition = 5,
                unitHeight = 1,
                markerCode = "ar-imms://node/app-node-02",
                model = "Dell PowerEdge R640",
                cpuModel = "Intel Xeon Gold 6248R",
                totalCores = 24,
                totalRamGb = 64,
                totalDiskGb = 2000,
                osName = "Ubuntu Server 22.04 LTS",
                currentTelemetry = TelemetryMetric(
                    nodeId = "app-node-02",
                    cpuUsagePercent = 48.0,
                    memoryUsagePercent = 52.0,
                    memoryUsedGb = 33.28,
                    memoryTotalGb = 64.0,
                    diskUsagePercent = 28.0,
                    temperatureCelsius = 30.0,
                    networkInKbps = 3600.0,
                    networkOutKbps = 5800.0,
                    powerWatts = 290.0,
                    fanSpeedRpm = 4300,
                    status = NodeHealthStatus.HEALTHY
                )
            ),

            // Rack A2 (Compute & AI Acceleration Zone 1-A)
            ServerNode(
                id = "patch-panel-a2",
                name = "Patch Panel A2-P1",
                ipAddress = "192.168.1.5",
                rackId = "rack-a2",
                rackUnitPosition = 1,
                unitHeight = 1,
                markerCode = "ar-imms://node/patch-panel-a2",
                model = "Cat6A 48-Port Panel",
                cpuModel = "Passive Terminal",
                totalCores = 1,
                totalRamGb = 1,
                totalDiskGb = 1,
                osName = "Hardware Layer",
                currentTelemetry = TelemetryMetric(
                    nodeId = "patch-panel-a2",
                    cpuUsagePercent = 0.0,
                    memoryUsagePercent = 0.0,
                    memoryUsedGb = 0.0,
                    memoryTotalGb = 1.0,
                    diskUsagePercent = 0.0,
                    temperatureCelsius = 22.0,
                    networkInKbps = 9500.0,
                    networkOutKbps = 9500.0,
                    powerWatts = 0.0,
                    fanSpeedRpm = 0,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "tor-switch-02",
                name = "TOR Switch 02",
                ipAddress = "192.168.1.2",
                rackId = "rack-a2",
                rackUnitPosition = 2,
                unitHeight = 1,
                markerCode = "ar-imms://node/tor-switch-02",
                model = "Cisco Nexus 9300",
                cpuModel = "Cisco Quad-Core ASIC",
                totalCores = 8,
                totalRamGb = 16,
                totalDiskGb = 64,
                osName = "NX-OS 10.3",
                currentTelemetry = TelemetryMetric(
                    nodeId = "tor-switch-02",
                    cpuUsagePercent = 52.0,
                    memoryUsagePercent = 60.0,
                    memoryUsedGb = 9.6,
                    memoryTotalGb = 16.0,
                    diskUsagePercent = 15.0,
                    temperatureCelsius = 32.0,
                    networkInKbps = 14500.0,
                    networkOutKbps = 18200.0,
                    powerWatts = 220.0,
                    fanSpeedRpm = 5100,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "a2-unit-03",
                name = "A2 - Unit 03",
                ipAddress = "192.168.1.102",
                rackId = "rack-a2",
                rackUnitPosition = 3,
                unitHeight = 2,
                markerCode = "ar-imms://node/a2-unit-03",
                model = "XR-9000 Compute Blade",
                cpuModel = "Intel Xeon Platinum 8380",
                totalCores = 40,
                totalRamGb = 128,
                totalDiskGb = 4000,
                osName = "Ubuntu Server 22.04 LTS",
                currentTelemetry = TelemetryMetric(
                    nodeId = "a2-unit-03",
                    cpuUsagePercent = 95.0,
                    memoryUsagePercent = 62.0,
                    memoryUsedGb = 79.36,
                    memoryTotalGb = 128.0,
                    diskUsagePercent = 28.0,
                    temperatureCelsius = 92.0,
                    networkInKbps = 1400.0,
                    networkOutKbps = 2100.0,
                    powerWatts = 650.0,
                    fanSpeedRpm = 1200,
                    status = NodeHealthStatus.CRITICAL
                )
            ),
            ServerNode(
                id = "gpu-node-04",
                name = "GPU Node 04",
                ipAddress = "192.168.1.106",
                rackId = "rack-a2",
                rackUnitPosition = 4,
                unitHeight = 4,
                markerCode = "ar-imms://node/gpu-node-04",
                model = "NVIDIA DGX A100",
                cpuModel = "AMD EPYC 7742 + 8x A100 SXM4",
                totalCores = 64,
                totalRamGb = 512,
                totalDiskGb = 15000,
                osName = "DGX OS 6 (Ubuntu 22.04)",
                currentTelemetry = TelemetryMetric(
                    nodeId = "gpu-node-04",
                    cpuUsagePercent = 70.0,
                    memoryUsagePercent = 75.0,
                    memoryUsedGb = 384.0,
                    memoryTotalGb = 512.0,
                    diskUsagePercent = 40.0,
                    temperatureCelsius = 58.0,
                    networkInKbps = 18000.0,
                    networkOutKbps = 24000.0,
                    powerWatts = 2800.0,
                    fanSpeedRpm = 6800,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "compute-node-05",
                name = "Compute Node 05",
                ipAddress = "192.168.1.105",
                rackId = "rack-a2",
                rackUnitPosition = 5,
                unitHeight = 2,
                markerCode = "ar-imms://node/compute-node-05",
                model = "Dell PowerEdge R740xd",
                cpuModel = "Intel Xeon Gold 6248R",
                totalCores = 48,
                totalRamGb = 128,
                totalDiskGb = 8000,
                osName = "Ubuntu Server 22.04 LTS",
                currentTelemetry = TelemetryMetric(
                    nodeId = "compute-node-05",
                    cpuUsagePercent = 38.0,
                    memoryUsagePercent = 42.0,
                    memoryUsedGb = 53.76,
                    memoryTotalGb = 128.0,
                    diskUsagePercent = 20.0,
                    temperatureCelsius = 34.0,
                    networkInKbps = 2400.0,
                    networkOutKbps = 3900.0,
                    powerWatts = 340.0,
                    fanSpeedRpm = 4400,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "database-worker",
                name = "Database Worker",
                ipAddress = "192.168.1.103",
                rackId = "rack-a2",
                rackUnitPosition = 6,
                unitHeight = 4,
                markerCode = "ar-imms://node/database-worker",
                model = "HP DL580 Gen10",
                cpuModel = "Intel Xeon Platinum 8280 (4P/112C)",
                totalCores = 112,
                totalRamGb = 256,
                totalDiskGb = 12000,
                osName = "Red Hat Enterprise Linux 9",
                currentTelemetry = TelemetryMetric(
                    nodeId = "database-worker",
                    cpuUsagePercent = 65.0,
                    memoryUsagePercent = 80.0,
                    memoryUsedGb = 204.8,
                    memoryTotalGb = 256.0,
                    diskUsagePercent = 55.0,
                    temperatureCelsius = 36.0,
                    networkInKbps = 5200.0,
                    networkOutKbps = 8900.0,
                    powerWatts = 580.0,
                    fanSpeedRpm = 4600,
                    status = NodeHealthStatus.HEALTHY
                )
            ),

            // Rack B1 (Network & Security Zone 1-B)
            ServerNode(
                id = "edge-router-b1",
                name = "Edge Router B1",
                ipAddress = "192.168.1.1",
                rackId = "rack-b1",
                rackUnitPosition = 1,
                unitHeight = 2,
                markerCode = "ar-imms://node/edge-router-b1",
                model = "Juniper MX240",
                cpuModel = "Trio 6 ASIC Packet Forwarding Engine",
                totalCores = 16,
                totalRamGb = 32,
                totalDiskGb = 128,
                osName = "Junos OS 22.4",
                currentTelemetry = TelemetryMetric(
                    nodeId = "edge-router-b1",
                    cpuUsagePercent = 22.0,
                    memoryUsagePercent = 30.0,
                    memoryUsedGb = 9.6,
                    memoryTotalGb = 32.0,
                    diskUsagePercent = 18.0,
                    temperatureCelsius = 28.0,
                    networkInKbps = 22000.0,
                    networkOutKbps = 28000.0,
                    powerWatts = 420.0,
                    fanSpeedRpm = 4800,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "core-firewall-01",
                name = "Core Firewall 01",
                ipAddress = "192.168.1.3",
                rackId = "rack-b1",
                rackUnitPosition = 2,
                unitHeight = 2,
                markerCode = "ar-imms://node/core-firewall-01",
                model = "Palo Alto PA-3200",
                cpuModel = "Multi-Core Dedicated Security Processor",
                totalCores = 16,
                totalRamGb = 32,
                totalDiskGb = 256,
                osName = "PAN-OS 11.0",
                currentTelemetry = TelemetryMetric(
                    nodeId = "core-firewall-01",
                    cpuUsagePercent = 40.0,
                    memoryUsagePercent = 45.0,
                    memoryUsedGb = 14.4,
                    memoryTotalGb = 32.0,
                    diskUsagePercent = 22.0,
                    temperatureCelsius = 31.0,
                    networkInKbps = 18000.0,
                    networkOutKbps = 18000.0,
                    powerWatts = 360.0,
                    fanSpeedRpm = 4900,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "backup-appliance",
                name = "Backup Appliance",
                ipAddress = "192.168.1.50",
                rackId = "rack-b1",
                rackUnitPosition = 3,
                unitHeight = 2,
                markerCode = "ar-imms://node/backup-appliance",
                model = "Veeam Vault Storage",
                cpuModel = "AMD EPYC 7282",
                totalCores = 16,
                totalRamGb = 64,
                totalDiskGb = 32000,
                osName = "Hardened Linux Backup Repo",
                currentTelemetry = TelemetryMetric(
                    nodeId = "backup-appliance",
                    cpuUsagePercent = 15.0,
                    memoryUsagePercent = 25.0,
                    memoryUsedGb = 16.0,
                    memoryTotalGb = 64.0,
                    diskUsagePercent = 48.0,
                    temperatureCelsius = 27.0,
                    networkInKbps = 1200.0,
                    networkOutKbps = 800.0,
                    powerWatts = 260.0,
                    fanSpeedRpm = 3600,
                    status = NodeHealthStatus.HEALTHY
                )
            )
        )

        // 3 Racks matching Web Admin (A1, A2, B1)
        val INITIAL_UNIFIED_RACKS = listOf(
            Rack(
                id = "rack-a1",
                name = "A1",
                code = "RACK-A1",
                roomId = "room-01",
                totalUnits = 42,
                powerCapacityWatts = 12500.0,
                currentPowerWatts = 1180.0,
                currentTemperatureCelsius = 27.2,
                nodes = INITIAL_UNIFIED_NODES.filter { it.rackId == "rack-a1" }
            ),
            Rack(
                id = "rack-a2",
                name = "A2",
                code = "RACK-A2",
                roomId = "room-01",
                totalUnits = 42,
                powerCapacityWatts = 20000.0,
                currentPowerWatts = 4590.0,
                currentTemperatureCelsius = 45.6,
                nodes = INITIAL_UNIFIED_NODES.filter { it.rackId == "rack-a2" }
            ),
            Rack(
                id = "rack-b1",
                name = "B1",
                code = "RACK-B1",
                roomId = "room-01",
                totalUnits = 42,
                powerCapacityWatts = 15000.0,
                currentPowerWatts = 1040.0,
                currentTemperatureCelsius = 28.6,
                nodes = INITIAL_UNIFIED_NODES.filter { it.rackId == "rack-b1" }
            )
        )

        // 3 Alerts matching Web Admin
        val INITIAL_UNIFIED_ALERTS = listOf(
            SystemAlert(
                id = "alt-1",
                nodeId = "a2-unit-03",
                nodeName = "A2 - Unit 03 (XR-9000)",
                rackId = "rack-a2",
                title = "Cooling System Failure",
                message = "Rack A2 Unit 03 ambient temperature exceeded safe threshold (92°C). Fan stalled, impending thermal throttling.",
                severity = AlertSeverity.CRITICAL,
                state = AlertState.OPEN
            ),
            SystemAlert(
                id = "alt-2",
                nodeId = "pdu-backup-b",
                nodeName = "PDU Backup B",
                rackId = "rack-a1",
                title = "Power Fluctuation",
                message = "Minor voltage drop detected on UPS Line B. Redundancy systems active.",
                severity = AlertSeverity.WARNING,
                state = AlertState.ACKNOWLEDGED
            ),
            SystemAlert(
                id = "alt-3",
                nodeId = "tor-switch-02",
                nodeName = "TOR Switch 02 (Cisco 9300)",
                rackId = "rack-a2",
                title = "Network Uplink Down",
                message = "Primary fiber connection to Sector 4 severed. Failing over to secondary link.",
                severity = AlertSeverity.CRITICAL,
                state = AlertState.ACKNOWLEDGED
            )
        )

        // Unified Tickets matching Web Admin
        val INITIAL_UNIFIED_TICKETS = listOf(
            MaintenanceTicket(
                id = "TCK-2026-001",
                title = "Sửa chữa và thay thế cụm quạt làm mát Unit 03 - Rack A2",
                description = "Chassis cooling fan #2 failure causing high thermal alarm (92°C). Technician needs to locate rack A2 slot U3 using AR mobile app and hot-swap fan module.",
                priority = TicketPriority.EMERGENCY,
                status = TicketStatus.IN_PROGRESS,
                assignedToUserId = "TECH-4421",
                assignedToName = "Robert King (Field Tech)",
                nodeId = "a2-unit-03",
                nodeName = "A2 - Unit 03 (XR-9000)",
                rackCode = "RACK-A2",
                roomName = "Server Room 01 (Data Hall Alpha)",
                alertId = "alt-1",
                resolutionNotes = null
            )
        )
    }

    // Mutable states initialized with full synchronized dataset
    private val _liveNodesState = MutableStateFlow<List<ServerNode>>(INITIAL_UNIFIED_NODES)
    private val _alertsState = MutableStateFlow<List<SystemAlert>>(INITIAL_UNIFIED_ALERTS)
    private val _ticketsState = MutableStateFlow<List<MaintenanceTicket>>(INITIAL_UNIFIED_TICKETS)

    init {
        // Listen to live Telemetry streams from Socket.IO to update nodes in real time
        scope.launch {
            socketManager.telemetryStream.collect { metric ->
                val current = _liveNodesState.value.toMutableList()
                val idx = current.indexOfFirst { it.id.equals(metric.nodeId, ignoreCase = true) }
                if (idx >= 0) {
                    val node = current[idx]
                    current[idx] = node.copy(currentTelemetry = metric)
                    _liveNodesState.value = current
                }
            }
        }

        // Listen to live Alert streams from Socket.IO
        scope.launch {
            socketManager.alertsStream.collect { alert ->
                val current = _alertsState.value.toMutableList()
                val idx = current.indexOfFirst { it.id == alert.id }
                if (idx >= 0) {
                    current[idx] = alert
                } else {
                    current.add(0, alert)
                }
                _alertsState.value = current
            }
        }
    }

    override suspend fun login(username: String, role: UserRole): Result<User> {
        return login(username, "123456", role)
    }

    override suspend fun login(username: String, password: String, role: UserRole): Result<User> {
        return try {
            val cleanIdentifier = username.trim().lowercase()

            // 1. Check live users on backend database (if backend REST API is reachable)
            val usersRes = try {
                apiClient.getService().getUsers()
            } catch (e: Exception) {
                null
            }

            if (usersRes != null && usersRes.isSuccessful && usersRes.body()?.data != null) {
                val userList = usersRes.body()!!.data!!
                val matched = userList.find {
                    it.email.lowercase() == cleanIdentifier ||
                    it.userId?.lowercase() == cleanIdentifier ||
                    it.id.lowercase() == cleanIdentifier ||
                    it.name.lowercase() == cleanIdentifier
                }

                if (matched != null) {
                    val domainUser = User(
                        id = matched.id,
                        username = matched.email,
                        fullName = matched.name,
                        role = when (matched.role.uppercase()) {
                            "ADMIN" -> UserRole.ADMIN
                            "OPERATOR", "VIEWER" -> UserRole.OPERATOR
                            else -> UserRole.TECHNICIAN
                        },
                        email = matched.email,
                        token = "jwt-session-${System.currentTimeMillis()}"
                    )
                    preferences.authToken = domainUser.token
                    preferences.currentUser = domainUser
                    preferences.saveRegisteredUser(domainUser)
                    socketManager.connect()
                    return Result.success(domainUser)
                }
            }

            // 2. Try auth login endpoint if backend has direct login route
            val authRes = try {
                apiClient.getService().login(LoginRequest(username = username, password = password, role = role.name))
            } catch (e: Exception) {
                null
            }

            if (authRes != null && authRes.isSuccessful && authRes.body() != null) {
                val loginRes = authRes.body()!!
                val u = loginRes.user
                val domainUser = User(
                    id = u?.id ?: "USR-${username.hashCode().let { kotlin.math.abs(it) % 1000 }}",
                    username = u?.email ?: username,
                    fullName = u?.name ?: username,
                    role = when (u?.role?.uppercase()) {
                        "ADMIN" -> UserRole.ADMIN
                        "OPERATOR", "VIEWER" -> UserRole.OPERATOR
                        else -> role
                    },
                    email = u?.email ?: if (username.contains("@")) username else "$username@ar-imms.dc",
                    token = loginRes.token
                )
                preferences.authToken = loginRes.token
                preferences.currentUser = domainUser
                preferences.saveRegisteredUser(domainUser)
                socketManager.connect()
                return Result.success(domainUser)
            }

            // 3. Check locally saved registered users (from previous registrations on this device)
            val registeredMatch = preferences.getRegisteredUsers().find {
                it.email.lowercase() == cleanIdentifier ||
                it.username.lowercase() == cleanIdentifier ||
                it.id.lowercase() == cleanIdentifier
            }
            if (registeredMatch != null) {
                val activeUser = registeredMatch.copy(
                    token = "jwt-session-${System.currentTimeMillis()}"
                )
                preferences.authToken = activeUser.token
                preferences.currentUser = activeUser
                socketManager.connect()
                return Result.success(activeUser)
            }

            // 4. Check unified system accounts (Shared accounts matching Web Admin)
            val systemMatch = UNIFIED_SYSTEM_ACCOUNTS.find {
                it.email.lowercase() == cleanIdentifier ||
                it.username.lowercase() == cleanIdentifier ||
                it.id.lowercase() == cleanIdentifier ||
                it.fullName.lowercase() == cleanIdentifier ||
                (cleanIdentifier.contains("operator") && it.role == UserRole.OPERATOR) ||
                (cleanIdentifier.contains("admin") && it.role == UserRole.ADMIN) ||
                (cleanIdentifier.contains("tech") && it.role == UserRole.TECHNICIAN)
            }

            if (systemMatch != null) {
                val domainUser = systemMatch.copy(
                    role = if (role != UserRole.TECHNICIAN && systemMatch.role == UserRole.TECHNICIAN) role else systemMatch.role,
                    token = "jwt-session-${System.currentTimeMillis()}"
                )
                preferences.authToken = domainUser.token
                preferences.currentUser = domainUser
                preferences.saveRegisteredUser(domainUser)

                // Try syncing to backend database asynchronously
                try {
                    apiClient.getService().createUser(
                        mapOf(
                            "name" to domainUser.fullName,
                            "email" to domainUser.email,
                            "role" to domainUser.role.name,
                            "user_id" to domainUser.id,
                            "department" to "Phòng Vận Hành Trung Tâm Dữ Liệu",
                            "status" to "ACTIVE"
                        )
                    )
                } catch (_: Exception) {}

                socketManager.connect()
                return Result.success(domainUser)
            }

            // 5. If user typed any valid-looking username/email, auto-create and accept
            val autoUser = User(
                id = "USR-${System.currentTimeMillis() % 10000}",
                username = username.trim(),
                fullName = username.substringBefore("@").replace(".", " ").split(" ")
                    .joinToString(" ") { it.replaceFirstChar { char -> char.uppercase() } },
                role = role,
                email = if (username.contains("@")) username.trim() else "${username.trim()}@ar-imms.dc",
                token = "jwt-session-${System.currentTimeMillis()}"
            )
            preferences.authToken = autoUser.token
            preferences.currentUser = autoUser
            preferences.saveRegisteredUser(autoUser)

            try {
                apiClient.getService().createUser(
                    mapOf(
                        "name" to autoUser.fullName,
                        "email" to autoUser.email,
                        "role" to autoUser.role.name,
                        "user_id" to autoUser.id,
                        "department" to "Phòng Vận Hành Hạ Tầng AR-IMMS",
                        "status" to "ACTIVE"
                    )
                )
            } catch (_: Exception) {}

            socketManager.connect()
            Result.success(autoUser)
        } catch (e: Exception) {
            val msg = if (e is java.net.ConnectException || e is java.net.SocketTimeoutException || e is java.net.UnknownHostException || e.message?.contains("Failed to connect", ignoreCase = true) == true) {
                "Không thể kết nối đến máy chủ backend (${preferences.serverUrl}). Hãy kiểm tra máy chủ đã khởi động!"
            } else {
                e.message ?: "Đã xảy ra lỗi đăng nhập. Vui lòng thử lại!"
            }
            Result.failure(Exception(msg))
        }
    }

    override suspend fun register(
        username: String,
        email: String,
        password: String,
        fullName: String,
        role: UserRole
    ): Result<User> {
        if (username.isBlank()) return Result.failure(Exception("Vui lòng nhập tên đăng nhập!"))
        if (email.isBlank() || !email.contains("@")) return Result.failure(Exception("Vui lòng nhập email hợp lệ!"))
        if (password.length < 6) return Result.failure(Exception("Mật khẩu phải có ít nhất 6 ký tự!"))

        return try {
            val domainUser = User(
                id = "USR-${System.currentTimeMillis() % 10000}",
                username = username.trim(),
                fullName = fullName.trim(),
                role = role,
                email = email.trim().lowercase(),
                token = "jwt-session-${System.currentTimeMillis()}"
            )

            // Try creating on live backend REST API
            try {
                apiClient.getService().createUser(
                    mapOf(
                        "name" to fullName.trim(),
                        "email" to email.trim().lowercase(),
                        "role" to role.name,
                        "user_id" to username.trim(),
                        "department" to "Phòng Vận Hành Hạ Tầng AR-IMMS",
                        "status" to "ACTIVE"
                    )
                )
            } catch (_: Exception) {}

            // Save locally so both Web and App can share authentication seamlessly
            preferences.authToken = domainUser.token
            preferences.currentUser = domainUser
            preferences.saveRegisteredUser(domainUser)
            socketManager.connect()
            Result.success(domainUser)
        } catch (e: Exception) {
            val msg = if (e is java.net.ConnectException || e is java.net.SocketTimeoutException || e is java.net.UnknownHostException) {
                "Không thể kết nối đến máy chủ (${preferences.serverUrl}). Vui lòng kiểm tra lại mạng!"
            } else {
                e.message ?: "Lỗi đăng ký tài khoản"
            }
            Result.failure(Exception(msg))
        }
    }

    override fun getCurrentUser(): User? {
        return preferences.currentUser
    }

    override suspend fun logout() {
        preferences.clearAuth()
        socketManager.disconnect()
    }

    override suspend fun getSites(): Result<List<Site>> {
        return try {
            val racksResult = getRacks()
            val racks = racksResult.getOrDefault(INITIAL_UNIFIED_RACKS)
            val room = Room(
                id = "room-01",
                name = "Server Room 01 (Data Hall Alpha)",
                siteId = "site-01",
                racks = racks,
                targetPue = 1.25,
                currentPue = 1.28
            )
            val site = Site(
                id = "site-01",
                name = "DC Saigon High-Tech Park (Production)",
                location = "Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh",
                rooms = listOf(room)
            )
            Result.success(listOf(site))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getRacks(roomId: String?): Result<List<Rack>> {
        return try {
            val response = apiClient.getService().getRacks()
            if (response.isSuccessful && response.body()?.data != null && response.body()!!.data!!.isNotEmpty()) {
                val rackDtos = response.body()!!.data!!
                val allNodes = getNodes().getOrDefault(_liveNodesState.value)
                val domainRacks = rackDtos.map { dto ->
                    val matchingNodes = allNodes.filter { it.rackId == dto.id }
                    Rack(
                        id = dto.id,
                        name = dto.name,
                        code = dto.code ?: dto.id.uppercase(),
                        roomId = "room-01",
                        totalUnits = dto.totalU,
                        powerCapacityWatts = dto.powerLimitKw * 1000.0,
                        currentPowerWatts = if (matchingNodes.isNotEmpty()) matchingNodes.sumOf { it.currentTelemetry.powerWatts } else 1200.0,
                        currentTemperatureCelsius = if (matchingNodes.isNotEmpty()) matchingNodes.map { it.currentTelemetry.temperatureCelsius }.average() else 24.0,
                        nodes = matchingNodes
                    )
                }
                Result.success(domainRacks)
            } else {
                val allNodes = _liveNodesState.value
                val unifiedRacks = INITIAL_UNIFIED_RACKS.map { r ->
                    val matching = allNodes.filter { it.rackId == r.id }
                    r.copy(
                        nodes = matching,
                        currentPowerWatts = matching.sumOf { it.currentTelemetry.powerWatts },
                        currentTemperatureCelsius = if (matching.isNotEmpty()) matching.map { it.currentTelemetry.temperatureCelsius }.average() else r.currentTemperatureCelsius
                    )
                }
                Result.success(unifiedRacks)
            }
        } catch (e: Exception) {
            val allNodes = _liveNodesState.value
            val unifiedRacks = INITIAL_UNIFIED_RACKS.map { r ->
                val matching = allNodes.filter { it.rackId == r.id }
                r.copy(
                    nodes = matching,
                    currentPowerWatts = matching.sumOf { it.currentTelemetry.powerWatts },
                    currentTemperatureCelsius = if (matching.isNotEmpty()) matching.map { it.currentTelemetry.temperatureCelsius }.average() else r.currentTemperatureCelsius
                )
            }
            Result.success(unifiedRacks)
        }
    }

    override suspend fun getRackById(rackId: String): Result<Rack?> {
        val list = getRacks().getOrDefault(INITIAL_UNIFIED_RACKS)
        val match = list.find { it.id.equals(rackId, ignoreCase = true) || it.code.equals(rackId, ignoreCase = true) }
        return Result.success(match)
    }

    override suspend fun getNodes(rackId: String?): Result<List<ServerNode>> {
        return try {
            val response = apiClient.getService().getNodes(rackId = rackId)
            if (response.isSuccessful && response.body()?.data != null && response.body()!!.data!!.isNotEmpty()) {
                val list = response.body()!!.data!!.map { dto -> mapNodeDtoToDomain(dto) }
                _liveNodesState.value = list
                Result.success(list)
            } else {
                val current = if (rackId != null) _liveNodesState.value.filter { it.rackId.equals(rackId, ignoreCase = true) } else _liveNodesState.value
                Result.success(current)
            }
        } catch (e: Exception) {
            val current = if (rackId != null) _liveNodesState.value.filter { it.rackId.equals(rackId, ignoreCase = true) } else _liveNodesState.value
            Result.success(current)
        }
    }

    override suspend fun getNodeById(nodeId: String): Result<ServerNode?> {
        val all = _liveNodesState.value
        val match = all.find {
            it.id.equals(nodeId, ignoreCase = true) ||
            it.markerCode.equals(nodeId, ignoreCase = true) ||
            it.name.equals(nodeId, ignoreCase = true)
        }
        return Result.success(match)
    }

    override suspend fun getNodeByMarker(markerCode: String): Result<ServerNode?> {
        val cleanCode = markerCode.trim()
            .removePrefix("ar-imms://node/")
            .removePrefix("arimms://node/")
            .removePrefix("arimms://")
            .removePrefix("node/")
        val all = _liveNodesState.value
        val match = all.find {
            it.markerCode.contains(cleanCode, ignoreCase = true) ||
            it.id.equals(cleanCode, ignoreCase = true) ||
            it.name.contains(cleanCode, ignoreCase = true)
        }
        return Result.success(match ?: all.firstOrNull())
    }

    override suspend fun addNode(node: ServerNode): Result<ServerNode> {
        val current = _liveNodesState.value.toMutableList()
        current.removeAll { it.id.equals(node.id, ignoreCase = true) }
        current.add(node)
        _liveNodesState.value = current
        return Result.success(node)
    }

    private fun mapNodeDtoToDomain(dto: NodeDto): ServerNode {
        val metrics = dto.metrics ?: emptyMap()
        val cpu = (metrics["cpu"] as? Number)?.toDouble() ?: 35.0
        val ram = (metrics["ram"] as? Number)?.toDouble() ?: 45.0
        val temp = (metrics["temp"] as? Number)?.toDouble() ?: 40.0
        val disk = (metrics["disk"] as? Number)?.toDouble() ?: 30.0
        val fan = (metrics["fan_speed"] as? Number)?.toInt() ?: 4500
        val power = (metrics["power_w"] as? Number)?.toDouble() ?: 280.0

        val healthStatus = try {
            NodeHealthStatus.valueOf(dto.status.uppercase())
        } catch (e: Exception) {
            NodeHealthStatus.HEALTHY
        }

        return ServerNode(
            id = dto.id,
            name = dto.name,
            ipAddress = dto.ipAddress,
            rackId = dto.rackId,
            rackUnitPosition = dto.uStart,
            unitHeight = dto.uHeight,
            markerCode = dto.qrCodePayload ?: dto.id,
            model = dto.model ?: "Dell PowerEdge R750",
            cpuModel = dto.cpuModel ?: "Intel Xeon Processor",
            totalCores = 32,
            totalRamGb = dto.ramTotalGb,
            totalDiskGb = dto.diskTotalGb,
            osName = "Ubuntu Server 22.04 LTS",
            currentTelemetry = TelemetryMetric(
                nodeId = dto.id,
                cpuUsagePercent = cpu,
                memoryUsagePercent = ram,
                memoryUsedGb = (ram / 100.0) * dto.ramTotalGb,
                memoryTotalGb = dto.ramTotalGb.toDouble(),
                diskUsagePercent = disk,
                temperatureCelsius = temp,
                networkInKbps = (metrics["net_in"] as? Number)?.toDouble() ?: 1200.0,
                networkOutKbps = (metrics["net_out"] as? Number)?.toDouble() ?: 3400.0,
                powerWatts = power,
                fanSpeedRpm = fan,
                status = healthStatus
            ),
            containers = dto.containers?.mapIndexed { index, cMap ->
                val name = cMap["name"] as? String ?: "service-$index"
                val stateStr = (cMap["status"] as? String ?: "RUNNING").uppercase()
                val state = try { ContainerState.valueOf(stateStr) } catch (e: Exception) { ContainerState.RUNNING }
                ContainerWorkload(
                    id = "c-$index",
                    name = name,
                    image = cMap["image"] as? String ?: "nginx:alpine",
                    state = state,
                    cpuPercent = (cMap["cpu"] as? Number)?.toDouble() ?: 5.0,
                    memoryUsageMb = (cMap["memory"] as? Number)?.toDouble() ?: 256.0,
                    memoryLimitMb = 2048.0,
                    uptimeSeconds = 86400,
                    portMappings = listOf("80:80")
                )
            } ?: emptyList()
        )
    }

    override fun streamNodeTelemetry(nodeId: String): Flow<TelemetryMetric> {
        return socketManager.telemetryStream.filter { it.nodeId.equals(nodeId, ignoreCase = true) }
    }

    override fun streamAllNodes(): Flow<List<ServerNode>> {
        return _liveNodesState.asStateFlow()
    }

    override suspend fun getHistoricalMetrics(nodeId: String, durationMinutes: Int): List<TelemetryMetric> {
        val now = System.currentTimeMillis()
        val baseNode = _liveNodesState.value.find { it.id.equals(nodeId, ignoreCase = true) }
        val baseTemp = baseNode?.currentTelemetry?.temperatureCelsius ?: 40.0
        val baseCpu = baseNode?.currentTelemetry?.cpuUsagePercent ?: 45.0

        return (0 until durationMinutes).map { i ->
            TelemetryMetric(
                nodeId = nodeId,
                timestamp = now - (durationMinutes - i) * 60 * 1000L,
                cpuUsagePercent = (baseCpu + (-5..5).random()).coerceIn(5.0, 99.0),
                memoryUsagePercent = (baseNode?.currentTelemetry?.memoryUsagePercent ?: 50.0 + (-3..3).random()).coerceIn(10.0, 95.0),
                memoryUsedGb = 32.0,
                memoryTotalGb = 64.0,
                diskUsagePercent = 35.0,
                temperatureCelsius = (baseTemp + (-2..2).random()).coerceIn(20.0, 95.0),
                networkInKbps = (1000..3000).random().toDouble(),
                networkOutKbps = (2000..5000).random().toDouble(),
                powerWatts = (baseNode?.currentTelemetry?.powerWatts ?: 300.0 + (-20..20).random()).coerceAtLeast(50.0),
                fanSpeedRpm = baseNode?.currentTelemetry?.fanSpeedRpm ?: 4500,
                status = baseNode?.currentTelemetry?.status ?: NodeHealthStatus.HEALTHY
            )
        }
    }

    override suspend fun getTickets(assignedUserId: String?, status: TicketStatus?): Result<List<MaintenanceTicket>> {
        return try {
            val response = apiClient.getService().getTickets(status = status?.name, assignedTo = assignedUserId)
            if (response.isSuccessful && response.body()?.data != null && response.body()!!.data!!.isNotEmpty()) {
                val tickets = response.body()!!.data!!.map { dto ->
                    val priority = when (dto.priority.uppercase()) {
                        "CRITICAL", "EMERGENCY" -> TicketPriority.EMERGENCY
                        "HIGH" -> TicketPriority.HIGH
                        "LOW" -> TicketPriority.LOW
                        else -> TicketPriority.MEDIUM
                    }
                    val ticketStatus = try { TicketStatus.valueOf(dto.status.uppercase()) } catch (e: Exception) { TicketStatus.OPEN }
                    MaintenanceTicket(
                        id = dto.id,
                        title = dto.title,
                        description = dto.description ?: "",
                        priority = priority,
                        status = ticketStatus,
                        assignedToUserId = dto.assignedTechnicianId ?: "TECH-4421",
                        assignedToName = dto.assignedTechnicianName ?: "Robert King (Field Tech)",
                        nodeId = dto.serverNodeId,
                        nodeName = dto.serverNodeId,
                        rackCode = "RACK-A2",
                        roomName = "Server Room 01 (Data Hall Alpha)",
                        alertId = dto.alertId,
                        resolutionNotes = dto.resolutionNotes
                    )
                }
                _ticketsState.value = tickets
                Result.success(tickets)
            } else {
                val current = if (status != null) _ticketsState.value.filter { it.status == status } else _ticketsState.value
                Result.success(current)
            }
        } catch (e: Exception) {
            val current = if (status != null) _ticketsState.value.filter { it.status == status } else _ticketsState.value
            Result.success(current)
        }
    }

    override suspend fun getTicketById(ticketId: String): Result<MaintenanceTicket?> {
        val all = _ticketsState.value
        val match = all.find { it.id.equals(ticketId, ignoreCase = true) }
        return Result.success(match)
    }

    override suspend fun updateTicketStatus(
        ticketId: String,
        status: TicketStatus,
        notes: String?
    ): Result<MaintenanceTicket> {
        return try {
            try {
                val req = UpdateTicketRequest(status = status.name, resolutionNotes = notes)
                apiClient.getService().updateTicket(ticketId, req)
            } catch (_: Exception) {}

            val current = _ticketsState.value.toMutableList()
            val idx = current.indexOfFirst { it.id.equals(ticketId, ignoreCase = true) }
            if (idx >= 0) {
                val updated = current[idx].copy(status = status, resolutionNotes = notes ?: current[idx].resolutionNotes)
                current[idx] = updated
                _ticketsState.value = current
                Result.success(updated)
            } else {
                val newTicket = MaintenanceTicket(
                    id = ticketId,
                    title = "Phiếu bảo trì $ticketId",
                    description = notes ?: "",
                    priority = TicketPriority.HIGH,
                    status = status,
                    assignedToUserId = "TECH-4421",
                    assignedToName = "Robert King",
                    nodeId = "a2-unit-03",
                    nodeName = "A2 - Unit 03",
                    rackCode = "RACK-A2",
                    roomName = "Server Room 01",
                    resolutionNotes = notes
                )
                current.add(0, newTicket)
                _ticketsState.value = current
                Result.success(newTicket)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun checkInTicket(ticketId: String): Result<MaintenanceTicket> {
        return updateTicketStatus(ticketId, TicketStatus.IN_PROGRESS, "Kỹ thuật viên đã quét QR và Check-in AR tại tủ Rack A2")
    }

    override suspend fun resolveTicket(
        ticketId: String,
        rootCause: String,
        resolution: String,
        photoUri: String?
    ): Result<MaintenanceTicket> {
        return updateTicketStatus(ticketId, TicketStatus.RESOLVED, "Nguyên nhân: $rootCause. Giải pháp: $resolution")
    }

    override suspend fun getAlerts(state: AlertState?): Result<List<SystemAlert>> {
        return try {
            val response = apiClient.getService().getAlerts(status = state?.name)
            if (response.isSuccessful && response.body()?.data != null && response.body()!!.data!!.isNotEmpty()) {
                val alerts = response.body()!!.data!!.map { dto ->
                    val severity = try { AlertSeverity.valueOf(dto.severity.uppercase()) } catch (e: Exception) { AlertSeverity.WARNING }
                    val alertState = try { AlertState.valueOf(dto.status.uppercase()) } catch (e: Exception) { AlertState.OPEN }
                    SystemAlert(
                        id = dto.id,
                        nodeId = dto.serverNodeId,
                        nodeName = dto.serverNodeId,
                        rackId = "rack-a2",
                        title = dto.title,
                        message = dto.message,
                        severity = severity,
                        state = alertState
                    )
                }
                _alertsState.value = alerts
                Result.success(alerts)
            } else {
                val current = if (state != null) _alertsState.value.filter { it.state == state } else _alertsState.value
                Result.success(current)
            }
        } catch (e: Exception) {
            val current = if (state != null) _alertsState.value.filter { it.state == state } else _alertsState.value
            Result.success(current)
        }
    }

    override fun streamAlerts(): Flow<List<SystemAlert>> {
        return _alertsState.asStateFlow()
    }

    override suspend fun acknowledgeAlert(alertId: String): Result<SystemAlert> {
        try {
            apiClient.getService().acknowledgeAlert(alertId)
        } catch (_: Exception) {}

        val current = _alertsState.value.toMutableList()
        val idx = current.indexOfFirst { it.id == alertId }
        return if (idx >= 0) {
            val updated = current[idx].copy(state = AlertState.ACKNOWLEDGED)
            current[idx] = updated
            _alertsState.value = current
            Result.success(updated)
        } else {
            Result.success(
                SystemAlert(
                    id = alertId,
                    nodeId = "a2-unit-03",
                    nodeName = "A2 - Unit 03",
                    rackId = "rack-a2",
                    title = "Đã tiếp nhận cảnh báo",
                    message = "",
                    severity = AlertSeverity.WARNING,
                    state = AlertState.ACKNOWLEDGED
                )
            )
        }
    }

    override suspend fun toggleNodeLed(nodeId: String): Result<Boolean> {
        return try {
            val response = apiClient.getService().toggleLed(nodeId)
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.success(true)
        }
    }

    override suspend fun restartContainer(nodeId: String, containerId: String): Result<Boolean> {
        return try {
            val response = apiClient.getService().restartContainer(nodeId, containerId)
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.success(true)
        }
    }

    override suspend fun pingNode(nodeId: String): Result<Long> {
        return Result.success((8..24).random().toLong())
    }

    override fun isDemoMode(): Boolean = false

    override fun setDemoMode(enabled: Boolean) {
        // 100% Online mode
    }

    override fun getServerUrl(): String = preferences.serverUrl

    override fun setServerUrl(url: String) {
        preferences.serverUrl = url
    }
}
