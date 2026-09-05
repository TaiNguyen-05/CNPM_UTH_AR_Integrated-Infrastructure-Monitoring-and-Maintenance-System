package com.arimms.app.domain.model

enum class UserRole {
    TECHNICIAN,
    OPERATOR,
    ADMIN
}

data class User(
    val id: String,
    val username: String,
    val fullName: String,
    val role: UserRole,
    val email: String,
    val token: String? = null
)

enum class NodeHealthStatus {
    HEALTHY,
    WARNING,
    CRITICAL,
    OFFLINE
}

enum class ContainerState {
    RUNNING,
    STOPPED,
    RESTARTING,
    CRASHED
}

data class ContainerWorkload(
    val id: String,
    val name: String,
    val image: String,
    val state: ContainerState,
    val cpuPercent: Double,
    val memoryUsageMb: Double,
    val memoryLimitMb: Double,
    val uptimeSeconds: Long,
    val portMappings: List<String> = emptyList()
)

data class TelemetryMetric(
    val nodeId: String,
    val timestamp: Long = System.currentTimeMillis(),
    val cpuUsagePercent: Double,
    val memoryUsagePercent: Double,
    val memoryUsedGb: Double,
    val memoryTotalGb: Double,
    val diskUsagePercent: Double,
    val temperatureCelsius: Double,
    val networkInKbps: Double,
    val networkOutKbps: Double,
    val powerWatts: Double,
    val fanSpeedRpm: Int,
    val status: NodeHealthStatus
)

data class ServerNode(
    val id: String,
    val name: String,
    val ipAddress: String,
    val rackId: String,
    val rackUnitPosition: Int, // e.g., U12
    val unitHeight: Int = 1, // e.g., 1U, 2U
    val markerCode: String, // QR or ArUco Marker ID e.g. "AR-NODE-01"
    val model: String,
    val cpuModel: String,
    val totalCores: Int,
    val totalRamGb: Int,
    val totalDiskGb: Int,
    val osName: String,
    val currentTelemetry: TelemetryMetric,
    val containers: List<ContainerWorkload> = emptyList(),
    val isBlinkingLed: Boolean = false,
    val lastSeenTimestamp: Long = System.currentTimeMillis()
)

data class Rack(
    val id: String,
    val name: String,
    val code: String,
    val roomId: String,
    val totalUnits: Int = 42,
    val powerCapacityWatts: Double = 5000.0,
    val currentPowerWatts: Double = 1850.0,
    val currentTemperatureCelsius: Double = 23.5,
    val nodes: List<ServerNode> = emptyList()
)

data class Room(
    val id: String,
    val name: String,
    val siteId: String,
    val racks: List<Rack> = emptyList(),
    val targetPue: Double = 1.25,
    val currentPue: Double = 1.32
)

data class Site(
    val id: String,
    val name: String,
    val location: String,
    val rooms: List<Room> = emptyList()
)

enum class AlertSeverity {
    INFO,
    WARNING,
    CRITICAL
}

enum class AlertState {
    OPEN,
    ACKNOWLEDGED,
    RESOLVED,
    CLOSED
}

data class SystemAlert(
    val id: String,
    val nodeId: String,
    val nodeName: String,
    val rackId: String,
    val title: String,
    val message: String,
    val severity: AlertSeverity,
    val state: AlertState,
    val timestamp: Long = System.currentTimeMillis(),
    val acknowledgedBy: String? = null,
    val resolvedAt: Long? = null
)

enum class TicketPriority {
    LOW,
    MEDIUM,
    HIGH,
    EMERGENCY
}

enum class TicketStatus {
    OPEN,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    CLOSED
}

data class MaintenanceTicket(
    val id: String,
    val title: String,
    val description: String,
    val priority: TicketPriority,
    val status: TicketStatus,
    val assignedToUserId: String,
    val assignedToName: String,
    val nodeId: String,
    val nodeName: String,
    val rackCode: String,
    val roomName: String,
    val alertId: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val rootCauseNotes: String? = null,
    val resolutionNotes: String? = null,
    val photoUri: String? = null,
    val checkedInAt: Long? = null,
    val resolvedAt: Long? = null
)

data class AuditLog(
    val id: String,
    val userId: String,
    val userName: String,
    val action: String,
    val target: String,
    val timestamp: Long = System.currentTimeMillis(),
    val details: String
)
