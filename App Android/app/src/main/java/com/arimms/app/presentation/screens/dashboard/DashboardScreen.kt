package com.arimms.app.presentation.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.*
import com.arimms.app.presentation.components.*
import com.arimms.app.presentation.theme.*
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToARScanner: () -> Unit,
    onNavigateToNodeDetail: (String) -> Unit,
    onNavigateToTickets: () -> Unit,
    onNavigateToTicketDetail: (String) -> Unit,
    onNavigateToAlerts: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val repository = ARImmsApp.instance.repository
    val user = repository.getCurrentUser()
    val scope = rememberCoroutineScope()

    var nodes by remember { mutableStateOf<List<ServerNode>>(emptyList()) }
    var alerts by remember { mutableStateOf<List<SystemAlert>>(emptyList()) }
    var tickets by remember { mutableStateOf<List<MaintenanceTicket>>(emptyList()) }
    var showCreateServerDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        repository.streamAllNodes().collectLatest {
            nodes = it
        }
    }

    LaunchedEffect(Unit) {
        repository.streamAlerts().collectLatest {
            alerts = it
        }
    }

    LaunchedEffect(Unit) {
        repository.getTickets().onSuccess {
            tickets = it
        }
    }

    val healthyCount = nodes.count { it.currentTelemetry.status == NodeHealthStatus.HEALTHY }
    val warningCount = nodes.count { it.currentTelemetry.status == NodeHealthStatus.WARNING }
    val criticalCount = nodes.count { it.currentTelemetry.status == NodeHealthStatus.CRITICAL }
    val openAlertsCount = alerts.count { it.state == AlertState.OPEN }
    val assignedTickets = tickets.filter { it.status != TicketStatus.RESOLVED && it.status != TicketStatus.CLOSED }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "AR-IMMS COMMAND CENTER",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = PrimaryCyan,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = user?.fullName ?: "Kỹ thuật viên",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                },
                actions = {
                    // Alert Bell Icon with Badge
                    IconButton(onClick = onNavigateToAlerts) {
                        BadgedBox(
                            badge = {
                                if (openAlertsCount > 0) {
                                    Badge(
                                        containerColor = StatusCritical,
                                        contentColor = Color.White
                                    ) {
                                        Text("$openAlertsCount")
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = "Alerts",
                                tint = if (openAlertsCount > 0) StatusCritical else TextPrimary
                            )
                        }
                    }
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = TextSecondary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = SurfaceDark
                )
            )
        },
        containerColor = BgDark
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // AR Scanner Quick Action Banner (Hero Banner)
            item {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .clickable { onNavigateToARScanner() },
                    color = SurfaceCard,
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, PrimaryCyan.copy(alpha = 0.4f)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.horizontalGradient(
                                    listOf(Color(0xFFE0F2FE), Color(0xFFF0FDF4))
                                )
                            )
                            .padding(18.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(StatusHealthy)
                                    )
                                    Text(
                                        text = "SPATIAL AR SCANNER READY",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = StatusHealthy,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Quét Marker Server / Rack",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = TextPrimary,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Nhận diện mã QR/ArUco & hiển thị HUD Telemetry 3D trực tiếp",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextSecondary,
                                    fontSize = 12.sp
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(CircleShape)
                                    .background(PrimaryCyan)
                                    .border(2.dp, Color.White.copy(alpha = 0.8f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.QrCodeScanner,
                                    contentDescription = "Scan AR",
                                    tint = Color.White,
                                    modifier = Modifier.size(28.dp)
                                )
                            }
                        }
                    }
                }
            }

            // DC Health Summary Cards
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Total Nodes
                    CyberCard(
                        modifier = Modifier.weight(1f),
                        borderColor = BorderStroke
                    ) {
                        Text("MÁY CHỦ", fontSize = 11.sp, color = TextSecondary, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${nodes.size}",
                            style = MaterialTheme.typography.headlineMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Black
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text("$healthyCount OK", fontSize = 10.sp, color = StatusHealthy, fontWeight = FontWeight.Bold)
                            Text("$warningCount W", fontSize = 10.sp, color = StatusWarning, fontWeight = FontWeight.Bold)
                            Text("$criticalCount C", fontSize = 10.sp, color = StatusCritical, fontWeight = FontWeight.Bold)
                        }
                    }

                    // PUE & Power
                    CyberCard(
                        modifier = Modifier.weight(1f),
                        borderColor = BorderStroke
                    ) {
                        Text("HIỆU SUẤT PUE", fontSize = 11.sp, color = TextSecondary, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "1.28",
                            style = MaterialTheme.typography.headlineMedium,
                            color = PrimaryCyan,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "Tổng: 2.35 kW",
                            fontSize = 10.sp,
                            color = PowerColor,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Active Alerts
                    CyberCard(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onNavigateToAlerts() },
                        borderColor = if (openAlertsCount > 0) StatusCritical.copy(alpha = 0.6f) else BorderStroke
                    ) {
                        Text("CẢNH BÁO", fontSize = 11.sp, color = TextSecondary, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "$openAlertsCount",
                            style = MaterialTheme.typography.headlineMedium,
                            color = if (openAlertsCount > 0) StatusCritical else StatusHealthy,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = if (openAlertsCount > 0) "Cần xử lý ngay" else "Hạ tầng ổn định",
                            fontSize = 10.sp,
                            color = if (openAlertsCount > 0) StatusCritical else StatusHealthy,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Assigned Maintenance Tickets Section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "PHIẾU BẢO TRÌ ĐƯỢC GIAO (${assignedTickets.size})",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    TextButton(onClick = onNavigateToTickets) {
                        Text("Xem tất cả", color = PrimaryCyan, fontSize = 12.sp)
                    }
                }
            }

            if (assignedTickets.isEmpty()) {
                item {
                    CyberCard(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = StatusHealthy)
                            Text(
                                "Không có phiếu bảo trì nào đang chờ xử lý.",
                                fontSize = 13.sp,
                                color = TextSecondary
                            )
                        }
                    }
                }
            } else {
                items(assignedTickets.take(2)) { ticket ->
                    CyberCard(
                        modifier = Modifier.fillMaxWidth(),
                        borderColor = when (ticket.priority) {
                            TicketPriority.EMERGENCY -> StatusCritical.copy(alpha = 0.6f)
                            TicketPriority.HIGH -> Color(0xFFFF6D00).copy(alpha = 0.5f)
                            else -> BorderStroke
                        },
                        onClick = { onNavigateToTicketDetail(ticket.id) }
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                PriorityBadge(ticket.priority)
                                TicketStatusBadge(ticket.status)
                            }
                            Text(
                                text = "Tủ: ${ticket.rackCode}",
                                fontSize = 11.sp,
                                color = TextSecondary,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = ticket.title,
                            style = MaterialTheme.typography.titleSmall,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Máy chủ: ${ticket.nodeName} (${ticket.roomName})",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }
            }

            // Live Telemetry Nodes Section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "GIÁM SÁT MÁY CHỦ THỜI GIAN THỰC (${nodes.size})",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                    if (user?.role == UserRole.ADMIN) {
                        Button(
                            onClick = { showCreateServerDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Thêm Máy Chủ", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }
            }

            items(nodes) { node ->
                val telem = node.currentTelemetry
                CyberCard(
                    modifier = Modifier.fillMaxWidth(),
                    borderColor = when (telem.status) {
                        NodeHealthStatus.CRITICAL -> StatusCritical.copy(alpha = 0.5f)
                        NodeHealthStatus.WARNING -> StatusWarning.copy(alpha = 0.5f)
                        else -> BorderStroke
                    },
                    onClick = { onNavigateToNodeDetail(node.id) }
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .padding(end = 8.dp)
                        ) {
                            Text(
                                text = node.name,
                                style = MaterialTheme.typography.titleSmall,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "${node.ipAddress} • Tủ U${node.rackUnitPosition} (${node.unitHeight}U) • Tag: ${node.markerCode}",
                                fontSize = 11.sp,
                                color = TextSecondary,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        StatusBadge(status = telem.status)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        MetricItem(label = "CPU", value = "${telem.cpuUsagePercent}%", color = CpuColor)
                        MetricItem(label = "RAM", value = "${telem.memoryUsagePercent}%", color = RamColor)
                        MetricItem(label = "NHIỆT ĐỘ", value = "${telem.temperatureCelsius}°C", color = if (telem.temperatureCelsius > 75) StatusCritical else TempColor)
                        MetricItem(label = "NGUỒN", value = "${telem.powerWatts} W", color = PowerColor)
                        MetricItem(label = "DOCKER", value = "${node.containers.count { it.state == ContainerState.RUNNING }}/${node.containers.size}", color = PrimaryCyan)
                    }
                }
            }
        }
    }

    if (showCreateServerDialog) {
        CreateServerDialog(
            onDismiss = { showCreateServerDialog = false },
            onServerCreated = { newNode ->
                scope.launch {
                    repository.addNode(newNode)
                    showCreateServerDialog = false
                }
            }
        )
    }
}

