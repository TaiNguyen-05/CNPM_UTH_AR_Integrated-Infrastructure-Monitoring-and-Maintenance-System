package com.arimms.app.presentation.screens.node_detail

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.ContainerState
import com.arimms.app.domain.model.ContainerWorkload
import com.arimms.app.domain.model.NodeHealthStatus
import com.arimms.app.domain.model.ServerNode
import com.arimms.app.domain.model.TelemetryMetric
import com.arimms.app.presentation.components.*
import com.arimms.app.presentation.theme.*
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NodeDetailScreen(
    nodeId: String,
    onNavigateBack: () -> Unit,
    onNavigateToTickets: () -> Unit
) {
    val repository = ARImmsApp.instance.repository
    val scope = rememberCoroutineScope()

    var node by remember { mutableStateOf<ServerNode?>(null) }
    var historicalMetrics by remember { mutableStateOf<List<TelemetryMetric>>(emptyList()) }
    var pingLatency by remember { mutableStateOf<Long?>(null) }
    var isPinging by remember { mutableStateOf(false) }

    // Dialog State for Safe Restart
    var containerToRestart by remember { mutableStateOf<ContainerWorkload?>(null) }
    var showRestartDialog by remember { mutableStateOf(false) }

    LaunchedEffect(nodeId) {
        repository.getNodeById(nodeId).onSuccess {
            node = it
        }
        historicalMetrics = repository.getHistoricalMetrics(nodeId)
    }

    LaunchedEffect(nodeId) {
        repository.streamNodeTelemetry(nodeId).collectLatest { telem ->
            node = node?.copy(currentTelemetry = telem)
            historicalMetrics = (historicalMetrics + telem).takeLast(40)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = node?.name ?: "Chi tiết Máy chủ",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "IP: ${node?.ipAddress ?: "--"} • Tag: ${node?.markerCode ?: "--"}",
                            fontSize = 11.sp,
                            color = TextSecondary,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                actions = {
                    node?.let { n ->
                        StatusBadge(status = n.currentTelemetry.status, modifier = Modifier.padding(end = 12.dp))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceDark)
            )
        },
        containerColor = BgDark
    ) { paddingValues ->
        node?.let { serverNode ->
            val telem = serverNode.currentTelemetry

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                // Real-time Gauges Row
                item {
                    CyberCard(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "THÔNG SỐ HOẠT ĐỘNG THỜI GIAN THỰC",
                            fontSize = 12.sp,
                            color = TextSecondary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(14.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            MetricGauge(label = "CPU", value = telem.cpuUsagePercent, accentColor = CpuColor)
                            MetricGauge(label = "RAM", value = telem.memoryUsagePercent, accentColor = RamColor)
                            MetricGauge(
                                label = "NHIỆT ĐỘ",
                                value = telem.temperatureCelsius,
                                unit = "°C",
                                maxValue = 100.0,
                                accentColor = if (telem.temperatureCelsius > 75) StatusCritical else TempColor
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        Divider(color = BorderStroke)
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("BỘ NHỚ RAM ĐANG DÙNG", fontSize = 10.sp, color = TextSecondary)
                                Text("${telem.memoryUsedGb} / ${serverNode.totalRamGb} GB", fontSize = 12.sp, color = TextPrimary, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                            }
                            Column {
                                Text("LƯU LƯỢNG MẠNG (IN/OUT)", fontSize = 10.sp, color = TextSecondary)
                                Text("${telem.networkInKbps} / ${telem.networkOutKbps} Kbps", fontSize = 12.sp, color = NetColor, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                            }
                            Column {
                                Text("TỐC ĐỘ QUẠT", fontSize = 10.sp, color = TextSecondary)
                                Text("${telem.fanSpeedRpm} RPM", fontSize = 12.sp, color = PowerColor, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace)
                            }
                        }
                    }
                }

                // Historical Telemetry Sparkline Charts
                item {
                    CyberCard(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "LỊCH SỬ BIẾN THIÊN CPU (%)",
                                fontSize = 12.sp,
                                color = TextSecondary,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${telem.cpuUsagePercent}%",
                                fontSize = 12.sp,
                                color = CpuColor,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        MiniSparkline(
                            metrics = historicalMetrics,
                            valueSelector = { it.cpuUsagePercent },
                            lineColor = CpuColor
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "LỊCH SỬ BIẾN THIÊN NHIỆT ĐỘ CHASSIS (°C)",
                                fontSize = 12.sp,
                                color = TextSecondary,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${telem.temperatureCelsius}°C",
                                fontSize = 12.sp,
                                color = if (telem.temperatureCelsius > 75) StatusCritical else TempColor,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        MiniSparkline(
                            metrics = historicalMetrics,
                            valueSelector = { it.temperatureCelsius },
                            lineColor = if (telem.temperatureCelsius > 75) StatusCritical else TempColor
                        )
                    }
                }

                // Quick Field Operations / Safe Remote Actions
                item {
                    Text(
                        text = "THAO TÁC TẠI HIỆN TRƯỜNG & ĐIỀU KHIỂN",
                        style = MaterialTheme.typography.titleSmall,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Blink Chassis LED
                        Button(
                            onClick = {
                                scope.launch {
                                    val res = repository.toggleNodeLed(serverNode.id)
                                    if (res.isSuccess) {
                                        node = node?.copy(isBlinkingLed = res.getOrDefault(false))
                                    }
                                }
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (serverNode.isBlinkingLed) StatusWarning else SurfaceCard,
                                contentColor = if (serverNode.isBlinkingLed) BgDark else TextPrimary
                            ),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (serverNode.isBlinkingLed) StatusWarning else BorderStroke),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Lightbulb, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (serverNode.isBlinkingLed) "TẮT LED" else "NHÁY LED",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Ping Network Test
                        Button(
                            onClick = {
                                isPinging = true
                                scope.launch {
                                    val res = repository.pingNode(serverNode.id)
                                    pingLatency = res.getOrNull()
                                    isPinging = false
                                }
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SurfaceCard,
                                contentColor = PrimaryCyan
                            ),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderStroke),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            if (isPinging) {
                                CircularProgressIndicator(modifier = Modifier.size(14.dp), color = PrimaryCyan, strokeWidth = 2.dp)
                            } else {
                                Icon(Icons.Default.NetworkCheck, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (pingLatency != null) "${pingLatency}ms" else "PING TEST",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                // Docker Workloads Container Section
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "DOCKER CONTAINERS (${serverNode.containers.size})",
                            style = MaterialTheme.typography.titleSmall,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                items(serverNode.containers) { container ->
                    CyberCard(
                        modifier = Modifier.fillMaxWidth(),
                        borderColor = if (container.state == ContainerState.CRASHED) StatusCritical.copy(alpha = 0.5f) else BorderStroke
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = container.name,
                                    style = MaterialTheme.typography.titleSmall,
                                    color = TextPrimary,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Image: ${container.image}",
                                    fontSize = 11.sp,
                                    color = TextSecondary,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = "Ports: ${container.portMappings.joinToString(", ")} • RAM: ${container.memoryUsageMb.toInt()} MB",
                                    fontSize = 10.sp,
                                    color = TextTertiary
                                )
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Surface(
                                    color = if (container.state == ContainerState.RUNNING) StatusHealthyBg else StatusCriticalBg,
                                    shape = RoundedCornerShape(6.dp),
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        if (container.state == ContainerState.RUNNING) StatusHealthy.copy(alpha = 0.5f) else StatusCritical.copy(alpha = 0.5f)
                                    )
                                ) {
                                    Text(
                                        text = container.state.name,
                                        fontSize = 10.sp,
                                        color = if (container.state == ContainerState.RUNNING) StatusHealthy else StatusCritical,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }

                                // Restart Button
                                IconButton(
                                    onClick = {
                                        containerToRestart = container
                                        showRestartDialog = true
                                    }
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.RestartAlt,
                                        contentDescription = "Restart",
                                        tint = if (container.state == ContainerState.CRASHED) StatusCritical else PrimaryCyan
                                    )
                                }
                            }
                        }
                    }
                }

                // Hardware Specifications Card
                item {
                    Text(
                        text = "THÔNG SỐ PHẦN CỨNG & ĐỊNH DANH",
                        style = MaterialTheme.typography.titleSmall,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                }

                item {
                    CyberCard(modifier = Modifier.fillMaxWidth()) {
                        SpecRow("Model Máy chủ", serverNode.model)
                        SpecRow("Vi xử lý (CPU)", serverNode.cpuModel)
                        SpecRow("Tổng RAM", "${serverNode.totalRamGb} GB ECC")
                        SpecRow("Dung lượng Lưu trữ", "${serverNode.totalDiskGb} GB NVMe/SSD")
                        SpecRow("Hệ điều hành (OS)", serverNode.osName)
                        SpecRow("Vị trí trong Tủ", "Rack ${serverNode.rackId.uppercase()} / U${serverNode.rackUnitPosition} (${serverNode.unitHeight}U)")
                        SpecRow("Mã Tag Marker AR", serverNode.markerCode)
                    }
                }
            }
        } ?: run {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = PrimaryCyan)
            }
        }

        // 2-Step Safety Restart Dialog
        if (showRestartDialog && containerToRestart != null) {
            SafetyConfirmDialog(
                title = "XÁC NHẬN KHỞI ĐỘNG LẠI CONTAINER",
                message = "Bạn có chắc chắn muốn gửi tín hiệu Restart đến dịch vụ '${containerToRestart!!.name}' trên máy chủ ${node?.name}? Thao tác này sẽ gián đoạn lưu lượng mạng tạm thời và được ghi vào Nhật ký Audit Log.",
                confirmActionText = "KHỞI ĐỘNG LẠI DỊCH VỤ",
                isDestructive = true,
                onConfirm = {
                    showRestartDialog = false
                    val c = containerToRestart!!
                    scope.launch {
                        repository.restartContainer(nodeId, c.id)
                        repository.getNodeById(nodeId).onSuccess { node = it }
                    }
                },
                onDismiss = { showRestartDialog = false }
            )
        }
    }
}

@Composable
fun SpecRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontSize = 12.sp, color = TextSecondary)
        Text(value, fontSize = 12.sp, color = TextPrimary, fontWeight = FontWeight.Medium, fontFamily = FontFamily.Monospace)
    }
}
