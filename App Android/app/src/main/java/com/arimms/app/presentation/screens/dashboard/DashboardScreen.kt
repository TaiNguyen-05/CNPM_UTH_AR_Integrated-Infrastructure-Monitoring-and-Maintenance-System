package com.arimms.app.presentation.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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

    var nodes by remember { mutableStateOf<List<ServerNode>>(emptyList()) }
    var alerts by remember { mutableStateOf<List<SystemAlert>>(emptyList()) }
    var tickets by remember { mutableStateOf<List<MaintenanceTicket>>(emptyList()) }

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
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, PrimaryCyan.copy(alpha = 0.7f)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.horizontalGradient(
                                    listOf(Color(0xFF0F2B48), Color(0xFF13233F))
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
                                    .border(2.dp, Color.White.copy(alpha = 0.5f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.QrCodeScanner,
                                    contentDescription = "Scan AR",
                                    tint = BgDark,
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
                        text = "GIÁM SÁT MÁY CHỦ THỜI GIAN THỰC",
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
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
                        Column {
                            Text(
                                text = node.name,
                                style = MaterialTheme.typography.titleSmall,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )
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
