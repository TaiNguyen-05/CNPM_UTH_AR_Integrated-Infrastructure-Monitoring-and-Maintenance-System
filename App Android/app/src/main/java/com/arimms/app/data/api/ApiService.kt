package com.arimms.app.data.api

import com.arimms.app.domain.model.*
import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.*

data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null,
    val errors: Any? = null
)

data class LoginRequest(
    val username: String,
    val password: String = "123456",
    val role: String? = null
)

data class SignupRequest(
    val username: String,
    val email: String,
    val password: String,
    val passwordconfirm: String,
    val role: String? = null,
    val fullName: String? = null
)

data class SignupResponse(
    val username: String? = null,
    val email: String? = null,
    val message: String? = null
)

data class LoginResponse(
    val token: String,
    val user: UserDto? = null
)

data class UserDto(
    @SerializedName("id") val id: String = "",
    @SerializedName("user_id") val userId: String? = null,
    @SerializedName("full_name") val fullName: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("email") val email: String = "",
    @SerializedName("role") val role: String = "TECHNICIAN",
    @SerializedName("status") val status: String? = null,
    @SerializedName("department") val department: String? = null,
    @SerializedName("avatar") val avatar: String? = null,
    @SerializedName("phone_number") val phoneNumber: String? = null
)

data class GoogleAuthRequest(
    val email: String,
    @SerializedName("full_name") val fullName: String,
    val avatar: String? = "https://lh3.googleusercontent.com/a/default-user"
)

data class GoogleAuthUserDto(
    val id: String,
    @SerializedName("user_id") val userId: String? = null,
    @SerializedName("full_name") val fullName: String? = null,
    val name: String? = null,
    val email: String,
    val role: String,
    val status: String? = null,
    val avatar: String? = null,
    val department: String? = null
)

data class NodeDto(
    val id: String,
    @SerializedName("rack_id") val rackId: String,
    val name: String,
    @SerializedName("u_start") val uStart: Int,
    @SerializedName("u_height") val uHeight: Int = 2,
    @SerializedName("ip_address") val ipAddress: String,
    val model: String? = null,
    @SerializedName("cpu_model") val cpuModel: String? = null,
    @SerializedName("ram_total_gb") val ramTotalGb: Int = 32,
    @SerializedName("disk_total_gb") val diskTotalGb: Int = 1000,
    @SerializedName("qr_code_payload") val qrCodePayload: String? = null,
    val status: String = "HEALTHY",
    val metrics: Map<String, Any>? = null,
    val containers: List<Map<String, Any>>? = null
)

data class RackDto(
    val id: String,
    val name: String,
    val code: String? = null,
    @SerializedName("room_name") val roomName: String? = "Server Room 01",
    @SerializedName("total_u") val totalU: Int = 42,
    @SerializedName("power_limit_kw") val powerLimitKw: Double = 10.0,
    val nodes: List<NodeDto>? = null
)

data class AlertDto(
    val id: String,
    @SerializedName("server_node_id") val serverNodeId: String,
    val severity: String = "WARNING",
    val title: String,
    val message: String,
    @SerializedName("metric_name") val metricName: String? = "cpu",
    @SerializedName("metric_value") val metricValue: Double = 0.0,
    val status: String = "OPEN"
)

data class TicketDto(
    val id: String,
    @SerializedName("server_node_id") val serverNodeId: String,
    @SerializedName("alert_id") val alertId: String? = null,
    val title: String,
    val description: String? = "",
    val priority: String = "MEDIUM",
    val status: String = "CREATED",
    @SerializedName("assigned_technician_id") val assignedTechnicianId: String? = null,
    @SerializedName("assigned_technician_name") val assignedTechnicianName: String? = null,
    @SerializedName("resolution_notes") val resolutionNotes: String? = null
)

data class UpdateTicketRequest(
    val status: String,
    @SerializedName("resolution_notes") val resolutionNotes: String? = null,
    @SerializedName("root_cause_notes") val rootCauseNotes: String? = null
)

interface ApiService {
    @GET("api/users")
    suspend fun getUsers(): Response<ApiResponse<List<UserDto>>>

    @GET("api/users/{id}")
    suspend fun getUserById(@Path("id") userId: String): Response<ApiResponse<UserDto>>

    @POST("api/users")
    suspend fun createUser(@Body user: Map<String, Any>): Response<ApiResponse<UserDto>>

    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/login")
    suspend fun loginFlask(@Body request: LoginRequest): Response<LoginResponse>

