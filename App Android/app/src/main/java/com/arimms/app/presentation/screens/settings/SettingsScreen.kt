package com.arimms.app.presentation.screens.settings

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arimms.app.ARImmsApp
import com.arimms.app.presentation.components.CyberCard
import com.arimms.app.presentation.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onLogout: () -> Unit
) {
    val repository = ARImmsApp.instance.repository
    val preferences = ARImmsApp.instance.preferences
    val apiClient = ARImmsApp.instance.apiClient
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var isDemoMode by remember { mutableStateOf(preferences.isDemoMode) }
    var serverUrl by remember { mutableStateOf(preferences.serverUrl) }
    var isTestingConnection by remember { mutableStateOf(false) }
    var connectionResult by remember { mutableStateOf<String?>(null) }
    val user = repository.getCurrentUser()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "CẤU HÌNH HỆ THỐNG & KẾT NỐI",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Cài đặt máy chủ NestJS & chế độ hoạt động",
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // User Profile Card
            CyberCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = null,
                        tint = PrimaryCyan,
                        modifier = Modifier.size(48.dp)
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = user?.fullName ?: "Chưa đăng nhập",
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Vai trò: ${user?.role?.name ?: "N/A"} • ${user?.email ?: ""}",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }
            }

            // Operation Mode Section (Demo vs Live Backend)
            CyberCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "CHẾ ĐỘ HOẠT ĐỘNG",
                    style = MaterialTheme.typography.titleSmall,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Mô phỏng Offline (Demo Simulator)",
                            style = MaterialTheme.typography.bodyLarge,
                            color = TextPrimary,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Sinh dữ liệu Telemetry liên tục (CPU, RAM, Temp, Quạt, Ticket) độc lập, không phụ thuộc mạng.",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
                    Switch(
                        checked = isDemoMode,
                        onCheckedChange = {
                            isDemoMode = it
                            repository.setDemoMode(it)
                            Toast.makeText(context, if (it) "Đã bật chế độ Demo Simulator" else "Đã chuyển sang kết nối Live Backend", Toast.LENGTH_SHORT).show()
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = BgDark,
                            checkedTrackColor = StatusHealthy
                        )
                    )
                }
            }

            // Backend Server Configuration
            CyberCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "CẤU HÌNH MÁY CHỦ NESTJS & SOCKET.IO",
                    style = MaterialTheme.typography.titleSmall,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = serverUrl,
                    onValueChange = { serverUrl = it },
                    label = { Text("URL Máy chủ API Backend") },
                    placeholder = { Text("http://10.0.2.2:3000 hoặc IP máy chủ") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryCyan,
                        unfocusedBorderColor = BorderStroke,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedLabelColor = PrimaryCyan,
                        unfocusedLabelColor = TextSecondary
                    ),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Presets
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf(
                        "10.0.2.2:3000" to "http://10.0.2.2:3000",
                        "localhost:3000" to "http://localhost:3000",
                        "192.168.1.100" to "http://192.168.1.100:3000"
                    ).forEach { (label, url) ->
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .clickable { serverUrl = url },
                            color = SurfaceDark,
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderStroke)
                        ) {
                            Text(
                                text = label,
                                fontSize = 10.sp,
                                color = PrimaryCyan,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            repository.setServerUrl(serverUrl.trim())
                            Toast.makeText(context, "Đã lưu cấu hình Server URL", Toast.LENGTH_SHORT).show()
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan, contentColor = BgDark),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("LƯU CẤU HÌNH", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            isTestingConnection = true
                            connectionResult = null
                            scope.launch {
                                try {
                                    val res = apiClient.getService().checkHealth()
                                    connectionResult = if (res.isSuccessful) "Kết nối thành công (200 OK)!" else "Máy chủ phản hồi mã lỗi: ${res.code()}"
                                } catch (e: Exception) {
                                    connectionResult = "Lỗi kết nối: ${e.message}"
                                }
                                isTestingConnection = false
                            }
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceDark, contentColor = PrimaryCyan),
                        border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryCyan.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        if (isTestingConnection) {
                            CircularProgressIndicator(modifier = Modifier.size(14.dp), color = PrimaryCyan, strokeWidth = 2.dp)
                        } else {
                            Text("TEST KẾT NỐI", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                if (connectionResult != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = connectionResult!!,
                        fontSize = 11.sp,
                        color = if (connectionResult!!.contains("thành công")) StatusHealthy else StatusCritical,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            // About Project Card
            CyberCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "THÔNG TIN HỆ THỐNG AR-IMMS",
                    style = MaterialTheme.typography.titleSmall,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "AR-Integrated Infrastructure Monitoring & Maintenance System\nHệ thống Giám sát và Bảo trì Cơ sở Hạ tầng Tích hợp Thực tế Tăng cường.",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Phiên bản: 1.0.0 (Native Kotlin + Jetpack Compose)",
                    fontSize = 11.sp,
                    color = PrimaryCyan,
                    fontFamily = FontFamily.Monospace
                )
            }

            // Logout Button
            Button(
                onClick = {
                    scope.launch {
                        repository.logout()
                        onLogout()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard, contentColor = StatusCritical),
                border = androidx.compose.foundation.BorderStroke(1.dp, StatusCritical.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Logout, contentDescription = null, tint = StatusCritical)
                Spacer(modifier = Modifier.width(8.dp))
                Text("ĐĂNG XUẤT KHỎI HỆ THỐNG", fontWeight = FontWeight.Bold, color = StatusCritical)
            }
        }
    }
}
