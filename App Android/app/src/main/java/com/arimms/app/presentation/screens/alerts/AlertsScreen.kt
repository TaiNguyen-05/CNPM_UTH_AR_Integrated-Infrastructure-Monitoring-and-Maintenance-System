package com.arimms.app.presentation.screens.alerts

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.*
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
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var alerts by remember { mutableStateOf<List<SystemAlert>>(emptyList()) }
    var availableUsers by remember { mutableStateOf<List<User>>(emptyList()) }
    var selectedSeverity by remember { mutableStateOf<AlertSeverity?>(null) }

    // Dialog state for dispatching ticket
    var alertToDispatch by remember { mutableStateOf<SystemAlert?>(null) }
    var showDispatchDialog by remember { mutableStateOf(false) }

    // Dialog state for testing simulated alert
    var showTestAlertDialog by remember { mutableStateOf(false) }
    var isSimulating by remember { mutableStateOf(false) }

    // Load initial data & collect real-time streams
    LaunchedEffect(Unit) {
        repository.getAlerts().onSuccess { alerts = it }
        repository.getUsers().onSuccess { availableUsers = it }
    }

    LaunchedEffect(showDispatchDialog) {
        if (showDispatchDialog) {
            repository.getUsers().onSuccess { availableUsers = it }
        }
    }

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
                    Column(verticalArrangement = Arrangement.Center) {
                        Text(
                            text = "CẢNH BÁO HẠ TẦNG THỜI GIAN THỰC",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = PrimaryCyan,
                            letterSpacing = 0.5.sp,
                            maxLines = 1
                        )
                        Text(
                            text = "Hệ thống phát hiện bất thường & quá tải",
                            fontSize = 11.sp,
                            color = TextSecondary,
                            maxLines = 1
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                actions = {
                    // Button to test / simulate machine alert in real time
                    IconButton(
                        onClick = { showTestAlertDialog = true }
                    ) {
                        Icon(
                            Icons.Default.Science,
                            contentDescription = "Test Cảnh Báo",
                            tint = StatusWarning
                        )
                    }
                    IconButton(
                        onClick = {
                            scope.launch {
                                repository.getAlerts().onSuccess {
                                    alerts = it
                                    Toast.makeText(context, "Đã làm mới danh sách cảnh báo", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    ) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = PrimaryCyan
                        )
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
                                selectedContainerColor = PrimaryCyan.copy(alpha = 0.15f),
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
                                    selectedContainerColor = if (sev == AlertSeverity.CRITICAL) StatusCriticalBg else StatusWarningBg,
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
                                    color = if (alert.state == AlertState.OPEN) StatusCriticalBg else StatusHealthyBg,
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

                        // Nguồn máy chủ
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Nguồn: ${alert.nodeName}",
                                fontSize = 11.sp,
                                color = TextTertiary,
                                maxLines = 1,
                                modifier = Modifier.weight(1f, fill = false)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Hàng nút thao tác dàn đều weight, không bị rớt dòng chữ
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Button: Chuyển Phiếu Bảo Trì cho Nhân Viên
                            Button(
                                onClick = {
                                    alertToDispatch = alert
                                    showDispatchDialog = true
                                },
                                modifier = Modifier
                                    .weight(1.15f)
                                    .height(36.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isCritical) StatusCritical.copy(alpha = 0.2f) else PrimaryCyan.copy(alpha = 0.15f),
                                    contentColor = if (isCritical) StatusCritical else PrimaryCyan
                                ),
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isCritical) StatusCritical.copy(alpha = 0.5f) else PrimaryCyan.copy(alpha = 0.5f)
                                ),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                            ) {
                                Icon(Icons.Default.AssignmentInd, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(3.dp))
                                Text("Chuyển Phiếu", fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                            }

                            if (alert.state == AlertState.OPEN) {
                                OutlinedButton(
                                    onClick = {
                                        scope.launch {
                                            repository.acknowledgeAlert(alert.id)
                                            Toast.makeText(context, "Đã tiếp nhận cảnh báo!", Toast.LENGTH_SHORT).show()
                                        }
                                    },
                                    modifier = Modifier
                                        .weight(0.95f)
                                        .height(36.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderStroke),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                                ) {
                                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(13.dp))
                                    Spacer(modifier = Modifier.width(2.dp))
                                    Text("Đã biết", fontSize = 11.sp, maxLines = 1, softWrap = false)
                                }
                            }

                            Button(
                                onClick = { onNavigateToNodeDetail(alert.nodeId) },
                                modifier = Modifier
                                    .weight(0.9f)
                                    .height(36.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan, contentColor = Color.White),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                            ) {
                                Text("Xem Máy", fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                            }
                        }
                    }
                }
            }
        }

        // Dialog: Chuyển Phiếu Bảo Trì Cho Nhân Viên
        if (showDispatchDialog && alertToDispatch != null) {
            val targetAlert = alertToDispatch!!
            DispatchTicketDialog(
                alert = targetAlert,
                users = availableUsers,
                onDismiss = {
                    showDispatchDialog = false
                    alertToDispatch = null
                },
                onConfirm = { technician, priority, notes ->
                    scope.launch {
                        val ticketTitle = "[ĐIỀU PHỐI] Xử lý ${targetAlert.title}"
                        val res = repository.createTicket(
                            nodeId = targetAlert.nodeId,
                            title = ticketTitle,
                            description = notes,
                            priority = priority,
                            alertId = targetAlert.id,
                            assignedUserId = technician.id,
                            assignedUserName = technician.fullName
                        )
                        if (res.isSuccess) {
                            try {
                                repository.acknowledgeAlert(targetAlert.id)
                            } catch (_: Exception) {}
                            repository.getAlerts()
                            repository.getTickets()
                            Toast.makeText(
                                context,
                                "✓ Đã chuyển phiếu bảo trì cho ${technician.fullName} thành công!",
                                Toast.LENGTH_LONG
                            ).show()
                        } else {
                            Toast.makeText(context, "Lỗi tạo phiếu: ${res.exceptionOrNull()?.message}", Toast.LENGTH_SHORT).show()
                        }
                        showDispatchDialog = false
                        alertToDispatch = null
                    }
                }
            )
        }

        // Dialog: Test Kích Hoạt Cảnh Báo Máy Chủ
        if (showTestAlertDialog) {
            SimulateAlertDialog(
                isSimulating = isSimulating,
                onDismiss = { showTestAlertDialog = false },
                onSimulate = { nodeId, metric, value ->
                    scope.launch {
                        isSimulating = true
                        val res = repository.simulateNodeAlert(nodeId, metric, value)
                        if (res.isSuccess) {
                            Toast.makeText(
                                context,
                                "🚀 Đã gửi tín hiệu quá tải ($metric=$value) tới $nodeId! Cảnh báo sẽ xuất hiện trên cả Web và App.",
                                Toast.LENGTH_LONG
                            ).show()
                            repository.getAlerts().onSuccess { alerts = it }
                        } else {
                            Toast.makeText(context, "Không thể gửi dữ liệu test tới Backend", Toast.LENGTH_SHORT).show()
                        }
                        isSimulating = false
                        showTestAlertDialog = false
                    }
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DispatchTicketDialog(
    alert: SystemAlert,
    users: List<User>,
    onDismiss: () -> Unit,
    onConfirm: (technician: User, priority: TicketPriority, notes: String) -> Unit
) {
    val techUsers = users
        .filter { (it.status?.uppercase() ?: "APPROVED") in listOf("APPROVED", "ACTIVE") }
        .ifEmpty { users }

    var selectedTech by remember { mutableStateOf(techUsers.firstOrNull() ?: User("USR-DEFAULT", "tech@arimms.io", "Kỹ thuật viên hệ thống", UserRole.TECHNICIAN, "tech@arimms.io")) }
    var selectedPriority by remember {
        mutableStateOf(
            if (alert.severity == AlertSeverity.CRITICAL) TicketPriority.EMERGENCY else TicketPriority.HIGH
        )
    }
    var notes by remember {
        mutableStateOf("Điều phối khẩn cấp: Yêu cầu kỹ thuật viên kiểm tra máy chủ ${alert.nodeName} tại tủ ${alert.rackId.uppercase()}. Nguyên nhân sơ bộ: ${alert.title}.")
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = SurfaceCard,
            border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryCyan.copy(alpha = 0.5f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
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
                        Icon(Icons.Default.AssignmentInd, contentDescription = null, tint = PrimaryCyan)
                        Text(
                            text = "CHUYỂN PHIẾU BẢO TRÌ",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = TextPrimary
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }

                Surface(
                    color = BgDark,
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderStroke)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text("CẢNH BÁO NGUỒN", fontSize = 10.sp, color = TextTertiary)
                        Text(alert.title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Text("Máy chủ: ${alert.nodeName} • Tủ: ${alert.rackId.uppercase()}", fontSize = 11.sp, color = TextSecondary)
                    }
                }

                // Chọn Kỹ thuật viên từ Database thực tế
                Column {
                    Text("CHỌN KỸ THUẬT VIÊN PHỤ TRÁCH (TỪ DATABASE)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryCyan)
                    Spacer(modifier = Modifier.height(6.dp))
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 160.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        techUsers.forEach { tech ->
                            val isSelected = tech.id == selectedTech.id
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSelected) PrimaryCyan.copy(alpha = 0.15f) else SurfaceElevated,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSelected) PrimaryCyan else BorderStroke
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 3.dp)
                                    .clickable { selectedTech = tech }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        modifier = Modifier.weight(1f, fill = false)
                                    ) {
                                        Icon(
                                            Icons.Default.AccountCircle,
                                            contentDescription = null,
                                            tint = if (isSelected) PrimaryCyan else TextSecondary,
                                            modifier = Modifier.size(22.dp)
                                        )
                                        Column {
                                            Text(
                                                tech.fullName,
                                                fontSize = 12.sp,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                color = TextPrimary,
                                                maxLines = 1
                                            )
                                            Text(
                                                "${tech.role.name} • ${tech.email}",
                                                fontSize = 10.sp,
                                                color = TextSecondary,
                                                maxLines = 1
                                            )
                                        }
                                    }
                                    if (isSelected) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = PrimaryCyan, modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }
                    }
                }

                // Chọn mức độ ưu tiên
                Column {
                    Text("MỨC ĐỘ ƯU TIÊN", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryCyan)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                        listOf(
                            TicketPriority.EMERGENCY to "Khẩn cấp",
                            TicketPriority.HIGH to "Cao",
                            TicketPriority.MEDIUM to "TB"
                        ).forEach { (prio, label) ->
                            val isPrioSelected = selectedPriority == prio
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = if (isPrioSelected) when(prio) {
                                    TicketPriority.EMERGENCY -> StatusCriticalBg
                                    TicketPriority.HIGH -> StatusWarningBg
                                    else -> PrimaryCyan.copy(alpha = 0.2f)
                                } else SurfaceElevated,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isPrioSelected) when(prio) {
                                        TicketPriority.EMERGENCY -> StatusCritical
                                        TicketPriority.HIGH -> StatusWarning
                                        else -> PrimaryCyan
                                    } else BorderStroke
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { selectedPriority = prio }
                            ) {
                                Text(
                                    text = label,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isPrioSelected) when(prio) {
                                        TicketPriority.EMERGENCY -> StatusCritical
                                        TicketPriority.HIGH -> StatusWarning
                                        else -> PrimaryCyan
                                    } else TextSecondary,
                                    modifier = Modifier.padding(vertical = 8.dp),
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            }
                        }
                    }
                }

                // Ghi chú & chỉ đạo
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Ghi chú & Yêu cầu công việc") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryCyan,
                        unfocusedBorderColor = BorderStroke,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedLabelColor = PrimaryCyan,
                        unfocusedLabelColor = TextSecondary,
                        unfocusedContainerColor = SurfaceElevated,
                        focusedContainerColor = SurfaceElevated
                    ),
                    minLines = 2,
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextSecondary),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderStroke),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Hủy", fontSize = 12.sp)
                    }

                    Button(
                        onClick = { onConfirm(selectedTech, selectedPriority, notes) },
                        modifier = Modifier.weight(2f),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan, contentColor = Color.White),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("CHUYỂN PHIẾU", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun SimulateAlertDialog(
    isSimulating: Boolean,
    onDismiss: () -> Unit,
    onSimulate: (nodeId: String, metric: String, value: Double) -> Unit
) {
    var selectedNode by remember { mutableStateOf("a2-unit-03") }
    var selectedFaultType by remember { mutableStateOf("temp") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = SurfaceCard,
            border = androidx.compose.foundation.BorderStroke(1.dp, StatusWarning.copy(alpha = 0.6f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
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
                        Icon(Icons.Default.Science, contentDescription = null, tint = StatusWarning)
                        Text(
                            text = "TEST KÍCH HOẠT CẢNH BÁO MÁY",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Black,
                            color = TextPrimary
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }

                Text(
                    text = "Gửi gói tin telemetry giả lập vượt ngưỡng tới Backend để kiểm tra đồng bộ cảnh báo giữa Web Dashboard và App Mobile.",
                    fontSize = 12.sp,
                    color = TextSecondary
                )

                Column {
                    Text("CHỌN MÁY CHỦ MỤC TIÊU", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryCyan)
                    Spacer(modifier = Modifier.height(6.dp))
                    listOf(
                        "a2-unit-03" to "A2 - Unit 03 (Rack A2)",
                        "SRV-NODE-01" to "SRV-NODE-01 (Rack Alpha)",
                        "SRV-NODE-02" to "SRV-NODE-02 (Rack Alpha)"
                    ).forEach { (id, label) ->
                        val isSelected = selectedNode == id
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) PrimaryCyan.copy(alpha = 0.15f) else SurfaceElevated,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) PrimaryCyan else BorderStroke),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 2.dp)
                                .clickable { selectedNode = id }
                        ) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                color = TextPrimary,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }
                }

                Column {
                    Text("LOẠI SỰ CỐ / NGƯỠNG QUÁ TẢI", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PrimaryCyan)
                    Spacer(modifier = Modifier.height(6.dp))
                    listOf(
                        "temp" to "Quá nhiệt độ Chassis (88.5°C >= 80°C)",
                        "cpu" to "Quá tải CPU Processor (96.0% >= 90%)",
                        "ram" to "Cạn kiệt bộ nhớ RAM (95.0% >= 92%)"
                    ).forEach { (key, label) ->
                        val isSelected = selectedFaultType == key
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) StatusCriticalBg else SurfaceElevated,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) StatusCritical else BorderStroke),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 2.dp)
                                .clickable { selectedFaultType = key }
                        ) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                color = if (isSelected) StatusCritical else TextPrimary,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }
                }

                Button(
                    onClick = {
                        val value = when(selectedFaultType) {
                            "temp" -> 88.5
                            "cpu" -> 96.0
                            "ram" -> 95.0
                            else -> 90.0
                        }
                        onSimulate(selectedNode, selectedFaultType, value)
                    },
                    enabled = !isSimulating,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = StatusCritical, contentColor = Color.White),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    if (isSimulating) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White)
                    } else {
                        Icon(Icons.Default.Bolt, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("BẮN TÍN HIỆU TEST CẢNH BÁO", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

