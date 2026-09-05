package com.arimms.app.data.mock

import com.arimms.app.domain.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

class TelemetrySimulator(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) {
    private val _nodesState = MutableStateFlow<List<ServerNode>>(MockDataGenerator.createInitialNodes())
    val nodesState: StateFlow<List<ServerNode>> = _nodesState.asStateFlow()

    private val _alertsState = MutableStateFlow<List<SystemAlert>>(MockDataGenerator.createInitialAlerts())
    val alertsState: StateFlow<List<SystemAlert>> = _alertsState.asStateFlow()

    private val _ticketsState = MutableStateFlow<List<MaintenanceTicket>>(MockDataGenerator.createInitialTickets())
    val ticketsState: StateFlow<List<MaintenanceTicket>> = _ticketsState.asStateFlow()

    private val _telemetryStream = MutableSharedFlow<TelemetryMetric>(replay = 1)
    val telemetryStream: SharedFlow<TelemetryMetric> = _telemetryStream.asSharedFlow()

    private val historicalMap = mutableMapOf<String, MutableList<TelemetryMetric>>()

    init {
        // Pre-fill some history
        val now = System.currentTimeMillis()
        _nodesState.value.forEach { node ->
            val list = mutableListOf<TelemetryMetric>()
            for (i in 30 downTo 0) {
                val pastTime = now - i * 60 * 1000
                list.add(
                    node.currentTelemetry.copy(
                        timestamp = pastTime,
                        cpuUsagePercent = (node.currentTelemetry.cpuUsagePercent + Random.nextDouble(-8.0, 8.0)).coerceIn(5.0, 99.0),
                        memoryUsagePercent = (node.currentTelemetry.memoryUsagePercent + Random.nextDouble(-3.0, 3.0)).coerceIn(10.0, 98.0),
                        temperatureCelsius = (node.currentTelemetry.temperatureCelsius + Random.nextDouble(-2.0, 2.0)).coerceIn(25.0, 95.0)
                    )
                )
            }
            historicalMap[node.id] = list
        }

        startSimulationLoop()
    }

    private fun startSimulationLoop() {
        scope.launch {
            while (isActive) {
                delay(3000) // Telemetry broadcast tick every 3s
                updateTelemetryMetrics()
            }
        }
    }

    private suspend fun updateTelemetryMetrics() {
        val updatedNodes = _nodesState.value.map { node ->
            val current = node.currentTelemetry
            val cpuDelta = Random.nextDouble(-4.5, 4.5)
            val newCpu = (current.cpuUsagePercent + cpuDelta).coerceIn(5.0, 99.0)

            val memDelta = Random.nextDouble(-1.5, 1.5)
            val newMem = (current.memoryUsagePercent + memDelta).coerceIn(10.0, 98.0)
            val newMemUsedGb = (newMem / 100.0) * node.totalRamGb

            val tempDelta = if (newCpu > 70.0) Random.nextDouble(0.1, 0.8) else Random.nextDouble(-0.6, 0.4)
            val newTemp = (current.temperatureCelsius + tempDelta).coerceIn(30.0, 92.0)

            val netIn = max(100.0, current.networkInKbps + Random.nextDouble(-300.0, 300.0))
            val netOut = max(150.0, current.networkOutKbps + Random.nextDouble(-400.0, 400.0))

            val fanSpeed = if (newTemp > 75.0) 8800 else if (newTemp > 50.0) 5800 else 3800

            val healthStatus = when {
                newTemp >= 80.0 || newCpu >= 95.0 -> NodeHealthStatus.CRITICAL
                newTemp >= 60.0 || newCpu >= 75.0 || newMem >= 85.0 -> NodeHealthStatus.WARNING
                else -> NodeHealthStatus.HEALTHY
            }

            val updatedTelemetry = current.copy(
                timestamp = System.currentTimeMillis(),
                cpuUsagePercent = String.format("%.1f", newCpu).toDouble(),
                memoryUsagePercent = String.format("%.1f", newMem).toDouble(),
                memoryUsedGb = String.format("%.2f", newMemUsedGb).toDouble(),
                temperatureCelsius = String.format("%.1f", newTemp).toDouble(),
                networkInKbps = String.format("%.1f", netIn).toDouble(),
                networkOutKbps = String.format("%.1f", netOut).toDouble(),
                fanSpeedRpm = fanSpeed,
                status = healthStatus
            )

            // Append to history
            val history = historicalMap.getOrPut(node.id) { mutableListOf() }
            history.add(updatedTelemetry)
            if (history.size > 60) {
                history.removeAt(0)
            }

            _telemetryStream.emit(updatedTelemetry)

            node.copy(
                currentTelemetry = updatedTelemetry,
                lastSeenTimestamp = System.currentTimeMillis()
            )
        }

        _nodesState.value = updatedNodes
    }