@Composable
fun CreateServerDialog(
    onDismiss: () -> Unit,
    onServerCreated: (ServerNode) -> Unit
) {
    var serverName by remember { mutableStateOf("SRV-APP-CLUSTER-03") }
    var nodeId by remember { mutableStateOf("srv-app-cluster-03") }
    var ipAddress by remember { mutableStateOf("192.168.1.55") }
    var selectedRackId by remember { mutableStateOf("rack-a1") }
    var unitPosition by remember { mutableStateOf("9") }
    var unitHeight by remember { mutableStateOf("2") }
    var powerRatingWatts by remember { mutableStateOf("320") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.Dns, contentDescription = null, tint = PrimaryCyan)
                Text(
                    text = "Khởi tạo Máy Chủ Mới (Admin)",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(androidx.compose.foundation.rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (errorMessage != null) {
                    Text(
                        text = errorMessage ?: "",
                        color = StatusCritical,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                OutlinedTextField(
                    value = serverName,
                    onValueChange = {
                        serverName = it
                        nodeId = it.trim().lowercase().replace(" ", "-").replace("_", "-")
                    },
                    label = { Text("Tên Máy Chủ") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = nodeId,
                    onValueChange = { nodeId = it },
                    label = { Text("Node ID (Định danh)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = ipAddress,
                    onValueChange = { ipAddress = it },
                    label = { Text("Địa chỉ IP") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // Rack Selector
                Text("Chọn Tủ Rack:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf("rack-a1" to "RACK A1", "rack-a2" to "RACK A2", "rack-b1" to "RACK B1").forEach { (rid, rlabel) ->
                        val isSelected = selectedRackId == rid
                        Surface(
                            onClick = { selectedRackId = rid },
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) PrimaryCyan.copy(alpha = 0.15f) else SurfaceCard,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (isSelected) PrimaryCyan else BorderStroke
                            ),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = rlabel,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) PrimaryCyan else TextSecondary,
                                modifier = Modifier.padding(vertical = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = unitPosition,
                        onValueChange = { unitPosition = it },
                        label = { Text("Vị trí U (Slot)") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = unitHeight,
                        onValueChange = { unitHeight = it },
                        label = { Text("Độ cao U") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                OutlinedTextField(
                    value = powerRatingWatts,
                    onValueChange = { powerRatingWatts = it },
                    label = { Text("Công suất định mức (W)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Text(
                    text = "Mã AR Tag: ar-imms://node/$nodeId",
                    fontSize = 11.sp,
                    color = PrimaryCyan,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (serverName.isBlank() || nodeId.isBlank() || ipAddress.isBlank()) {
                        errorMessage = "Vui lòng nhập đầy đủ thông tin máy chủ"
                        return@Button
                    }
                    val newNode = ServerNode(
                        id = nodeId.trim(),
                        name = serverName.trim(),
                        ipAddress = ipAddress.trim(),
                        rackId = selectedRackId,
                        rackUnitPosition = unitPosition.toIntOrNull() ?: 1,
                        unitHeight = unitHeight.toIntOrNull() ?: 1,
                        markerCode = "ar-imms://node/${nodeId.trim()}",
                        model = "Dell PowerEdge R750 Enterprise",
                        cpuModel = "Intel Xeon Platinum 8380 2.3GHz (32 Cores)",
                        totalCores = 32,
                        totalRamGb = 64,
                        totalDiskGb = 2000,
                        osName = "Ubuntu Server 22.04 LTS",
                        currentTelemetry = TelemetryMetric(
                            nodeId = nodeId.trim(),
                            timestamp = System.currentTimeMillis(),
                            cpuUsagePercent = 22.0,
                            memoryUsagePercent = 35.0,
                            memoryUsedGb = 22.4,
                            memoryTotalGb = 64.0,
                            diskUsagePercent = 18.0,
                            temperatureCelsius = 36.5,
                            networkInKbps = 1200.0,
                            networkOutKbps = 2100.0,
                            powerWatts = powerRatingWatts.toDoubleOrNull() ?: 280.0,
                            fanSpeedRpm = 4200,
                            status = NodeHealthStatus.HEALTHY
                        ),
                        containers = listOf(
                            ContainerWorkload(
                                id = "c-${nodeId.trim()}-01",
                                name = "core-service",
                                image = "ar-imms/node-worker:latest",
                                state = ContainerState.RUNNING,
                                cpuPercent = 10.5,
                                memoryUsageMb = 512.0,
                                memoryLimitMb = 4096.0,
                                uptimeSeconds = 1200
                            )
                        )
                    )
                    onServerCreated(newNode)
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan)
            ) {
                Text("Tạo Máy Chủ", fontWeight = FontWeight.Bold, color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Hủy", color = TextSecondary)
            }
        },
        containerColor = SurfaceDark
    )
}

@Composable
fun MetricItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, fontSize = 10.sp, color = TextSecondary, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            fontSize = 12.sp,
            color = color,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
    }
}