    @POST("api/auth/register")
    suspend fun register(@Body request: SignupRequest): Response<ApiResponse<UserDto>>

    @POST("auth/signup")
    suspend fun registerFlask(@Body request: SignupRequest): Response<SignupResponse>

    @POST("api/users/google")
    suspend fun googleAuth(@Body request: GoogleAuthRequest): Response<ApiResponse<GoogleAuthUserDto>>

    @POST("users/google")
    suspend fun googleAuthDirect(@Body request: GoogleAuthRequest): Response<ApiResponse<GoogleAuthUserDto>>

    @GET("api/nodes")
    suspend fun getNodes(
        @Query("rack_id") rackId: String? = null,
        @Query("status") status: String? = null,
        @Query("qr") qr: String? = null
    ): Response<ApiResponse<List<NodeDto>>>

    @GET("api/nodes/{id}")
    suspend fun getNodeById(@Path("id") nodeId: String): Response<ApiResponse<NodeDto>>

    @GET("api/racks")
    suspend fun getRacks(): Response<ApiResponse<List<RackDto>>>

    @GET("api/racks/{id}")
    suspend fun getRackById(@Path("id") rackId: String): Response<ApiResponse<RackDto>>

    @GET("api/alerts")
    suspend fun getAlerts(@Query("status") status: String? = null): Response<ApiResponse<List<AlertDto>>>

    @POST("api/alerts/{id}/acknowledge")
    suspend fun acknowledgeAlert(
        @Path("id") alertId: String,
        @Body body: Map<String, String> = mapOf("user_id" to "USR-001")
    ): Response<ApiResponse<AlertDto>>

    @POST("api/alerts/{id}/resolve")
    suspend fun resolveAlert(
        @Path("id") alertId: String,
        @Body body: Map<String, String> = mapOf("user_id" to "USR-001")
    ): Response<ApiResponse<AlertDto>>

    @GET("api/tickets")
    suspend fun getTickets(
        @Query("status") status: String? = null,
        @Query("technician_id") technicianId: String? = null,
        @Query("node_id") nodeId: String? = null
    ): Response<ApiResponse<List<TicketDto>>>

    @GET("api/tickets/{id}")
    suspend fun getTicketById(@Path("id") ticketId: String): Response<ApiResponse<TicketDto>>

    @POST("api/tickets/{id}/assign")
    suspend fun assignTicket(
        @Path("id") ticketId: String,
        @Body body: Map<String, String>
    ): Response<ApiResponse<TicketDto>>

    @POST("api/tickets/{id}/ar-log")
    suspend fun addArLog(
        @Path("id") ticketId: String,
        @Body body: Map<String, Any>
    ): Response<ApiResponse<TicketDto>>

    @POST("api/tickets/{id}/resolve")
    suspend fun resolveTicket(
        @Path("id") ticketId: String,
        @Body body: Map<String, String>
    ): Response<ApiResponse<TicketDto>>

    @POST("api/tickets/{id}/close")
    suspend fun closeTicket(
        @Path("id") ticketId: String,
        @Body body: Map<String, String> = emptyMap()
    ): Response<ApiResponse<TicketDto>>

    @PATCH("api/tickets/{id}")
    suspend fun updateTicket(
        @Path("id") ticketId: String,
        @Body request: UpdateTicketRequest
    ): Response<ApiResponse<TicketDto>>

    @POST("api/tickets")
    suspend fun createTicket(@Body body: Map<String, Any?>): Response<ApiResponse<TicketDto>>

    @POST("api/nodes/{id}/telemetry")
    suspend fun sendNodeTelemetry(
        @Path("id") nodeId: String,
        @Body telemetry: Map<String, Any>
    ): Response<ApiResponse<Map<String, Any>>>

    @POST("api/nodes/{id}/actions/toggle-led")
    suspend fun toggleLed(@Path("id") nodeId: String): Response<ApiResponse<Map<String, Any>>>

    @POST("api/nodes/{nodeId}/containers/{containerId}/restart")
    suspend fun restartContainer(
        @Path("nodeId") nodeId: String,
        @Path("containerId") containerId: String
    ): Response<ApiResponse<Map<String, Any>>>

    @GET("api/health")
    suspend fun checkHealth(): Response<Map<String, Any>>
}
