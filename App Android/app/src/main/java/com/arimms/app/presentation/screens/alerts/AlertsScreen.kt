package com.arimms.app.presentation.screens.alerts

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.AlertSeverity
import com.arimms.app.domain.model.AlertState
import com.arimms.app.domain.model.SystemAlert
import com.arimms.app.presentation.components.CyberCard
import com.arimms.app.presentation.components.SeverityBadge
import com.arimms.app.presentation.theme.*
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToNodeDetail: (String) -> Unit
) {
    val repository = ARImmsApp.instance.repository
    val scope = rememberCoroutineScope()

    var alerts by remember { mutableStateOf<List<SystemAlert>>(emptyList()) }
    var selectedSeverity by remember { mutableStateOf<AlertSeverity?>(null) }

    LaunchedEffect(Unit) {
        repository.streamAlerts().collectLatest {
            alerts = it
        }
    }

    val filteredAlerts = if (selectedSeverity != null) {
        alerts.filter { it.severity == selectedSeverity }
    } else {
        alerts
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "CẢNH BÁO HẠ TẦNG THỜI GIAN THỰC",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = PrimaryCyan,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Hệ thống phát hiện bất thường & ngưỡng quá tải",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceDark)
            )
        },
        containerColor = BgDark
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // Severity Filter Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        FilterChip(
                            selected = selectedSeverity == null,
                            onClick = { selectedSeverity = null },
                            label = { Text("Tất cả (${alerts.size})") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = PrimaryCyan.copy(alpha = 0.2f),
                                selectedLabelColor = PrimaryCyan,
                                containerColor = SurfaceCard,
                                labelColor = TextSecondary
                            )
                        )
                    }
                    listOf(
                        AlertSeverity.CRITICAL to "Nghiêm trọng (Critical)",
                        AlertSeverity.WARNING to "Cảnh báo (Warning)"
                    ).forEach { (sev, label) ->
                        val count = alerts.count { it.severity == sev }
                        item {
                            FilterChip(
                                selected = selectedSeverity == sev,
                                onClick = { selectedSeverity = if (selectedSeverity == sev) null else sev },
                                label = { Text("$label ($count)") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = if (sev == AlertSeverity.CRITICAL) StatusCritical.copy(alpha = 0.2f) else StatusWarning.copy(alpha = 0.2f),
                                    selectedLabelColor = if (sev == AlertSeverity.CRITICAL) StatusCritical else StatusWarning,
                                    containerColor = SurfaceCard,
                                    labelColor = TextSecondary
                                )
                            )
                        }
                    }
                }
            }

            if (filteredAlerts.isEmpty()) {
                item {
                    CyberCard(modifier = Modifier.fillMaxWidth()) {
                        Text("Không có cảnh báo nào trong danh mục này.", color = TextSecondary, fontSize = 13.sp)
                    }
                }
            } else {
                items(filteredAlerts) { alert ->
                    val isCritical = alert.severity == AlertSeverity.CRITICAL

                    CyberCard(
                        modifier = Modifier.fillMaxWidth(),
                        borderColor = if (isCritical) StatusCritical.copy(alpha = 0.6f) else StatusWarning.copy(alpha = 0.5f)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                SeverityBadge(severity = alert.severity)
                                Surface(
                                    color = if (alert.state == AlertState.OPEN) Color(0x33FF1744) else Color(0x3300E676),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = alert.state.name,
                                        fontSize = 10.sp,
                                        color = if (alert.state == AlertState.OPEN) StatusCritical else StatusHealthy,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Text(
                                text = "Tủ: ${alert.rackId.uppercase()}",
                                fontSize = 11.sp,
                                color = TextSecondary,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = alert.title,
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = alert.message,
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )

                        Spacer(modifier = Modifier.height(12.dp))
                        Divider(color = BorderStroke)
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Nguồn: ${alert.nodeName}",
                                fontSize = 11.sp,
                                color = TextTertiary
                            )

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                if (alert.state == AlertState.OPEN) {
                                    Button(
                                        onClick = {
                                            scope.launch {
                                                repository.acknowledgeAlert(alert.id)
                                            }
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceDark, contentColor = PrimaryCyan),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryCyan.copy(alpha = 0.5f)),
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                    ) {
                                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Xác nhận đã biết", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                Button(
                                    onClick = { onNavigateToNodeDetail(alert.nodeId) },
                                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan, contentColor = BgDark),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                                ) {
                                    Text("Xem Máy chủ", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
