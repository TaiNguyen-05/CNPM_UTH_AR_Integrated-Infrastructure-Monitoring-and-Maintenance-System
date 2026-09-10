package com.arimms.app.presentation.screens.settings

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.User
import com.arimms.app.domain.model.UserRole
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
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
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

            // Admin User Management & User Creation
            if (user?.role == UserRole.ADMIN) {
                var showCreateUserDialog by remember { mutableStateOf(false) }

                CyberCard(
                    modifier = Modifier.fillMaxWidth(),
                    borderColor = PrimaryCyan.copy(alpha = 0.5f)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "QUẢN TRỊ VIÊN: CẤP TÀI KHOẢN",
                                style = MaterialTheme.typography.titleSmall,
                                color = PrimaryCyan,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Tạo và phân quyền tài khoản Kỹ thuật viên / Vận hành viên / Quản trị viên mới",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                        Button(
                            onClick = { showCreateUserDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Tạo User", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }

                if (showCreateUserDialog) {
                    CreateUserDialog(
                        onDismiss = { showCreateUserDialog = false },
                        onUserCreated = { newUser ->
                            preferences.saveRegisteredUser(newUser)
                            Toast.makeText(context, "Đã tạo tài khoản: ${newUser.username} (${newUser.role})", Toast.LENGTH_LONG).show()
                            showCreateUserDialog = false
                        }
                    )
                }
            }

            // Online Mode Information Card
            CyberCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFFDCFCE7)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Wifi,
                            contentDescription = null,
                            tint = Color(0xFF15803D),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "CHẾ ĐỘ TRỰC TUYẾN (ONLINE 100%)",
                            style = MaterialTheme.typography.titleSmall,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Ứng dụng kết nối trực tiếp đến backend REST API và WebSocket để truyền nhận dữ liệu thời gian thực.",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }
            }

            // Backend Server Configuration
            CyberCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "CẤU HÌNH MÁY CHỦ BACKEND & SOCKET.IO",
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
                        unfocusedLabelColor = TextSecondary,
                        unfocusedContainerColor = SurfaceElevated,
                        focusedContainerColor = Color.White
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
                        "Wi-Fi LAN" to "http://192.168.1.15:9999",
                        "USB/ADB" to "http://localhost:9999",
                        "Emulator" to "http://10.0.2.2:9999",
                        "Cloud" to "https://ar-imms-monitor.vercel.app"
                    ).forEach { (label, url) ->
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .clickable { serverUrl = url },
                            color = SurfaceElevated,
                            border = androidx.compose.foundation.BorderStroke(1.dp, BorderStroke)
                        ) {
                            Text(
                                text = label,
                                fontSize = 10.sp,
                                color = PrimaryCyan,
                                fontFamily = FontFamily.SansSerif,
                                fontWeight = FontWeight.Bold,
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
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan, contentColor = Color.White),
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
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceElevated, contentColor = PrimaryCyan),
                        border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryCyan.copy(alpha = 0.4f)),
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
                colors = ButtonDefaults.buttonColors(containerColor = StatusCriticalBg, contentColor = StatusCritical),
                border = androidx.compose.foundation.BorderStroke(1.dp, StatusCritical.copy(alpha = 0.4f)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null, tint = StatusCritical)
                Spacer(modifier = Modifier.width(8.dp))
                Text("ĐĂNG XUẤT KHỎI HỆ THỐNG", fontWeight = FontWeight.Bold, color = StatusCritical)
            }
        }
    }
}

@Composable
fun CreateUserDialog(
    onDismiss: () -> Unit,
    onUserCreated: (com.arimms.app.domain.model.User) -> Unit
) {
    var fullName by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("123456") }
    var selectedRole by remember { mutableStateOf(com.arimms.app.domain.model.UserRole.TECHNICIAN) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.PersonAdd, contentDescription = null, tint = PrimaryCyan)
                Text("Cấp Tài Khoản Người Dùng Mới", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
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
                    Text(errorMessage ?: "", color = StatusCritical, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                OutlinedTextField(
                    value = fullName,
                    onValueChange = { fullName = it },
                    label = { Text("Họ và Tên") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Tên Đăng Nhập (Username)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email liên kết") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Mật khẩu ban đầu") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Vai trò (Phân quyền):", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    com.arimms.app.domain.model.UserRole.values().forEach { role ->
                        val isSelected = selectedRole == role
                        Surface(
                            onClick = { selectedRole = role },
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) PrimaryCyan.copy(alpha = 0.15f) else SurfaceElevated,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) PrimaryCyan else BorderStroke),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = role.name,
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) PrimaryCyan else TextSecondary,
                                modifier = Modifier.padding(vertical = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (fullName.isBlank() || username.isBlank() || email.isBlank()) {
                        errorMessage = "Vui lòng điền đủ họ tên, username và email"
                        return@Button
                    }
                    val newUser = User(
                        id = "usr-${System.currentTimeMillis()}",
                        username = username.trim(),
                        email = email.trim(),
                        fullName = fullName.trim(),
                        role = selectedRole
                    )
                    onUserCreated(newUser)
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryCyan)
            ) {
                Text("Tạo Tài Khoản", fontWeight = FontWeight.Bold, color = Color.White)
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
