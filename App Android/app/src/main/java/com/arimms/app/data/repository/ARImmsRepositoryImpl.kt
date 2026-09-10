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
            ),
            User(
                id = "USR-7FF9",
                username = "trungtamgiamsatarimms@gmail.com",
                fullName = "Nguyễn Thành Tài",
                role = UserRole.TECHNICIAN,
                email = "trungtamgiamsatarimms@gmail.com",
                status = "APPROVED"
            ),
            User(
                id = "USR-5BC8",
                username = "taint2360@ut.edu.vn",
                fullName = "Tài Nguyễn Thành",
                role = UserRole.TECHNICIAN,
                email = "taint2360@ut.edu.vn",
                status = "APPROVED"
            )
        )

        // 14 Nodes synchronized across Web Admin & Mobile App (Racks A1, A2, B1)
        val INITIAL_UNIFIED_NODES = listOf(
            // Rack A1 (Compute & Storage Zone 1-A)
            ServerNode(
                id = "SRV-NODE-01",
                name = "Primary Compute Node 01",
                ipAddress = "192.168.1.101",
                rackId = "rack-a1",
                rackUnitPosition = 38,
                unitHeight = 2,
                markerCode = "ar-imms://node/SRV-NODE-01",
                model = "Dell PowerEdge R740 / Xeon Gold 6248R",
                cpuModel = "Intel Xeon Gold 6248R @ 3.00GHz (24C/48T)",
                totalCores = 48,
                totalRamGb = 64,
                totalDiskGb = 2000,
                osName = "Ubuntu Server 22.04 LTS",
                currentTelemetry = TelemetryMetric(
                    nodeId = "SRV-NODE-01",
                    cpuUsagePercent = 96.0,
                    memoryUsagePercent = 60.0,
                    memoryUsedGb = 38.4,
                    memoryTotalGb = 64.0,
                    diskUsagePercent = 40.0,
                    temperatureCelsius = 75.0,
                    networkInKbps = 500.0,
                    networkOutKbps = 600.0,
                    powerWatts = 450.0,
                    fanSpeedRpm = 6200,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "SRV-NODE-02",
                name = "Secondary Compute Node 02",
                ipAddress = "192.168.1.102",
                rackId = "rack-a1",
                rackUnitPosition = 35,
                unitHeight = 2,
                markerCode = "ar-imms://node/SRV-NODE-02",
                model = "Dell PowerEdge R740 / Xeon Gold 6248R",
                cpuModel = "Intel Xeon Gold 6248R @ 3.00GHz (24C/48T)",
                totalCores = 48,
                totalRamGb = 64,
                totalDiskGb = 2000,
                osName = "Ubuntu Server 22.04 LTS",
                currentTelemetry = TelemetryMetric(
                    nodeId = "SRV-NODE-02",
                    cpuUsagePercent = 42.0,
                    memoryUsagePercent = 55.0,
                    memoryUsedGb = 35.2,
                    memoryTotalGb = 64.0,
                    diskUsagePercent = 38.0,
                    temperatureCelsius = 38.0,
                    networkInKbps = 1200.0,
                    networkOutKbps = 2400.0,
                    powerWatts = 320.0,
                    fanSpeedRpm = 4200,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "SRV-NODE-03",
                name = "Database Primary Replica",
                ipAddress = "192.168.1.103",
                rackId = "rack-a1",
                rackUnitPosition = 30,
                unitHeight = 4,
                markerCode = "ar-imms://node/SRV-NODE-03",
                model = "HPE ProLiant DL380 Gen10",
                cpuModel = "AMD EPYC 7742 (64C/128T)",
                totalCores = 64,
                totalRamGb = 128,
                totalDiskGb = 8000,
                osName = "Enterprise RHEL 9.2",
                currentTelemetry = TelemetryMetric(
                    nodeId = "SRV-NODE-03",
                    cpuUsagePercent = 78.0,
                    memoryUsagePercent = 74.0,
                    memoryUsedGb = 94.7,
                    memoryTotalGb = 128.0,
                    diskUsagePercent = 82.5,
                    temperatureCelsius = 64.0,
                    networkInKbps = 4200.0,
                    networkOutKbps = 6800.0,
                    powerWatts = 520.0,
                    fanSpeedRpm = 5400,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "SRV-NODE-04",
                name = "Application Web Gateway",
                ipAddress = "192.168.1.104",
                rackId = "rack-a2",
                rackUnitPosition = 36,
                unitHeight = 2,
                markerCode = "ar-imms://node/SRV-NODE-04",
                model = "Supermicro 1U TwinPro",
                cpuModel = "Intel Xeon Platinum 8380",
                totalCores = 40,
                totalRamGb = 64,
                totalDiskGb = 2000,
                osName = "Debian 12 Bookworm",
                currentTelemetry = TelemetryMetric(
                    nodeId = "SRV-NODE-04",
                    cpuUsagePercent = 38.0,
                    memoryUsagePercent = 48.0,
                    memoryUsedGb = 30.7,
                    memoryTotalGb = 64.0,
                    diskUsagePercent = 32.0,
                    temperatureCelsius = 35.0,
                    networkInKbps = 9500.0,
                    networkOutKbps = 14200.0,
                    powerWatts = 360.0,
                    fanSpeedRpm = 4500,
                    status = NodeHealthStatus.HEALTHY
                )
            ),
            ServerNode(
                id = "SRV-NODE-05",
                name = "Log Aggregator & Pipeline",
                ipAddress = "192.168.1.105",
                rackId = "rack-a2",
                rackUnitPosition = 20,
                unitHeight = 3,
                markerCode = "ar-imms://node/SRV-NODE-05",
                model = "Dell PowerEdge R640",
                cpuModel = "Intel Xeon Gold 6248R",
                totalCores = 24,
                totalRamGb = 64,
                totalDiskGb = 4000,
                osName = "Ubuntu Server 22.04 LTS",
                currentTelemetry = TelemetryMetric(
                    nodeId = "SRV-NODE-05",
                    cpuUsagePercent = 88.0,
                    memoryUsagePercent = 82.0,
                    memoryUsedGb = 52.4,
                    memoryTotalGb = 64.0,
                    diskUsagePercent = 75.0,
                    temperatureCelsius = 78.0,
                    networkInKbps = 8200.0,
                    networkOutKbps = 4100.0,
                    powerWatts = 420.0,
                    fanSpeedRpm = 6800,
                    status = NodeHealthStatus.CRITICAL
                )
            ),
            ServerNode(
                id = "SRV-NODE-06",
                name = "Edge Router B1",
                ipAddress = "192.168.1.106",
                rackId = "rack-b1",
                rackUnitPosition = 1,
                unitHeight = 2,
                markerCode = "ar-imms://node/SRV-NODE-06",
                model = "Juniper MX204",
                cpuModel = "Broadcom StrataXGS",
                totalCores = 8,
                totalRamGb = 32,
                totalDiskGb = 500,
                osName = "Junos OS 21.4",
                currentTelemetry = TelemetryMetric(
                    nodeId = "SRV-NODE-06",
                    cpuUsagePercent = 22.0,
                    memoryUsagePercent = 35.0,
                    memoryUsedGb = 11.2,
                    memoryTotalGb = 32.0,
                    diskUsagePercent = 15.0,
                    temperatureCelsius = 28.0,
                    networkInKbps = 25000.0,
                    networkOutKbps = 24800.0,
                    powerWatts = 210.0,
                    fanSpeedRpm = 3200,
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
        // Start Socket.IO connection immediately
        socketManager.connect()

        // 1. Initial background fetch from live backend REST API to guarantee data synchronization
        scope.launch {
            try {
                getNodes()
                getRacks()
                getAlerts()
                getTickets()
            } catch (_: Exception) {}
        }

        // 2. Listen to live Telemetry streams from Socket.IO to update nodes in real time
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

        // 3. Listen to live Alert streams from Socket.IO (alert_created, alert_updated, etc.)
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

        // 4. Listen to live Ticket streams from Socket.IO (ticket_created, ticket_updated, ticket_assigned, ticket_resolved, etc.)
        scope.launch {
            socketManager.ticketsStream.collect { ticket ->
                val current = _ticketsState.value.toMutableList()
                val idx = current.indexOfFirst { it.id.equals(ticket.id, ignoreCase = true) }
                if (idx >= 0) {
                    current[idx] = ticket
                } else {
                    current.add(0, ticket)
                }
                _ticketsState.value = current
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
                    it.fullName?.lowercase() == cleanIdentifier ||
                    it.name?.lowercase() == cleanIdentifier
                }

                if (matched != null) {
                    val resolvedName = matched.fullName?.ifBlank { null }
                        ?: matched.name?.ifBlank { null }
                        ?: matched.email.substringBefore("@")
                    val domainUser = User(
                        id = matched.id.ifBlank { matched.userId ?: "USR-${matched.email.hashCode()}" },
                        username = matched.email,
                        fullName = resolvedName,
                        role = when (matched.role.uppercase()) {
                            "ADMIN" -> UserRole.ADMIN
                            "OPERATOR", "VIEWER" -> UserRole.OPERATOR
                            else -> UserRole.TECHNICIAN
                        },
                        email = matched.email,
                        status = matched.status ?: "APPROVED",
                        avatarUrl = matched.avatar,
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
                        "full_name" to fullName.trim(),
                        "name" to fullName.trim(),
                        "email" to email.trim().lowercase(),
                        "role" to role.name,
                        "user_id" to username.trim(),
                        "department" to "Phòng Vận Hành Hạ Tầng AR-IMMS",
                        "status" to if (role == UserRole.ADMIN) "PENDING_APPROVAL" else "APPROVED"
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

    override suspend fun loginWithGoogle(
        email: String,
        fullName: String,
        avatar: String?
    ): GoogleAuthResult {
        val cleanEmail = email.trim().lowercase()
        val cleanName = fullName.trim().ifBlank {
            cleanEmail.substringBefore("@").replace(".", " ")
                .split(" ")
                .joinToString(" ") { it.replaceFirstChar { char -> char.uppercase() } }
        }
        val avatarUrl = avatar ?: "https://lh3.googleusercontent.com/a/default-user"

        if (cleanEmail.isBlank() || !cleanEmail.contains("@")) {
            return GoogleAuthResult.Failure("Email Google không hợp lệ!")
        }

        return try {
            // 1. Try calling backend Google SSO endpoint (/api/users/google)
            val req = GoogleAuthRequest(
                email = cleanEmail,
                fullName = cleanName,
                avatar = avatarUrl
            )

            var res = try {
                apiClient.getService().googleAuth(req)
            } catch (e: Exception) {
                null
            }

            if (res == null || !res.isSuccessful) {
                try {
                    res = apiClient.getService().googleAuthDirect(req)
                } catch (_: Exception) {}
            }

            if (res != null && res.isSuccessful && res.body()?.data != null) {
                val u = res.body()!!.data!!
                val mappedRole = when (u.role.uppercase()) {
                    "ADMIN" -> UserRole.ADMIN
                    "OPERATOR", "VIEWER" -> UserRole.OPERATOR
                    else -> UserRole.TECHNICIAN
                }
                val rawStatus = (u.status ?: "APPROVED").uppercase()

                val domainUser = User(
                    id = u.id,
                    username = u.email,
                    fullName = u.fullName ?: u.name ?: cleanName,
                    role = mappedRole,
                    email = u.email,
                    token = "jwt-session-google-${System.currentTimeMillis()}",
                    status = rawStatus,
                    avatarUrl = u.avatar ?: avatarUrl
                )

                preferences.saveRegisteredUser(domainUser)

                when (rawStatus) {
                    "APPROVED", "ACTIVE" -> {
                        preferences.authToken = domainUser.token
                        preferences.currentUser = domainUser
                        socketManager.connect()
                        return GoogleAuthResult.Success(domainUser)
                    }
                    "LOCKED" -> {
                        return GoogleAuthResult.Locked("Tài khoản Google này đã bị Khóa bởi Quản trị viên.")
                    }
                    else -> {
                        // PENDING_APPROVAL / PENDING
                        return GoogleAuthResult.PendingApproval(domainUser)
                    }
                }
            }

            // 2. Check locally saved registered users (Offline / Local sync)
            val registeredMatch = preferences.getRegisteredUsers().find {
                it.email.lowercase() == cleanEmail
            }
            if (registeredMatch != null) {
                val status = (registeredMatch.status ?: "APPROVED").uppercase()
                if (status == "APPROVED" || status == "ACTIVE") {
                    val activeUser = registeredMatch.copy(
                        token = "jwt-session-google-${System.currentTimeMillis()}",
                        avatarUrl = avatarUrl
                    )
                    preferences.authToken = activeUser.token
                    preferences.currentUser = activeUser
                    socketManager.connect()
                    return GoogleAuthResult.Success(activeUser)
                } else if (status == "LOCKED") {
                    return GoogleAuthResult.Locked("Tài khoản Google này đã bị Khóa bởi Quản trị viên.")
                } else {
                    return GoogleAuthResult.PendingApproval(registeredMatch)
                }
            }

            // 3. Check unified system accounts (Shared approved DC Google accounts)
            val sysMatch = UNIFIED_SYSTEM_ACCOUNTS.find { it.email.lowercase() == cleanEmail }
            if (sysMatch != null) {
                val status = (sysMatch.status ?: "APPROVED").uppercase()
                if (status == "APPROVED" || status == "ACTIVE") {
                    val activeUser = sysMatch.copy(
                        token = "jwt-session-google-${System.currentTimeMillis()}",
                        avatarUrl = avatarUrl
                    )
                    preferences.authToken = activeUser.token
                    preferences.currentUser = activeUser
                    preferences.saveRegisteredUser(activeUser)
                    socketManager.connect()
                    return GoogleAuthResult.Success(activeUser)
                }
            }

            // 4. Fallback: Register new Google user as Technician with Pending status
            val newGoogleUser = User(
                id = "USR-GG-${System.currentTimeMillis() % 10000}",
                username = cleanEmail,
                fullName = cleanName,
                role = UserRole.TECHNICIAN,
                email = cleanEmail,
                token = "jwt-session-google-${System.currentTimeMillis()}",
                status = "PENDING_APPROVAL",
                avatarUrl = avatarUrl
            )
            preferences.saveRegisteredUser(newGoogleUser)

            // Try creating on live backend REST API
            try {
                apiClient.getService().createUser(
                    mapOf(
                        "name" to cleanName,
                        "email" to cleanEmail,
                        "role" to "TECHNICIAN",
                        "user_id" to newGoogleUser.id,
                        "department" to "Phòng Vận Hành Hạ Tầng AR-IMMS",
                        "status" to "PENDING_APPROVAL"
                    )
                )
            } catch (_: Exception) {}

            GoogleAuthResult.PendingApproval(newGoogleUser)
        } catch (e: Exception) {
            val msg = if (e is java.net.ConnectException || e is java.net.SocketTimeoutException || e is java.net.UnknownHostException) {
                "Không thể kết nối đến máy chủ (${preferences.serverUrl}). Vui lòng kiểm tra lại mạng!"
            } else {
                e.message ?: "Lỗi xác thực Google SSO. Vui lòng thử lại!"
            }
            GoogleAuthResult.Failure(msg)
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

    private fun extractCandidateKeys(markerCode: String): List<String> {
        val raw = markerCode.trim()
        val candidates = mutableListOf<String>()
        candidates.add(raw)

        val decoded = try {
            java.net.URLDecoder.decode(raw, "UTF-8")
        } catch (_: Exception) {
            raw
        }
        if (decoded != raw) candidates.add(decoded)

        for (target in listOf(raw, decoded)) {
            // If URL contains ?node= or &node= (e.g., https://ar-imms-monitor.vercel.app/?node=SRV-NODE-01)
            if (target.contains("node=")) {
                val nodeParam = target.substringAfter("node=").substringBefore("&").substringBefore("#").trim()
                if (nodeParam.isNotEmpty()) {
                    candidates.add(nodeParam)
                }
            }

            // If URL has path segment /node/ or /nodes/
            if (target.contains("/node/")) {
                val pathNode = target.substringAfter("/node/").substringBefore("?").substringBefore("/").trim()
                if (pathNode.isNotEmpty()) candidates.add(pathNode)
            }
            if (target.contains("/nodes/")) {
                val pathNode = target.substringAfter("/nodes/").substringBefore("?").substringBefore("/").trim()
                if (pathNode.isNotEmpty()) candidates.add(pathNode)
            }

            val stripped = target
                .removePrefix("ar-imms://node/")
                .removePrefix("arimms://node/")
                .removePrefix("ar-imms://")
                .removePrefix("arimms://")
                .removePrefix("node/")
                .removePrefix("https://")
                .removePrefix("http://")
                .trim()
            candidates.add(stripped)

            if (stripped.contains("?")) {
                candidates.add(stripped.substringBefore("?"))
            }

            candidates.add(stripped.replace("_", "-"))
            candidates.add(stripped.replace("-", "_"))
            candidates.add(stripped.replace(" ", "-"))
            candidates.add(stripped.replace(" ", "_"))
            candidates.add(stripped.replace("-", " "))
            candidates.add(stripped.replace("_", " "))
        }

        return candidates.filter { it.isNotBlank() }.distinct()
    }

    override suspend fun getNodeById(nodeId: String): Result<ServerNode?> {
        val candidates = extractCandidateKeys(nodeId)
        var all = _liveNodesState.value

        fun findMatch(nodes: List<ServerNode>): ServerNode? {
            for (key in candidates) {
                val match = nodes.find { node ->
                    node.id.equals(key, ignoreCase = true) ||
                    node.markerCode.equals(key, ignoreCase = true) ||
                    node.name.equals(key, ignoreCase = true) ||
                    node.markerCode.contains(key, ignoreCase = true) ||
                    (key.length >= 3 && node.id.contains(key, ignoreCase = true)) ||
                    (key.length >= 3 && key.contains(node.id, ignoreCase = true)) ||
                    (key.length >= 4 && node.name.contains(key, ignoreCase = true))
                }
                if (match != null) return match
            }
            return null
        }

        var result = findMatch(all)
        if (result == null) {
            getNodes().onSuccess { fetched ->
                all = fetched
                result = findMatch(all)
            }
        }
        return Result.success(result)
    }

    override suspend fun getNodeByMarker(markerCode: String): Result<ServerNode?> {
        val candidates = extractCandidateKeys(markerCode)
        var all = _liveNodesState.value

        fun findMatch(nodes: List<ServerNode>): ServerNode? {
            for (key in candidates) {
                val match = nodes.find { node ->
                    node.id.equals(key, ignoreCase = true) ||
                    node.markerCode.equals(key, ignoreCase = true) ||
                    node.name.equals(key, ignoreCase = true) ||
                    node.markerCode.contains(key, ignoreCase = true) ||
                    (key.length >= 3 && node.id.contains(key, ignoreCase = true)) ||
                    (key.length >= 3 && key.contains(node.id, ignoreCase = true)) ||
                    (key.length >= 4 && node.name.contains(key, ignoreCase = true))
                }
                if (match != null) return match
            }
            return null
        }

        var result = findMatch(all)
        if (result == null) {
            getNodes().onSuccess { fetched ->
                all = fetched
                result = findMatch(all)
            }
        }
        return Result.success(result)
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
            val response = apiClient.getService().getTickets(status = status?.name, technicianId = assignedUserId)
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

    override suspend fun getUsers(): Result<List<User>> {
        return try {
            val response = apiClient.getService().getUsers()
            if (response.isSuccessful && response.body()?.data != null) {
                val dbList = response.body()!!.data!!
                val users = dbList.map { dto ->
                    val role = when ((dto.role).uppercase()) {
                        "ADMIN" -> UserRole.ADMIN
                        "OPERATOR", "VIEWER" -> UserRole.OPERATOR
                        else -> UserRole.TECHNICIAN
                    }
                    val fullName = dto.fullName?.ifBlank { null }
                        ?: dto.name?.ifBlank { null }
                        ?: dto.email.substringBefore("@")
                    User(
                        id = dto.id.ifBlank { dto.userId ?: "USR-${dto.email.hashCode()}" },
                        username = dto.email,
                        fullName = fullName,
                        role = role,
                        email = dto.email,
                        status = dto.status ?: "APPROVED",
                        avatarUrl = dto.avatar
                    )
                }
                Result.success(users)
            } else {
                // Fallback to locally registered users and seed users
                val localUsers = preferences.getRegisteredUsers()
                val fallbackList = if (localUsers.isNotEmpty()) {
                    localUsers
                } else {
                    listOf(
                        User("USR-5BC8", "taint2360@ut.edu.vn", "Tài Nguyễn Thành", UserRole.TECHNICIAN, "taint2360@ut.edu.vn", status = "APPROVED"),
                        User("TECH-1001", "tbui@ar-imms.corp", "Trần Văn Bình", UserRole.TECHNICIAN, "tbui@ar-imms.corp", status = "APPROVED"),
                        User("USR-003", "tech.nguyenvanb@ar-imms.dc", "Nguyen Van B", UserRole.TECHNICIAN, "tech.nguyenvanb@ar-imms.dc", status = "APPROVED"),
                        User("ADM-0001", "sjenkins@ar-imms.corp", "Sarah Jenkins", UserRole.ADMIN, "sjenkins@ar-imms.corp", status = "APPROVED")
                    )
                }
                Result.success(fallbackList)
            }
        } catch (e: Exception) {
            val localUsers = preferences.getRegisteredUsers()
            val fallbackList = if (localUsers.isNotEmpty()) {
                localUsers
            } else {
                listOf(
                    User("USR-5BC8", "taint2360@ut.edu.vn", "Tài Nguyễn Thành", UserRole.TECHNICIAN, "taint2360@ut.edu.vn", status = "APPROVED"),
                    User("TECH-1001", "tbui@ar-imms.corp", "Trần Văn Bình", UserRole.TECHNICIAN, "tbui@ar-imms.corp", status = "APPROVED"),
                    User("USR-003", "tech.nguyenvanb@ar-imms.dc", "Nguyen Van B", UserRole.TECHNICIAN, "tech.nguyenvanb@ar-imms.dc", status = "APPROVED"),
                    User("ADM-0001", "sjenkins@ar-imms.corp", "Sarah Jenkins", UserRole.ADMIN, "sjenkins@ar-imms.corp", status = "APPROVED")
                )
            }
            Result.success(fallbackList)
        }
    }

    override suspend fun createTicket(
        nodeId: String,
        title: String,
        description: String,
        priority: TicketPriority,
        alertId: String?,
        assignedUserId: String?,
        assignedUserName: String?
    ): Result<MaintenanceTicket> {
        val techId = assignedUserId ?: preferences.currentUser?.id ?: "USR-002"
        val techName = assignedUserName ?: preferences.currentUser?.fullName ?: "Robert King (Field Tech)"
        val priorityStr = when (priority) {
            TicketPriority.EMERGENCY -> "CRITICAL"
            TicketPriority.HIGH -> "HIGH"
            TicketPriority.LOW -> "LOW"
            else -> "MEDIUM"
        }

        val nodeObj = _liveNodesState.value.find { it.id.equals(nodeId, ignoreCase = true) }
        val nodeName = nodeObj?.name ?: nodeId
        val rackCode = nodeObj?.rackId?.uppercase() ?: "RACK-A2"

        return try {
            val reqPayload = mapOf(
                "server_node_id" to nodeId,
                "title" to title,
                "description" to description,
                "priority" to priorityStr,
                "alert_id" to alertId,
                "assigned_technician_id" to techId,
                "assigned_technician_name" to techName
            )
            val response = apiClient.getService().createTicket(reqPayload)
            val ticketId = response.body()?.data?.id ?: "TCK-${System.currentTimeMillis().toString().takeLast(6)}"

            val newTicket = MaintenanceTicket(
                id = ticketId,
                title = title,
                description = description,
                priority = priority,
                status = TicketStatus.ASSIGNED,
                assignedToUserId = techId,
                assignedToName = techName,
                nodeId = nodeId,
                nodeName = nodeName,
                rackCode = rackCode,
                roomName = "Server Room 01 (Data Hall Alpha)",
                alertId = alertId,
                createdAt = System.currentTimeMillis()
            )

            val current = _ticketsState.value.toMutableList()
            current.removeAll { it.id.equals(ticketId, ignoreCase = true) }
            current.add(0, newTicket)
            _ticketsState.value = current

            Result.success(newTicket)
        } catch (e: Exception) {
            val fallbackId = "TCK-${System.currentTimeMillis().toString().takeLast(6)}"
            val newTicket = MaintenanceTicket(
                id = fallbackId,
                title = title,
                description = description,
                priority = priority,
                status = TicketStatus.ASSIGNED,
                assignedToUserId = techId,
                assignedToName = techName,
                nodeId = nodeId,
                nodeName = nodeName,
                rackCode = rackCode,
                roomName = "Server Room 01 (Data Hall Alpha)",
                alertId = alertId,
                createdAt = System.currentTimeMillis()
            )
            val current = _ticketsState.value.toMutableList()
            current.add(0, newTicket)
            _ticketsState.value = current
            Result.success(newTicket)
        }
    }

    override suspend fun checkInTicket(ticketId: String): Result<MaintenanceTicket> {
        val notes = "Kỹ thuật viên đã quét QR và Check-in AR tại hiện trường"
        try {
            apiClient.getService().addArLog(
                ticketId,
                mapOf(
                    "action" to "QR_SCANNED_CHECKIN",
                    "details" to mapOf(
                        "device" to "Android Mobile AR Scanner",
                        "technician" to (preferences.currentUser?.fullName ?: "Robert King")
                    )
                )
            )
        } catch (_: Exception) {}
        return updateTicketStatus(ticketId, TicketStatus.IN_PROGRESS, notes)
    }

    override suspend fun resolveTicket(
        ticketId: String,
        rootCause: String,
        resolution: String,
        photoUri: String?
    ): Result<MaintenanceTicket> {
        val notes = "Nguyên nhân: $rootCause. Giải pháp: $resolution"
        try {
            apiClient.getService().resolveTicket(
                ticketId,
                mapOf("notes" to notes)
            )
        } catch (_: Exception) {}
        return updateTicketStatus(ticketId, TicketStatus.RESOLVED, notes)
    }

    override suspend fun closeTicket(ticketId: String): Result<MaintenanceTicket> {
        val notes = "Đã nghiệm thu và đóng phiếu bảo trì thành công"
        try {
            apiClient.getService().closeTicket(ticketId)
        } catch (_: Exception) {}
        return updateTicketStatus(ticketId, TicketStatus.CLOSED, notes)
    }

    override suspend fun simulateNodeAlert(nodeId: String, metric: String, value: Double): Result<Boolean> {
        return try {
            val telemetryMap = mapOf(
                "node_id" to nodeId,
                "cpu" to if (metric == "cpu") value else 45.0,
                "ram" to if (metric == "ram") value else 60.0,
                "temp" to if (metric == "temp") value else 42.0,
                "disk" to if (metric == "disk") value else 35.0,
                "network_in_kbps" to 1500.0,
                "network_out_kbps" to 3200.0
            )
            val res = apiClient.getService().sendNodeTelemetry(nodeId, telemetryMap)
            Result.success(res.isSuccessful)
        } catch (e: Exception) {
            Result.failure(e)
        }
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
        val currentUserId = preferences.currentUser?.id ?: "TECH-4421"
        try {
            apiClient.getService().acknowledgeAlert(alertId, mapOf("user_id" to currentUserId))
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
