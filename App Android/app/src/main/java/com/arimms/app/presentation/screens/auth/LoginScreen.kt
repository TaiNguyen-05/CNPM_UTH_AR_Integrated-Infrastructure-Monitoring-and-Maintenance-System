package com.arimms.app.presentation.screens.auth

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Login
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.UserRole
import com.arimms.app.presentation.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class AuthTab {
    LOGIN,
    REGISTER
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val repository = ARImmsApp.instance.repository
    val preferences = ARImmsApp.instance.preferences
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current

    var selectedTab by remember { mutableStateOf(AuthTab.LOGIN) }

    // Login Form State
    var loginUsername by remember { mutableStateOf("operator@ar-imms.dc") }
    var loginPassword by remember { mutableStateOf("123456") }
    var loginRole by remember { mutableStateOf(UserRole.OPERATOR) }
    var isLoginPasswordVisible by remember { mutableStateOf(false) }

    // Register Form State
    var regFullName by remember { mutableStateOf("") }
    var regUsername by remember { mutableStateOf("") }
    var regEmail by remember { mutableStateOf("") }
    var regPassword by remember { mutableStateOf("") }
    var regConfirmPassword by remember { mutableStateOf("") }
    var regRole by remember { mutableStateOf(UserRole.TECHNICIAN) }
    var isRegPasswordVisible by remember { mutableStateOf(false) }
    var isRegConfirmPasswordVisible by remember { mutableStateOf(false) }

    // Common State
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }

    val serverUrl = preferences.serverUrl

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF1F5F9))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // Top App Logo / Icon
            Box(
                modifier = Modifier
                    .size(76.dp)
                    .clip(RoundedCornerShape(22.dp))
                    .background(
                        Brush.linearGradient(listOf(Color(0xFF0284C7), Color(0xFF6366F1)))
                    )
                    .border(2.dp, Color(0xFF38BDF8), RoundedCornerShape(22.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.ViewInAr,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(44.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "AR-IMMS",
                fontSize = 26.sp,
                color = Color(0xFF0369A1),
                fontWeight = FontWeight.Black,
                letterSpacing = 1.5.sp
            )

            Text(
                text = "Hệ thống Giám sát & Quản lý Hạ tầng Thông minh AR",
                fontSize = 13.sp,
                color = Color(0xFF334155),
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 12.dp)
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Server Online Status Pill (Clear, High Contrast)
            Surface(
                color = Color(0xFFE0F2FE),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF0284C7)),
                modifier = Modifier.clip(RoundedCornerShape(20.dp))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onNavigateToSettings() },
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF16A34A))
                        )
                        Text(
                            text = if (serverUrl.contains("vercel.app")) {
                                "MÁY CHỦ CLOUD (VERCEL)"
                            } else {
                                "ONLINE: $serverUrl"
                            },
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0369A1),
                            fontFamily = FontFamily.SansSerif
                        )
                    }

                    // Settings gear icon
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .clickable { onNavigateToSettings() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Cấu hình Server",
                            tint = Color(0xFF475569),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Auth Card
            Surface(
                color = Color.White,
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFFCBD5E1)),
                shadowElevation = 3.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Tab Selector: ĐĂNG NHẬP | ĐĂNG KÝ
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFE2E8F0))
                            .padding(4.dp)
                    ) {
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .clickable {
                                    selectedTab = AuthTab.LOGIN
                                    errorMessage = null
                                    successMessage = null
                                },
                            color = if (selectedTab == AuthTab.LOGIN) Color.White else Color.Transparent,
                            shadowElevation = if (selectedTab == AuthTab.LOGIN) 2.dp else 0.dp
                        ) {
                            Row(
                                modifier = Modifier.padding(vertical = 10.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.Login,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp),
                                    tint = if (selectedTab == AuthTab.LOGIN) Color(0xFF0284C7) else Color(0xFF475569)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "ĐĂNG NHẬP",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selectedTab == AuthTab.LOGIN) Color(0xFF0284C7) else Color(0xFF475569)
                                )
                            }
                        }

                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .clickable {
                                    selectedTab = AuthTab.REGISTER
                                    errorMessage = null
                                    successMessage = null
                                },
                            color = if (selectedTab == AuthTab.REGISTER) Color.White else Color.Transparent,
                            shadowElevation = if (selectedTab == AuthTab.REGISTER) 2.dp else 0.dp
                        ) {
                            Row(
                                modifier = Modifier.padding(vertical = 10.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PersonAdd,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp),
                                    tint = if (selectedTab == AuthTab.REGISTER) Color(0xFF0284C7) else Color(0xFF475569)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "ĐĂNG KÝ",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selectedTab == AuthTab.REGISTER) Color(0xFF0284C7) else Color(0xFF475569)
                                )
                            }
                        }
                    }

                    // Success Banner
                    if (successMessage != null) {
                        Surface(
                            color = Color(0xFFDCFCE7),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF16A34A)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF15803D), modifier = Modifier.size(20.dp))
                                Text(
                                    text = successMessage!!,
                                    color = Color(0xFF15803D),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    // Error Banner (Bold, High Contrast)
                    if (errorMessage != null) {
                        Surface(
                            color = Color(0xFFFEE2E2),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFFDC2626)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.Error, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(22.dp))
                                Text(
                                    text = errorMessage!!,
                                    color = Color(0xFF991B1B),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }

                    // CONTENT FOR LOGIN TAB
                    if (selectedTab == AuthTab.LOGIN) {
                        OutlinedTextField(
                            value = loginUsername,
                            onValueChange = { loginUsername = it },
                            label = { Text("Tên đăng nhập hoặc Email", color = Color(0xFF334155), fontWeight = FontWeight.Medium) },
                            leadingIcon = {
                                Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFF0284C7))
                            },
                            trailingIcon = {
                                if (loginUsername.isNotEmpty()) {
                                    IconButton(onClick = { loginUsername = "" }) {
                                        Icon(Icons.Default.Clear, contentDescription = "Xóa", tint = Color(0xFF64748B))
                                    }
                                }
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF0284C7),
                                unfocusedBorderColor = Color(0xFF94A3B8),
                                focusedTextColor = Color(0xFF0F172A),
                                unfocusedTextColor = Color(0xFF0F172A),
                                focusedLabelColor = Color(0xFF0284C7),
                                unfocusedLabelColor = Color(0xFF334155),
                                unfocusedContainerColor = Color(0xFFF8FAFC),
                                focusedContainerColor = Color.White
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Email,
                                imeAction = ImeAction.Next
                            ),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = loginPassword,
                            onValueChange = { loginPassword = it },
                            label = { Text("Mật khẩu", color = Color(0xFF334155), fontWeight = FontWeight.Medium) },
                            leadingIcon = {
                                Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFF0284C7))
                            },
                            trailingIcon = {
                                IconButton(onClick = { isLoginPasswordVisible = !isLoginPasswordVisible }) {
                                    Icon(
                                        imageVector = if (isLoginPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = "Hiện/Ẩn mật khẩu",
                                        tint = Color(0xFF64748B)
                                    )
                                }
                            },
                            visualTransformation = if (isLoginPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF0284C7),
                                unfocusedBorderColor = Color(0xFF94A3B8),
                                focusedTextColor = Color(0xFF0F172A),
                                unfocusedTextColor = Color(0xFF0F172A),
                                focusedLabelColor = Color(0xFF0284C7),
                                unfocusedLabelColor = Color(0xFF334155),
                                unfocusedContainerColor = Color(0xFFF8FAFC),
                                focusedContainerColor = Color.White
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Password,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
                            modifier = Modifier.fillMaxWidth()
                        )

                        // Role Selector
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "Vai trò truy cập (Role):",
                                fontSize = 13.sp,
                                color = Color(0xFF1E293B),
                                fontWeight = FontWeight.Bold
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                listOf(
                                    Triple(UserRole.TECHNICIAN, "Kỹ thuật viên", Icons.Default.Build),
                                    Triple(UserRole.OPERATOR, "Vận hành", Icons.Default.Speed),
                                    Triple(UserRole.ADMIN, "Admin", Icons.Default.AdminPanelSettings)
                                ).forEach { (role, label, icon) ->
                                    val isSelected = loginRole == role
                                    Surface(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(10.dp))
                                            .clickable { loginRole = role },
                                        color = if (isSelected) Color(0xFFE0F2FE) else Color(0xFFF8FAFC),
                                        border = androidx.compose.foundation.BorderStroke(
                                            if (isSelected) 2.dp else 1.dp,
                                            if (isSelected) Color(0xFF0284C7) else Color(0xFFCBD5E1)
                                        ),
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(vertical = 10.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.Center
                                        ) {
                                            Icon(
                                                imageVector = icon,
                                                contentDescription = null,
                                                tint = if (isSelected) Color(0xFF0284C7) else Color(0xFF475569),
                                                modifier = Modifier.size(20.dp)
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                text = label,
                                                fontSize = 12.sp,
                                                color = if (isSelected) Color(0xFF0369A1) else Color(0xFF334155),
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                                                textAlign = TextAlign.Center
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // Demo Quick Accounts helper chips
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "Đăng nhập nhanh (Tài khoản mẫu):",
                                fontSize = 13.sp,
                                color = Color(0xFF334155),
                                fontWeight = FontWeight.Bold
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable {
                                            loginUsername = "rking@ar-imms.corp"
                                            loginPassword = "password"
                                            loginRole = UserRole.TECHNICIAN
                                        },
                                    color = Color.White,
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF94A3B8)),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(vertical = 8.dp, horizontal = 6.dp),
                                        horizontalArrangement = Arrangement.Center,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("KTV", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                                    }
                                }

                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable {
                                            loginUsername = "operator@ar-imms.dc"
                                            loginPassword = "password"
                                            loginRole = UserRole.OPERATOR
                                        },
                                    color = Color.White,
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF94A3B8)),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(vertical = 8.dp, horizontal = 6.dp),
                                        horizontalArrangement = Arrangement.Center,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.Speed, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Vận hành", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                                    }
                                }

                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable {
                                            loginUsername = "admin@ar-imms.dc"
                                            loginPassword = "password"
                                            loginRole = UserRole.ADMIN
                                        },
                                    color = Color.White,
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF94A3B8)),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(vertical = 8.dp, horizontal = 6.dp),
                                        horizontalArrangement = Arrangement.Center,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Admin", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                                    }
                                }
                            }
                        }

                        // Submit Login Button
                        Button(
                            onClick = {
                                if (loginUsername.isBlank()) {
                                    errorMessage = "Vui lòng nhập tên đăng nhập hoặc email!"
                                    return@Button
                                }
                                isLoading = true
                                errorMessage = null
                                successMessage = null
                                scope.launch {
                                    val result = repository.login(loginUsername.trim(), loginPassword, loginRole)
                                    isLoading = false
                                    if (result.isSuccess) {
                                        onLoginSuccess()
                                    } else {
                                        errorMessage = result.exceptionOrNull()?.message ?: "Đăng nhập thất bại!"
                                    }
                                }
                            },
                            enabled = !isLoading,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF0284C7),
                                contentColor = Color.White
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    color = Color.White,
                                    strokeWidth = 2.5.dp
                                )
                            } else {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = "VÀO HỆ THỐNG",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp
                                    )
                                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(20.dp))
                                }
                            }
                        }

                        // Switch to register helper
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Chưa có tài khoản?",
                                fontSize = 14.sp,
                                color = Color(0xFF475569)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Đăng ký ngay",
                                fontSize = 14.sp,
                                color = Color(0xFF0284C7),
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .clickable {
                                        selectedTab = AuthTab.REGISTER
                                        errorMessage = null
                                        successMessage = null
                                    }
                                    .padding(horizontal = 4.dp, vertical = 2.dp)
                            )
                        }
                    }

                    // CONTENT FOR REGISTER TAB
                    if (selectedTab == AuthTab.REGISTER) {
                        OutlinedTextField(
                            value = regFullName,
                            onValueChange = { regFullName = it },
                            label = { Text("Họ và tên đầy đủ", color = Color(0xFF334155), fontWeight = FontWeight.Medium) },
                            placeholder = { Text("VD: Nguyễn Văn An") },
                            leadingIcon = {
                                Icon(Icons.Default.Badge, contentDescription = null, tint = Color(0xFF0284C7))
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF0284C7),
                                unfocusedBorderColor = Color(0xFF94A3B8),
                                focusedTextColor = Color(0xFF0F172A),
                                unfocusedTextColor = Color(0xFF0F172A),
                                focusedLabelColor = Color(0xFF0284C7),
                                unfocusedLabelColor = Color(0xFF334155),
                                unfocusedContainerColor = Color(0xFFF8FAFC),
                                focusedContainerColor = Color.White
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Text,
                                imeAction = ImeAction.Next
                            ),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = regUsername,
                            onValueChange = { regUsername = it },
                            label = { Text("Tên đăng nhập", color = Color(0xFF334155), fontWeight = FontWeight.Medium) },
                            placeholder = { Text("VD: tech.an") },
                            leadingIcon = {
                                Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFF0284C7))
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF0284C7),
                                unfocusedBorderColor = Color(0xFF94A3B8),
                                focusedTextColor = Color(0xFF0F172A),
                                unfocusedTextColor = Color(0xFF0F172A),
                                focusedLabelColor = Color(0xFF0284C7),
                                unfocusedLabelColor = Color(0xFF334155),
                                unfocusedContainerColor = Color(0xFFF8FAFC),
                                focusedContainerColor = Color.White
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Text,
                                imeAction = ImeAction.Next
                            ),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = regEmail,
                            onValueChange = { regEmail = it },
                            label = { Text("Địa chỉ Email", color = Color(0xFF334155), fontWeight = FontWeight.Medium) },
                            placeholder = { Text("VD: an.nguyen@ar-imms.dc") },
                            leadingIcon = {
                                Icon(Icons.Default.Email, contentDescription = null, tint = Color(0xFF0284C7))
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF0284C7),
                                unfocusedBorderColor = Color(0xFF94A3B8),
                                focusedTextColor = Color(0xFF0F172A),
                                unfocusedTextColor = Color(0xFF0F172A),
                                focusedLabelColor = Color(0xFF0284C7),
                                unfocusedLabelColor = Color(0xFF334155),
                                unfocusedContainerColor = Color(0xFFF8FAFC),
                                focusedContainerColor = Color.White
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Email,
                                imeAction = ImeAction.Next
                            ),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = regPassword,
                            onValueChange = { regPassword = it },
                            label = { Text("Mật khẩu (tối thiểu 6 ký tự)", color = Color(0xFF334155), fontWeight = FontWeight.Medium) },
                            leadingIcon = {
                                Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFF0284C7))
                            },
                            trailingIcon = {
                                IconButton(onClick = { isRegPasswordVisible = !isRegPasswordVisible }) {
                                    Icon(
                                        imageVector = if (isRegPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = "Hiện/Ẩn mật khẩu",
                                        tint = Color(0xFF64748B)
                                    )
                                }
                            },
                            visualTransformation = if (isRegPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF0284C7),
                                unfocusedBorderColor = Color(0xFF94A3B8),
                                focusedTextColor = Color(0xFF0F172A),
                                unfocusedTextColor = Color(0xFF0F172A),
                                focusedLabelColor = Color(0xFF0284C7),
                                unfocusedLabelColor = Color(0xFF334155),
                                unfocusedContainerColor = Color(0xFFF8FAFC),
                                focusedContainerColor = Color.White
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Password,
                                imeAction = ImeAction.Next
                            ),
                            keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = regConfirmPassword,
                            onValueChange = { regConfirmPassword = it },
                            label = { Text("Xác nhận lại mật khẩu", color = Color(0xFF334155), fontWeight = FontWeight.Medium) },
                            leadingIcon = {
                                Icon(Icons.Default.LockReset, contentDescription = null, tint = Color(0xFF0284C7))
                            },
                            trailingIcon = {
                                IconButton(onClick = { isRegConfirmPasswordVisible = !isRegConfirmPasswordVisible }) {
                                    Icon(
                                        imageVector = if (isRegConfirmPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = "Hiện/Ẩn mật khẩu",
                                        tint = Color(0xFF64748B)
                                    )
                                }
                            },
                            visualTransformation = if (isRegConfirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF0284C7),
                                unfocusedBorderColor = Color(0xFF94A3B8),
                                focusedTextColor = Color(0xFF0F172A),
                                unfocusedTextColor = Color(0xFF0F172A),
                                focusedLabelColor = Color(0xFF0284C7),
                                unfocusedLabelColor = Color(0xFF334155),
                                unfocusedContainerColor = Color(0xFFF8FAFC),
                                focusedContainerColor = Color.White
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Password,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
                            modifier = Modifier.fillMaxWidth()
                        )

                        // Role Selector for Register
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "Vai trò người dùng đăng ký:",
                                fontSize = 13.sp,
                                color = Color(0xFF1E293B),
                                fontWeight = FontWeight.Bold
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                listOf(
                                    Triple(UserRole.TECHNICIAN, "Kỹ thuật viên", Icons.Default.Build),
                                    Triple(UserRole.OPERATOR, "Vận hành", Icons.Default.Speed),
                                    Triple(UserRole.ADMIN, "Admin", Icons.Default.AdminPanelSettings)
                                ).forEach { (role, label, icon) ->
                                    val isSelected = regRole == role
                                    Surface(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(10.dp))
                                            .clickable { regRole = role },
                                        color = if (isSelected) Color(0xFFE0F2FE) else Color(0xFFF8FAFC),
                                        border = androidx.compose.foundation.BorderStroke(
                                            if (isSelected) 2.dp else 1.dp,
                                            if (isSelected) Color(0xFF0284C7) else Color(0xFFCBD5E1)
                                        ),
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(vertical = 10.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.Center
                                        ) {
                                            Icon(
                                                imageVector = icon,
                                                contentDescription = null,
                                                tint = if (isSelected) Color(0xFF0284C7) else Color(0xFF475569),
                                                modifier = Modifier.size(20.dp)
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                text = label,
                                                fontSize = 12.sp,
                                                color = if (isSelected) Color(0xFF0369A1) else Color(0xFF334155),
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                                                textAlign = TextAlign.Center
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // Submit Register Button
                        Button(
                            onClick = {
                                if (regFullName.isBlank()) {
                                    errorMessage = "Vui lòng nhập họ và tên!"
                                    return@Button
                                }
                                if (regUsername.isBlank()) {
                                    errorMessage = "Vui lòng nhập tên đăng nhập!"
                                    return@Button
                                }
                                if (regEmail.isBlank() || !regEmail.contains("@")) {
                                    errorMessage = "Vui lòng nhập địa chỉ email hợp lệ!"
                                    return@Button
                                }
                                if (regPassword.length < 6) {
                                    errorMessage = "Mật khẩu phải có ít nhất 6 ký tự!"
                                    return@Button
                                }
                                if (regPassword != regConfirmPassword) {
                                    errorMessage = "Mật khẩu xác nhận không khớp!"
                                    return@Button
                                }

                                isLoading = true
                                errorMessage = null
                                successMessage = null
                                scope.launch {
                                    val result = repository.register(
                                        username = regUsername.trim(),
                                        email = regEmail.trim(),
                                        password = regPassword,
                                        fullName = regFullName.trim(),
                                        role = regRole
                                    )
                                    isLoading = false
                                    if (result.isSuccess) {
                                        successMessage = "Đăng ký thành công! Đang tự động chuyển vào hệ thống..."
                                        delay(800)
                                        onLoginSuccess()
                                    } else {
                                        errorMessage = result.exceptionOrNull()?.message ?: "Đăng ký thất bại. Vui lòng thử lại!"
                                    }
                                }
                            },
                            enabled = !isLoading,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF0284C7),
                                contentColor = Color.White
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    color = Color.White,
                                    strokeWidth = 2.5.dp
                                )
                            } else {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(20.dp))
                                    Text(
                                        text = "ĐĂNG KÝ TÀI KHOẢN",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp
                                    )
                                }
                            }
                        }

                        // Switch to login helper
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Đã có tài khoản?",
                                fontSize = 14.sp,
                                color = Color(0xFF475569)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Đăng nhập ngay",
                                fontSize = 14.sp,
                                color = Color(0xFF0284C7),
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .clickable {
                                        selectedTab = AuthTab.LOGIN
                                        errorMessage = null
                                        successMessage = null
                                    }
                                    .padding(horizontal = 4.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(36.dp))
        }
    }
}
