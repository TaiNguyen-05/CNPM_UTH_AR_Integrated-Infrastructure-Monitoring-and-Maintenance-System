package com.arimms.app.presentation.screens.tickets

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.MaintenanceTicket
import com.arimms.app.domain.model.TicketStatus
import com.arimms.app.presentation.components.CyberCard
import com.arimms.app.presentation.components.PriorityBadge
import com.arimms.app.presentation.components.TicketStatusBadge
import com.arimms.app.presentation.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TicketDetailScreen(
    ticketId: String,
    onNavigateBack: () -> Unit,
    onNavigateToNodeDetail: (String) -> Unit
) {
    val repository = ARImmsApp.instance.repository
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var ticket by remember { mutableStateOf<MaintenanceTicket?>(null) }
    var rootCauseText by remember { mutableStateOf("") }
    var resolutionText by remember { mutableStateOf("") }
    var isSaving by remember { mutableStateOf(false) }

    LaunchedEffect(ticketId) {
        repository.getTicketById(ticketId).onSuccess {
            ticket = it
            rootCauseText = it?.rootCauseNotes ?: ""
            resolutionText = it?.resolutionNotes ?: ""
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = ticket?.id ?: "Chi tiết Phiếu",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Tiến độ xử lý sự cố tại hiện trường",
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
        ticket?.let { currentTicket ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Status Header Card
                CyberCard(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            PriorityBadge(currentTicket.priority)
                            TicketStatusBadge(currentTicket.status)
                        }
                        Text(
                            text = "Tủ: ${currentTicket.rackCode}",
                            fontSize = 12.sp,
                            color = PrimaryCyan,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = currentTicket.title,
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = currentTicket.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    Divider(color = BorderStroke)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("MÁY CHỦ LIÊN QUAN", fontSize = 10.sp, color = TextSecondary)
                            Text(currentTicket.nodeName, fontSize = 12.sp, color = TextPrimary, fontWeight = FontWeight.Bold)
                        }
                        Button(
                            onClick = { onNavigateToNodeDetail(currentTicket.nodeId) },
                            colors = ButtonDefaults.buttonColors(containerColor = SurfaceDark, contentColor = PrimaryCyan),
                            border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryCyan.copy(alpha = 0.5f)),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Xem Máy chủ", fontSize = 11.sp)
                        }
                    }
                }

                // Technician Field Worklog Input
                CyberCard(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "GHI CHÚ HIỆN TRƯỜNG & CHẨN ĐOÁN NGUYÊN NHÂN",
                        style = MaterialTheme.typography.titleSmall,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = rootCauseText,
                        onValueChange = { rootCauseText = it },
                        label = { Text("Nguyên nhân sự cố (Root Cause)") },
                        placeholder = { Text("Ví dụ: Bụi bám khe tản nhiệt, quạt số 2 bị kẹt, RAM lỗi...") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryCyan,
                            unfocusedBorderColor = BorderStroke,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedLabelColor = PrimaryCyan,
                            unfocusedLabelColor = TextSecondary
                        ),
                        minLines = 2,
                        maxLines = 4,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = resolutionText,
                        onValueChange = { resolutionText = it },
                        label = { Text("Biện pháp khắc phục & Kết quả (Resolution)") },
                        placeholder = { Text("Ví dụ: Đã vệ sinh quạt, thay keo tản nhiệt, nhiệt độ giảm còn 42°C...") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryCyan,
                            unfocusedBorderColor = BorderStroke,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedLabelColor = PrimaryCyan,
                            unfocusedLabelColor = TextSecondary
                        ),
                        minLines = 2,
                        maxLines = 4,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Action Workflow Buttons
                when (currentTicket.status) {
                    TicketStatus.OPEN, TicketStatus.ASSIGNED -> {
                        Button(
                            onClick = {
                                scope.launch {
                                    isSaving = true
                                    repository.checkInTicket(currentTicket.id).onSuccess {
                                        ticket = it
                                        Toast.makeText(context, "Đã Check-in & bắt đầu xử lý!", Toast.LENGTH_SHORT).show()
                                    }
                                    isSaving = false
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan, contentColor = BgDark),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("BẮT ĐẦU XỬ LÝ (CHECK-IN TẠI TỦ RACK)", fontWeight = FontWeight.Bold)
                        }
                    }
                    TicketStatus.IN_PROGRESS -> {
                        Button(
                            onClick = {
                                if (rootCauseText.isBlank() || resolutionText.isBlank()) {
                                    Toast.makeText(context, "Vui lòng nhập nguyên nhân và biện pháp khắc phục!", Toast.LENGTH_LONG).show()
                                    return@Button
                                }
                                scope.launch {
                                    isSaving = true
                                    repository.resolveTicket(
                                        ticketId = currentTicket.id,
                                        rootCause = rootCauseText.trim(),
                                        resolution = resolutionText.trim(),
                                        photoUri = "https://arimms.io/proofs/${currentTicket.id}.jpg"
                                    ).onSuccess {
                                        ticket = it
                                        Toast.makeText(context, "Đã gửi yêu cầu đóng phiếu thành công!", Toast.LENGTH_SHORT).show()
                                    }
                                    isSaving = false
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = StatusHealthy, contentColor = BgDark),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("HOÀN TẤT & XIN ĐÓNG PHIẾU", fontWeight = FontWeight.Bold)
                        }
                    }
                    TicketStatus.RESOLVED, TicketStatus.CLOSED -> {
                        Surface(
                            color = StatusHealthyBg,
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, StatusHealthy.copy(alpha = 0.5f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = StatusHealthy)
                                Text(
                                    "Phiếu bảo trì này đã hoàn tất và đang chờ Operator duyệt đóng.",
                                    fontSize = 13.sp,
                                    color = StatusHealthy,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        } ?: run {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = PrimaryCyan)
            }
        }
    }
}