    fun getHistoricalMetrics(nodeId: String): List<TelemetryMetric> {
        return historicalMap[nodeId]?.toList() ?: emptyList()
    }

    fun toggleNodeLed(nodeId: String): Boolean {
        var newState = false
        _nodesState.value = _nodesState.value.map {
            if (it.id == nodeId) {
                newState = !it.isBlinkingLed
                it.copy(isBlinkingLed = newState)
            } else it
        }
        return newState
    }

    fun restartContainer(nodeId: String, containerId: String): Boolean {
        _nodesState.value = _nodesState.value.map { node ->
            if (node.id == nodeId) {
                val updatedContainers = node.containers.map { container ->
                    if (container.id == containerId) {
                        container.copy(
                            state = ContainerState.RUNNING,
                            uptimeSeconds = 1,
                            cpuPercent = 5.0
                        )
                    } else container
                }
                node.copy(containers = updatedContainers)
            } else node
        }
        return true
    }

    fun acknowledgeAlert(alertId: String, byUserName: String): SystemAlert? {
        var updatedAlert: SystemAlert? = null
        _alertsState.value = _alertsState.value.map { alert ->
            if (alert.id == alertId) {
                val mod = alert.copy(
                    state = AlertState.ACKNOWLEDGED,
                    acknowledgedBy = byUserName
                )
                updatedAlert = mod
                mod
            } else alert
        }
        return updatedAlert
    }

    fun checkInTicket(ticketId: String): MaintenanceTicket? {
        var result: MaintenanceTicket? = null
        _ticketsState.value = _ticketsState.value.map { ticket ->
            if (ticket.id == ticketId) {
                val mod = ticket.copy(
                    status = TicketStatus.IN_PROGRESS,
                    checkedInAt = System.currentTimeMillis()
                )
                result = mod
                mod
            } else ticket
        }
        return result
    }

    fun updateTicketStatus(ticketId: String, status: TicketStatus, notes: String?): MaintenanceTicket? {
        var result: MaintenanceTicket? = null
        _ticketsState.value = _ticketsState.value.map { ticket ->
            if (ticket.id == ticketId) {
                val mod = ticket.copy(
                    status = status,
                    rootCauseNotes = notes ?: ticket.rootCauseNotes,
                    resolvedAt = if (status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) System.currentTimeMillis() else ticket.resolvedAt
                )
                result = mod
                mod
            } else ticket
        }
        return result
    }

    fun resolveTicket(ticketId: String, rootCause: String, resolution: String, photoUri: String?): MaintenanceTicket? {
        var result: MaintenanceTicket? = null
        _ticketsState.value = _ticketsState.value.map { ticket ->
            if (ticket.id == ticketId) {
                val mod = ticket.copy(
                    status = TicketStatus.RESOLVED,
                    rootCauseNotes = rootCause,
                    resolutionNotes = resolution,
                    photoUri = photoUri ?: ticket.photoUri,
                    resolvedAt = System.currentTimeMillis()
                )
                result = mod
                mod
            } else ticket
        }
        return result
    }
}
