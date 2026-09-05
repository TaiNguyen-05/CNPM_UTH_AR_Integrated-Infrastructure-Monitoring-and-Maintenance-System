package com.arimms.app.data.api

import android.util.Log
import com.arimms.app.data.local.AppPreferences
import com.arimms.app.domain.model.*
import com.google.gson.Gson
import com.google.gson.JsonObject
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import org.json.JSONObject

class SocketManager(
    private val preferences: AppPreferences,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.IO)
) {
    private var socket: Socket? = null
    private val gson = Gson()

    private val _telemetryStream = MutableSharedFlow<TelemetryMetric>(replay = 1)
    val telemetryStream: SharedFlow<TelemetryMetric> = _telemetryStream.asSharedFlow()

    private val _alertsStream = MutableSharedFlow<SystemAlert>(replay = 1)
    val alertsStream: SharedFlow<SystemAlert> = _alertsStream.asSharedFlow()

    private val _connectionState = MutableSharedFlow<Boolean>(replay = 1)
    val connectionState: SharedFlow<Boolean> = _connectionState.asSharedFlow()

    fun connect() {
        if (preferences.isDemoMode) {
            return
        }

        try {
            disconnect()
            val serverUrl = preferences.serverUrl
            val options = IO.Options().apply {
                reconnection = true
                reconnectionAttempts = 10
                reconnectionDelay = 2000
                timeout = 10000
                preferences.authToken?.let { token ->
                    auth = mapOf("token" to token)
                }
            }

            socket = IO.socket(serverUrl, options).apply {
                on(Socket.EVENT_CONNECT) {
                    Log.d("SocketManager", "Connected to Socket.IO backend at $serverUrl")
                    scope.launch { _connectionState.emit(true) }
                }

                on(Socket.EVENT_DISCONNECT) {
                    Log.d("SocketManager", "Disconnected from Socket.IO")
                    scope.launch { _connectionState.emit(false) }
                }

                on(Socket.EVENT_CONNECT_ERROR) { args ->
                    Log.e("SocketManager", "Socket.IO Connect Error: ${args.firstOrNull()}")
                    scope.launch { _connectionState.emit(false) }
                }

                // Handle telemetry broadcast from Web Admin / Flask Backend
                val telemetryHandler: (Array<Any>) -> Unit = { args ->
                    val data = args.firstOrNull()
                    if (data != null) {
                        try {
                            val json = if (data is JSONObject) data else JSONObject(data.toString())
                            val nodeId = json.optString("node_id", json.optString("nodeId", ""))
                            val cpu = json.optDouble("cpu", json.optDouble("cpuUsagePercent", 30.0))
                            val ram = json.optDouble("ram", json.optDouble("memoryUsagePercent", 45.0))
                            val temp = json.optDouble("temp", json.optDouble("temperatureCelsius", 40.0))
                            val disk = json.optDouble("disk", json.optDouble("diskUsagePercent", 35.0))
                            val fan = json.optInt("fan_speed", json.optInt("fanSpeedRpm", 4500))
                            val power = json.optDouble("power_w", json.optDouble("powerWatts", 250.0))
                            val statusStr = json.optString("status", "HEALTHY").uppercase()

                            val healthStatus = try {
                                NodeHealthStatus.valueOf(statusStr)
                            } catch (e: Exception) {
                                NodeHealthStatus.HEALTHY
                            }

                            val metric = TelemetryMetric(
                                nodeId = nodeId,
                                timestamp = System.currentTimeMillis(),
                                cpuUsagePercent = cpu,
                                memoryUsagePercent = ram,
                                memoryUsedGb = (ram / 100.0) * 64.0,
                                memoryTotalGb = 64.0,
                                diskUsagePercent = disk,
                                temperatureCelsius = temp,
                                networkInKbps = json.optDouble("net_in", 1200.0),
                                networkOutKbps = json.optDouble("net_out", 3400.0),
                                powerWatts = power,
                                fanSpeedRpm = fan,
                                status = healthStatus
                            )
                            scope.launch { _telemetryStream.emit(metric) }
                        } catch (e: Exception) {
                            Log.e("SocketManager", "Failed to parse telemetry event", e)
                        }
                    }
                }

                on("telemetry_update", telemetryHandler)
                on("telemetry:metric", telemetryHandler)
                on("telemetry_broadcast", telemetryHandler)

                // Handle Alerts
                val alertHandler: (Array<Any>) -> Unit = { args ->
                    val data = args.firstOrNull()
                    if (data != null) {
                        try {
                            val json = if (data is JSONObject) data else JSONObject(data.toString())
                            val alertId = json.optString("id", "")
                            val nodeId = json.optString("server_node_id", json.optString("nodeId", ""))
                            val title = json.optString("title", "Cảnh báo hạ tầng")
                            val message = json.optString("message", "")
                            val sevStr = json.optString("severity", "WARNING").uppercase()
                            val statusStr = json.optString("status", "OPEN").uppercase()

                            val severity = try { AlertSeverity.valueOf(sevStr) } catch (e: Exception) { AlertSeverity.WARNING }
                            val state = try { AlertState.valueOf(statusStr) } catch (e: Exception) { AlertState.OPEN }

                            val alert = SystemAlert(
                                id = alertId,
                                nodeId = nodeId,
                                nodeName = nodeId,
                                rackId = "rack-a1",
                                title = title,
                                message = message,
                                severity = severity,
                                state = state
                            )
                            scope.launch { _alertsStream.emit(alert) }
                        } catch (e: Exception) {
                            Log.e("SocketManager", "Failed to parse alert event", e)
                        }
                    }
                }

                on("new_alert", alertHandler)
                on("alert_updated", alertHandler)
                on("alert:new", alertHandler)

                connect()
            }
        } catch (e: Exception) {
            Log.e("SocketManager", "Failed to init Socket.IO", e)
        }
    }

    fun disconnect() {
        socket?.disconnect()
        socket?.off()
        socket = null
    }
}
