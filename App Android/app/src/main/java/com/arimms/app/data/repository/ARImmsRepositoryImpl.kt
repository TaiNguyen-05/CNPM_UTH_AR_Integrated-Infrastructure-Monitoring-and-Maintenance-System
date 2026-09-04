package com.arimms.app.data.repository

import com.arimms.app.data.api.*
import com.arimms.app.data.local.AppPreferences
import com.arimms.app.data.mock.MockDataGenerator
import com.arimms.app.data.mock.TelemetrySimulator
import com.arimms.app.domain.model.*
import com.arimms.app.domain.repository.ARImmsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter

class ARImmsRepositoryImpl(
    private val preferences: AppPreferences,
    private val apiClient: ApiClient,
    private val socketManager: SocketManager,
    private val simulator: TelemetrySimulator
) : ARImmsRepository {

    override suspend fun login(username: String, role: UserRole): Result<User> {
        return if (preferences.isDemoMode) {
            val user = MockDataGenerator.getDefaultUser(role).copy(username = username)
            preferences.currentUser = user
            preferences.authToken = user.token
            Result.success(user)
        } else {
            try {
                val response = apiClient.getService().login(LoginRequest(username = username, password = "password", role = role.name))
                if (response.isSuccessful && response.body() != null) {
                    val loginRes = response.body()!!
                    val u = loginRes.user
                    val domainUser = User(
                        id = u.id,
                        username = u.email,
                        fullName = u.name,
                        role = when (u.role.uppercase()) {
                            "ADMIN" -> UserRole.ADMIN
                            "OPERATOR" -> UserRole.OPERATOR
                            else -> UserRole.TECHNICIAN
                        },
                        email = u.email,
                        token = loginRes.token
                    )
                    preferences.authToken = loginRes.token
                    preferences.currentUser = domainUser
                    socketManager.connect()
                    Result.success(domainUser)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Đăng nhập thất bại"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
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
        return if (preferences.isDemoMode) {
            val racks = simulator.nodesState.value.let { MockDataGenerator.createInitialRacks(it) }
            Result.success(MockDataGenerator.createInitialSites(racks))
        } else {
            val racksResult = getRacks()
            if (racksResult.isSuccess) {
                val racks = racksResult.getOrDefault(emptyList())
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
                    name = "DC Saigon High-Tech Park (Testbed)",
                    location = "Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh",
                    rooms = listOf(room)
                )
                Result.success(listOf(site))
            } else {
                Result.failure(racksResult.exceptionOrNull() ?: Exception("Lỗi tải danh sách site"))
            }
        }
    }

    override suspend fun getRacks(roomId: String?): Result<List<Rack>> {
        return if (preferences.isDemoMode) {
            val racks = MockDataGenerator.createInitialRacks(simulator.nodesState.value)
            Result.success(racks)
        } else {
            try {
                val response = apiClient.getService().getRacks()
                if (response.isSuccessful && response.body()?.data != null) {
                    val rackDtos = response.body()!!.data!!
                    val allNodes = getNodes().getOrDefault(emptyList())
                    val domainRacks = rackDtos.map { dto ->
                        val matchingNodes = allNodes.filter { it.rackId == dto.id }
                        Rack(
                            id = dto.id,
                            name = dto.name,
                            code = dto.code ?: dto.id.uppercase(),
                            roomId = "room-01",
                            totalUnits = dto.totalU,
                            powerCapacityWatts = dto.powerLimitKw * 1000.0,
                            currentPowerWatts = matchingNodes.sumOf { it.currentTelemetry.powerWatts },
                            currentTemperatureCelsius = if (matchingNodes.isNotEmpty()) matchingNodes.map { it.currentTelemetry.temperatureCelsius }.average() else 24.0,
                            nodes = matchingNodes
                        )
                    }
                    Result.success(domainRacks)
                } else {
                    Result.failure(Exception("Lỗi tải danh sách rack: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun getRackById(rackId: String): Result<Rack?> {
        return if (preferences.isDemoMode) {
            val racks = MockDataGenerator.createInitialRacks(simulator.nodesState.value)
            Result.success(racks.find { it.id == rackId })
        } else {
            try {
                val response = apiClient.getService().getRackById(rackId)
                if (response.isSuccessful && response.body()?.data != null) {
                    val dto = response.body()!!.data!!
                    val matchingNodes = getNodes(dto.id).getOrDefault(emptyList())
                    val rack = Rack(
                        id = dto.id,
                        name = dto.name,
                        code = dto.code ?: dto.id.uppercase(),
                        roomId = "room-01",
                        totalUnits = dto.totalU,
                        powerCapacityWatts = dto.powerLimitKw * 1000.0,
                        currentPowerWatts = matchingNodes.sumOf { it.currentTelemetry.powerWatts },
                        currentTemperatureCelsius = 24.0,
                        nodes = matchingNodes
                    )
                    Result.success(rack)
                } else {
                    Result.failure(Exception("Rack not found"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun getNodes(rackId: String?): Result<List<ServerNode>> {
        return if (preferences.isDemoMode) {
            val nodes = simulator.nodesState.value
            val filtered = if (rackId != null) nodes.filter { it.rackId == rackId } else nodes
            Result.success(filtered)
        } else {
            try {
                val response = apiClient.getService().getNodes(rackId = rackId)
                if (response.isSuccessful && response.body()?.data != null) {
                    val list = response.body()!!.data!!.map { dto -> mapNodeDtoToDomain(dto) }
                    Result.success(list)
                } else {
                    Result.failure(Exception("Lỗi tải nodes: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun getNodeById(nodeId: String): Result<ServerNode?> {
        return if (preferences.isDemoMode) {
            val node = simulator.nodesState.value.find { it.id.equals(nodeId, ignoreCase = true) }
            Result.success(node)
        } else {
            try {
                val response = apiClient.getService().getNodeById(nodeId)
                if (response.isSuccessful && response.body()?.data != null) {
                    Result.success(mapNodeDtoToDomain(response.body()!!.data!!))
                } else {
                    Result.failure(Exception("Node not found"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun getNodeByMarker(markerCode: String): Result<ServerNode?> {
        val cleanCode = markerCode.trim().removePrefix("ar-imms://node/").removePrefix("arimms://node/").removePrefix("arimms://")
        return if (preferences.isDemoMode) {
            val node = simulator.nodesState.value.find {
                it.markerCode.equals(cleanCode, ignoreCase = true) ||
                it.id.equals(cleanCode, ignoreCase = true) ||
                it.name.contains(cleanCode, ignoreCase = true)
            }
            Result.success(node)
        } else {
            try {
                val response = apiClient.getService().getNodes(qr = markerCode)
                if (response.isSuccessful && response.body()?.data != null && response.body()!!.data!!.isNotEmpty()) {
                    Result.success(mapNodeDtoToDomain(response.body()!!.data!!.first()))
                } else {
                    getNodeById(cleanCode)
                }
            } catch (e: Exception) {
                getNodeById(cleanCode)
            }
        }
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
        return if (preferences.isDemoMode) {
            simulator.telemetryStream.filter { it.nodeId.equals(nodeId, ignoreCase = true) }
        } else {
            socketManager.telemetryStream.filter { it.nodeId.equals(nodeId, ignoreCase = true) }
        }
    }

    override fun streamAllNodes(): Flow<List<ServerNode>> {
        return simulator.nodesState
    }

    override suspend fun getHistoricalMetrics(nodeId: String, durationMinutes: Int): List<TelemetryMetric> {
        return simulator.getHistoricalMetrics(nodeId)
    }

    override suspend fun getTickets(assignedUserId: String?, status: TicketStatus?): Result<List<MaintenanceTicket>> {
        return if (preferences.isDemoMode) {
            var list = simulator.ticketsState.value
            if (assignedUserId != null) {
                list = list.filter { it.assignedToUserId == assignedUserId }
            }
            if (status != null) {
                list = list.filter { it.status == status }
            }
            Result.success(list)
        } else {
            try {
                val response = apiClient.getService().getTickets(status = status?.name, assignedTo = assignedUserId)
                if (response.isSuccessful && response.body()?.data != null) {
                    val tickets = response.body()!!.data!!.map { dto ->
                        val priority = try { TicketPriority.valueOf(dto.priority.uppercase()) } catch (e: Exception) { TicketPriority.MEDIUM }
                        val ticketStatus = try { TicketStatus.valueOf(dto.status.uppercase()) } catch (e: Exception) { TicketStatus.OPEN }
                        MaintenanceTicket(
                            id = dto.id,
                            title = dto.title,
                            description = dto.description ?: "",
                            priority = priority,
                            status = ticketStatus,
                            assignedToUserId = dto.assignedTechnicianId ?: "USR-001",
                            assignedToName = dto.assignedTechnicianName ?: "System Administrator",
                            nodeId = dto.serverNodeId,
                            nodeName = dto.serverNodeId,
                            rackCode = "RACK-A1",
                            roomName = "Server Room 01",
                            alertId = dto.alertId,
                            resolutionNotes = dto.resolutionNotes
                        )
                    }
                    Result.success(tickets)
                } else {
                    Result.failure(Exception("Lỗi tải tickets"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun getTicketById(ticketId: String): Result<MaintenanceTicket?> {
        return if (preferences.isDemoMode) {
            Result.success(simulator.ticketsState.value.find { it.id == ticketId })
        } else {
            try {
                val response = apiClient.getService().getTicketById(ticketId)
                if (response.isSuccessful && response.body()?.data != null) {
                    val dto = response.body()!!.data!!
                    val priority = try { TicketPriority.valueOf(dto.priority.uppercase()) } catch (e: Exception) { TicketPriority.MEDIUM }
                    val ticketStatus = try { TicketStatus.valueOf(dto.status.uppercase()) } catch (e: Exception) { TicketStatus.OPEN }
                    Result.success(
                        MaintenanceTicket(
                            id = dto.id,
                            title = dto.title,
                            description = dto.description ?: "",
                            priority = priority,
                            status = ticketStatus,
                            assignedToUserId = dto.assignedTechnicianId ?: "USR-001",
                            assignedToName = dto.assignedTechnicianName ?: "System Administrator",
                            nodeId = dto.serverNodeId,
                            nodeName = dto.serverNodeId,
                            rackCode = "RACK-A1",
                            roomName = "Server Room 01",
                            alertId = dto.alertId,
                            resolutionNotes = dto.resolutionNotes
                        )
                    )
                } else {
                    Result.failure(Exception("Ticket not found"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun updateTicketStatus(
        ticketId: String,
        status: TicketStatus,
        notes: String?
    ): Result<MaintenanceTicket> {
        return if (preferences.isDemoMode) {
            val updated = simulator.updateTicketStatus(ticketId, status, notes)
            if (updated != null) Result.success(updated) else Result.failure(Exception("Ticket not found"))
        } else {
            try {
                val req = UpdateTicketRequest(status = status.name, resolutionNotes = notes)
                val response = apiClient.getService().updateTicket(ticketId, req)
                if (response.isSuccessful && response.body()?.data != null) {
                    getTicketById(ticketId).map { it!! }
                } else {
                    Result.failure(Exception("Failed to update ticket"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun checkInTicket(ticketId: String): Result<MaintenanceTicket> {
        return updateTicketStatus(ticketId, TicketStatus.IN_PROGRESS, "Kỹ thuật viên đã Check-in tại tủ rack")
    }

    override suspend fun resolveTicket(
        ticketId: String,
        rootCause: String,
        resolution: String,
        photoUri: String?
    ): Result<MaintenanceTicket> {
        return if (preferences.isDemoMode) {
            val updated = simulator.resolveTicket(ticketId, rootCause, resolution, photoUri)
            if (updated != null) Result.success(updated) else Result.failure(Exception("Ticket not found"))
        } else {
            try {
                val req = UpdateTicketRequest(
                    status = TicketStatus.RESOLVED.name,
                    rootCauseNotes = rootCause,
                    resolutionNotes = resolution
                )
                val response = apiClient.getService().updateTicket(ticketId, req)
                if (response.isSuccessful) {
                    getTicketById(ticketId).map { it!! }
                } else {
                    Result.failure(Exception("Failed to resolve ticket"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun getAlerts(state: AlertState?): Result<List<SystemAlert>> {
        return if (preferences.isDemoMode) {
            val list = simulator.alertsState.value
            val filtered = if (state != null) list.filter { it.state == state } else list
            Result.success(filtered)
        } else {
            try {
                val response = apiClient.getService().getAlerts(status = state?.name)
                if (response.isSuccessful && response.body()?.data != null) {
                    val alerts = response.body()!!.data!!.map { dto ->
                        val severity = try { AlertSeverity.valueOf(dto.severity.uppercase()) } catch (e: Exception) { AlertSeverity.WARNING }
                        val alertState = try { AlertState.valueOf(dto.status.uppercase()) } catch (e: Exception) { AlertState.OPEN }
                        SystemAlert(
                            id = dto.id,
                            nodeId = dto.serverNodeId,
                            nodeName = dto.serverNodeId,
                            rackId = "rack-a1",
                            title = dto.title,
                            message = dto.message,
                            severity = severity,
                            state = alertState
                        )
                    }
                    Result.success(alerts)
                } else {
                    Result.failure(Exception("Lỗi tải alerts"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override fun streamAlerts(): Flow<List<SystemAlert>> {
        return simulator.alertsState
    }

    override suspend fun acknowledgeAlert(alertId: String): Result<SystemAlert> {
        return if (preferences.isDemoMode) {
            val username = preferences.currentUser?.fullName ?: "Technician"
            val ack = simulator.acknowledgeAlert(alertId, username)
            if (ack != null) Result.success(ack) else Result.failure(Exception("Alert not found"))
        } else {
            try {
                val response = apiClient.getService().acknowledgeAlert(alertId)
                if (response.isSuccessful) {
                    Result.success(
                        SystemAlert(
                            id = alertId,
                            nodeId = "SRV-NODE-01",
                            nodeName = "SRV-NODE-01",
                            rackId = "rack-a1",
                            title = "Đã tiếp nhận",
                            message = "",
                            severity = AlertSeverity.WARNING,
                            state = AlertState.ACKNOWLEDGED
                        )
                    )
                } else {
                    Result.failure(Exception("Failed to acknowledge alert"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun toggleNodeLed(nodeId: String): Result<Boolean> {
        return if (preferences.isDemoMode) {
            Result.success(simulator.toggleNodeLed(nodeId))
        } else {
            try {
                val response = apiClient.getService().toggleLed(nodeId)
                Result.success(response.isSuccessful)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun restartContainer(nodeId: String, containerId: String): Result<Boolean> {
        return if (preferences.isDemoMode) {
            Result.success(simulator.restartContainer(nodeId, containerId))
        } else {
            try {
                val response = apiClient.getService().restartContainer(nodeId, containerId)
                Result.success(response.isSuccessful)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    override suspend fun pingNode(nodeId: String): Result<Long> {
        return Result.success((10..35).random().toLong())
    }

    override fun isDemoMode(): Boolean = preferences.isDemoMode

    override fun setDemoMode(enabled: Boolean) {
        preferences.isDemoMode = enabled
        if (!enabled) {
            socketManager.connect()
        } else {
            socketManager.disconnect()
        }
    }

    override fun getServerUrl(): String = preferences.serverUrl

    override fun setServerUrl(url: String) {
        preferences.serverUrl = url
    }
}
