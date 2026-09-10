package com.arimms.app.domain.repository

import com.arimms.app.domain.model.*
import kotlinx.coroutines.flow.Flow

interface ARImmsRepository {
    // Auth
    suspend fun login(username: String, role: UserRole): Result<User> = login(username, "123456", role)
    suspend fun login(username: String, password: String, role: UserRole): Result<User>
    suspend fun register(username: String, email: String, password: String, fullName: String, role: UserRole): Result<User>
    suspend fun loginWithGoogle(email: String, fullName: String, avatar: String? = null): GoogleAuthResult
    fun getCurrentUser(): User?
    suspend fun logout()

    // Hierarchy & Digital Twin
    suspend fun getSites(): Result<List<Site>>
    suspend fun getRacks(roomId: String? = null): Result<List<Rack>>
    suspend fun getRackById(rackId: String): Result<Rack?>
    suspend fun getNodes(rackId: String? = null): Result<List<ServerNode>>
    suspend fun getNodeById(nodeId: String): Result<ServerNode?>
    suspend fun getNodeByMarker(markerCode: String): Result<ServerNode?>
    suspend fun addNode(node: ServerNode): Result<ServerNode>

    // Telemetry & Real-time Stream
    fun streamNodeTelemetry(nodeId: String): Flow<TelemetryMetric>
    fun streamAllNodes(): Flow<List<ServerNode>>
    suspend fun getHistoricalMetrics(nodeId: String, durationMinutes: Int = 30): List<TelemetryMetric>

    // Users & Technicians
    suspend fun getUsers(): Result<List<User>>

    // Tickets
    suspend fun getTickets(assignedUserId: String? = null, status: TicketStatus? = null): Result<List<MaintenanceTicket>>
    suspend fun getTicketById(ticketId: String): Result<MaintenanceTicket?>
    suspend fun createTicket(
        nodeId: String,
        title: String,
        description: String,
        priority: TicketPriority,
        alertId: String? = null,
        assignedUserId: String? = null,
        assignedUserName: String? = null
    ): Result<MaintenanceTicket>
    suspend fun updateTicketStatus(ticketId: String, status: TicketStatus, notes: String? = null): Result<MaintenanceTicket>
    suspend fun checkInTicket(ticketId: String): Result<MaintenanceTicket>
    suspend fun resolveTicket(ticketId: String, rootCause: String, resolution: String, photoUri: String?): Result<MaintenanceTicket>
    suspend fun closeTicket(ticketId: String): Result<MaintenanceTicket>

    // Alerts
    suspend fun getAlerts(state: AlertState? = null): Result<List<SystemAlert>>
    fun streamAlerts(): Flow<List<SystemAlert>>
    suspend fun acknowledgeAlert(alertId: String): Result<SystemAlert>
    suspend fun simulateNodeAlert(nodeId: String, metric: String = "temp", value: Double = 88.0): Result<Boolean>

    // Safe Remote Operations
    suspend fun toggleNodeLed(nodeId: String): Result<Boolean>
    suspend fun restartContainer(nodeId: String, containerId: String): Result<Boolean>
    suspend fun pingNode(nodeId: String): Result<Long> // Returns ping latency in ms

    // Configuration
    fun isDemoMode(): Boolean
    fun setDemoMode(enabled: Boolean)
    fun getServerUrl(): String
    fun setServerUrl(url: String)
}
