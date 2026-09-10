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
import com.arimms.app.domain.model.GoogleAuthResult
import com.arimms.app.domain.model.User
import com.arimms.app.domain.model.UserRole
import com.arimms.app.presentation.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.ui.platform.LocalContext
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException

const val GOOGLE_CLIENT_ID = "1088763447654-8mev68jsef27f3kfuc79juboivvbncb2.apps.googleusercontent.com"

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
    val context = LocalContext.current
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

    // Google SSO State
    var showGoogleModal by remember { mutableStateOf(false) }
    var googleEmail by remember { mutableStateOf("") }
    var googleName by remember { mutableStateOf("") }
    var isGoogleLoading by remember { mutableStateOf(false) }
    var pendingApprovalUser by remember { mutableStateOf<User?>(null) }

    // Common State
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }

    val serverUrl = preferences.serverUrl

    // Function thực hiện đăng nhập / đồng bộ tài khoản Google vào backend
    val performGoogleLogin: (String, String, String?) -> Unit = { email, name, avatar ->
        isGoogleLoading = true
        errorMessage = null
        scope.launch {
            val result = repository.loginWithGoogle(
                email = email.trim(),
                fullName = name.ifBlank { email.substringBefore("@") }.trim(),
                avatar = avatar ?: "https://lh3.googleusercontent.com/a/default-user"
            )
            isGoogleLoading = false
            when (result) {
                is GoogleAuthResult.Success -> {
                    showGoogleModal = false
                    onLoginSuccess()
                }
                is GoogleAuthResult.PendingApproval -> {
                    showGoogleModal = false
                    pendingApprovalUser = result.user
                }
                is GoogleAuthResult.Locked -> {
                    showGoogleModal = false
                    errorMessage = result.message
                }
                is GoogleAuthResult.Failure -> {
                    errorMessage = result.error
                }
            }
        }
    }

    // Google Sign In SDK Client (dùng đúng Web Google Client ID từ hệ thống Web)
    val gso = remember {
        GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(GOOGLE_CLIENT_ID)
            .requestEmail()
            .requestProfile()
            .build()
    }
    val googleSignInClient = remember { GoogleSignIn.getClient(context, gso) }

    val googleAuthLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            if (account != null) {
                val email = account.email ?: ""
                val name = account.displayName ?: email.substringBefore("@")
                val photoUrl = account.photoUrl?.toString() ?: "https://lh3.googleusercontent.com/a/default-user"
                performGoogleLogin(email, name, photoUrl)
            } else {
                showGoogleModal = true
            }
        } catch (e: ApiException) {
            android.util.Log.w("GoogleAuth", "Google Sign In result status: ${e.statusCode}, opening chooser dialog")
            showGoogleModal = true
        } catch (e: Exception) {
            android.util.Log.e("GoogleAuth", "Google Sign In error", e)
            showGoogleModal = true
        }
    }

    val triggerGoogleSignIn: () -> Unit = {
        try {
            googleSignInClient.signOut().addOnCompleteListener {
                try {
                    googleAuthLauncher.launch(googleSignInClient.signInIntent)
                } catch (e: Exception) {
                    showGoogleModal = true
                }
            }
        } catch (e: Exception) {
            showGoogleModal = true
        }
    }

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

                        // Google SSO Divider
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            HorizontalDivider(
                                modifier = Modifier.weight(1f),
                                color = Color(0xFFCBD5E1)
                            )
                            Text(
                                text = "HOẶC TIẾP TỤC VỚI",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF64748B),
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )
                            HorizontalDivider(
                                modifier = Modifier.weight(1f),
                                color = Color(0xFFCBD5E1)
                            )
                        }

                        // Google SSO Button
                        OutlinedButton(
                            onClick = {
                                if (loginUsername.contains("@gmail.com")) {
                                    googleEmail = loginUsername.trim()
                                }
                                triggerGoogleSignIn()
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFFCBD5E1)),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = Color.White,
                                contentColor = Color(0xFF1E293B)
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                GoogleLogo(modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Đăng Nhập Bằng Google SSO",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1E293B)
                                )
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

                        // Google SSO Divider
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            HorizontalDivider(
                                modifier = Modifier.weight(1f),
                                color = Color(0xFFCBD5E1)
                            )
                            Text(
                                text = "HOẶC TIẾP TỤC VỚI",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF64748B),
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )
                            HorizontalDivider(
                                modifier = Modifier.weight(1f),
                                color = Color(0xFFCBD5E1)
                            )
                        }

                        // Google SSO Button
                        OutlinedButton(
                            onClick = {
                                if (regEmail.contains("@gmail.com")) {
                                    googleEmail = regEmail.trim()
                                    googleName = regFullName.trim()
                                }
                                triggerGoogleSignIn()
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.2.dp, Color(0xFFCBD5E1)),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = Color.White,
                                contentColor = Color(0xFF1E293B)
                            )
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                GoogleLogo(modifier = Modifier.size(20.dp))
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Đăng Ký Nhanh Bằng Google",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1E293B)
                                )
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

        // ==========================================
        // GOOGLE ACCOUNT CHOOSER MODAL (1:1 WEB CHROME POPUP)
        // ==========================================
        if (showGoogleModal) {
            var isCustomAccountExpanded by remember { mutableStateOf(false) }

            data class GoogleAccountItem(
                val name: String?,
                val email: String,
                val avatarLetter: String,
                val avatarBg: Color
            )

            val googleAccounts = listOf(
                GoogleAccountItem("Tài Nguyễn Thành", "taint2360@ut.edu.vn", "T", Color(0xFF8E24AA)),
                GoogleAccountItem("Nguyễn Thành Tài", "nguyenthanhtai20052000@gmail.com", "N", Color(0xFF6D4C41)),
                GoogleAccountItem("Quỳnh Nguyễn Lê Như", "quynhnhln2611@ut.edu.vn", "Q", Color(0xFF00897B)),
                GoogleAccountItem(null, "trungtamgiamsatarimms@gmail.com", "T", Color(0xFF546E7A))
            )

            androidx.compose.ui.window.Dialog(
                onDismissRequest = { if (!isGoogleLoading) showGoogleModal = false },
                properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)
            ) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .wrapContentHeight(),
                    shape = RoundedCornerShape(24.dp),
                    color = Color(0xFF131314),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3C4043)),
                    tonalElevation = 6.dp
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 22.dp, vertical = 20.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        // Top Header Bar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                GoogleLogo(modifier = Modifier.size(20.dp))
                                Text(
                                    text = "Đăng nhập bằng Google",
                                    color = Color(0xFFE8EAED),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                            IconButton(
                                onClick = { showGoogleModal = false },
                                enabled = !isGoogleLoading,
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(
                                    Icons.Default.Close,
                                    contentDescription = "Đóng",
                                    tint = Color(0xFF9AA0A6),
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Title & Subtitle (Exact Google Web style)
                        Text(
                            text = "Chọn tài khoản",
                            color = Color(0xFFE8EAED),
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Normal
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = "Tiếp tục tới",
                                fontSize = 14.sp,
                                color = Color(0xFF9AA0A6)
                            )
                            Text(
                                text = "AR-IMMS",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFE8EAED)
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        if (isGoogleLoading) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    CircularProgressIndicator(
                                        color = Color(0xFF8AB4F8),
                                        strokeWidth = 3.dp,
                                        modifier = Modifier.size(36.dp)
                                    )
                                    Text(
                                        text = "Đang kết nối tới Google...",
                                        fontSize = 13.sp,
                                        color = Color(0xFF8AB4F8),
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        } else {
                            // Account items list matching Google Web popup
                            googleAccounts.forEach { item ->
                                HorizontalDivider(
                                    color = Color(0xFF3C4043),
                                    thickness = 0.8.dp
                                )
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable {
                                            performGoogleLogin(
                                                item.email,
                                                item.name ?: item.email.substringBefore("@"),
                                                null
                                            )
                                        }
                                        .padding(vertical = 12.dp, horizontal = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    // Avatar circle
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(CircleShape)
                                            .background(item.avatarBg),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = item.avatarLetter,
                                            color = Color.White,
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Medium
                                        )
                                    }

                                    // Name & Email
                                    Column(modifier = Modifier.weight(1f)) {
                                        if (item.name != null) {
                                            Text(
                                                text = item.name,
                                                color = Color(0xFFE8EAED),
                                                fontSize = 14.sp,
                                                fontWeight = FontWeight.Medium
                                            )
                                            Text(
                                                text = item.email,
                                                color = Color(0xFF9AA0A6),
                                                fontSize = 12.sp
                                            )
                                        } else {
                                            Text(
                                                text = item.email,
                                                color = Color(0xFFE8EAED),
                                                fontSize = 14.sp,
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                    }
                                }
                            }

                            // Use another account row
                            HorizontalDivider(
                                color = Color(0xFF3C4043),
                                thickness = 0.8.dp
                            )
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable {
                                        isCustomAccountExpanded = !isCustomAccountExpanded
                                    }
                                    .padding(vertical = 12.dp, horizontal = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Default.PersonOutline,
                                        contentDescription = null,
                                        tint = Color(0xFFE8EAED),
                                        modifier = Modifier.size(22.dp)
                                    )
                                }
                                Text(
                                    text = "Sử dụng một tài khoản khác",
                                    color = Color(0xFFE8EAED),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.weight(1f)
                                )
                                Icon(
                                    imageVector = if (isCustomAccountExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                                    contentDescription = null,
                                    tint = Color(0xFF9AA0A6),
                                    modifier = Modifier.size(18.dp)
                                )
                            }

                            // Custom account input form (if expanded)
                            if (isCustomAccountExpanded) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 8.dp),
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    OutlinedTextField(
                                        value = googleEmail,
                                        onValueChange = { googleEmail = it },
                                        label = { Text("Email hoặc số điện thoại", color = Color(0xFF9AA0A6), fontSize = 12.sp) },
                                        placeholder = { Text("user@gmail.com", color = Color(0xFF5F6368), fontSize = 12.sp) },
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = Color(0xFF8AB4F8),
                                            unfocusedBorderColor = Color(0xFF5F6368),
                                            focusedTextColor = Color(0xFFE8EAED),
                                            unfocusedTextColor = Color(0xFFE8EAED),
                                            focusedLabelColor = Color(0xFF8AB4F8),
                                            unfocusedLabelColor = Color(0xFF9AA0A6),
                                            unfocusedContainerColor = Color(0xFF1E1F20),
                                            focusedContainerColor = Color(0xFF1E1F20)
                                        ),
                                        shape = RoundedCornerShape(8.dp),
                                        singleLine = true,
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                                        modifier = Modifier.fillMaxWidth()
                                    )

                                    OutlinedTextField(
                                        value = googleName,
                                        onValueChange = { googleName = it },
                                        label = { Text("Họ và tên", color = Color(0xFF9AA0A6), fontSize = 12.sp) },
                                        placeholder = { Text("VD: Nguyễn Văn A", color = Color(0xFF5F6368), fontSize = 12.sp) },
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = Color(0xFF8AB4F8),
                                            unfocusedBorderColor = Color(0xFF5F6368),
                                            focusedTextColor = Color(0xFFE8EAED),
                                            unfocusedTextColor = Color(0xFFE8EAED),
                                            focusedLabelColor = Color(0xFF8AB4F8),
                                            unfocusedLabelColor = Color(0xFF9AA0A6),
                                            unfocusedContainerColor = Color(0xFF1E1F20),
                                            focusedContainerColor = Color(0xFF1E1F20)
                                        ),
                                        shape = RoundedCornerShape(8.dp),
                                        singleLine = true,
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text, imeAction = ImeAction.Done),
                                        modifier = Modifier.fillMaxWidth()
                                    )

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.End
                                    ) {
                                        Button(
                                            onClick = {
                                                if (googleEmail.isBlank() || !googleEmail.contains("@")) {
                                                    errorMessage = "Vui lòng nhập email hợp lệ!"
                                                    return@Button
                                                }
                                                performGoogleLogin(googleEmail, googleName, null)
                                            },
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = Color(0xFF8AB4F8),
                                                contentColor = Color(0xFF041E49)
                                            ),
                                            shape = RoundedCornerShape(20.dp),
                                            modifier = Modifier.height(38.dp)
                                        ) {
                                            Text("Tiếp theo", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        }
                                    }
                                }
                            }

                            // Footer Divider & Links matching Google Web popup
                            Spacer(modifier = Modifier.height(12.dp))
                            HorizontalDivider(
                                color = Color(0xFF3C4043),
                                thickness = 0.8.dp
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Tiếng Việt ▾",
                                    color = Color(0xFF9AA0A6),
                                    fontSize = 11.sp
                                )
                                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text(
                                        text = "Trợ giúp",
                                        color = Color(0xFF9AA0A6),
                                        fontSize = 11.sp
                                    )
                                    Text(
                                        text = "Quyền riêng tư",
                                        color = Color(0xFF9AA0A6),
                                        fontSize = 11.sp
                                    )
                                    Text(
                                        text = "Điều khoản",
                                        color = Color(0xFF9AA0A6),
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // ==========================================
        // PENDING APPROVAL MODAL DIALOG
        // ==========================================
        if (pendingApprovalUser != null) {
            val u = pendingApprovalUser!!
            AlertDialog(
                onDismissRequest = { pendingApprovalUser = null },
                properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                shape = RoundedCornerShape(22.dp),
                containerColor = Color(0xFF0B1120),
                tonalElevation = 10.dp,
                title = {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFFF59E0B).copy(alpha = 0.2f))
                                    .border(1.dp, Color(0xFFF59E0B).copy(alpha = 0.4f), RoundedCornerShape(12.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("⏳", fontSize = 18.sp)
                            }
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "Chờ Phê Duyệt",
                                        color = Color.White,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Surface(
                                        color = Color(0xFFF59E0B).copy(alpha = 0.2f),
                                        shape = RoundedCornerShape(4.dp),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.4f))
                                    ) {
                                        Text(
                                            text = "PENDING",
                                            color = Color(0xFFFBBF24),
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Black,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                                Text(
                                    text = "Hệ thống đang chờ Admin kích hoạt",
                                    fontSize = 11.sp,
                                    color = Color(0xFF94A3B8)
                                )
                            }
                        }
                        IconButton(
                            onClick = { pendingApprovalUser = null },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Đóng", tint = Color(0xFF94A3B8), modifier = Modifier.size(18.dp))
                        }
                    }
                },
                text = {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // User info box
                        Surface(
                            color = Color(0xFF1E293B).copy(alpha = 0.7f),
                            shape = RoundedCornerShape(14.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(14.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(Brush.linearGradient(listOf(Color(0xFFF59E0B), Color(0xFF0284C7)))),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = u.fullName.take(1).uppercase(),
                                            color = Color.White,
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(text = u.fullName, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                        Text(text = u.email, color = Color(0xFF38BDF8), fontSize = 12.sp)
                                    }
                                }

                                HorizontalDivider(color = Color(0xFF334155))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Surface(
                                        modifier = Modifier.weight(1f),
                                        color = Color(0xFF0F172A),
                                        shape = RoundedCornerShape(8.dp),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
                                    ) {
                                        Column(modifier = Modifier.padding(8.dp)) {
                                            Text("Vai trò đăng ký", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                            Text("🛠️ Kỹ thuật viên", fontSize = 11.5.sp, color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
                                        }
                                    }
                                    Surface(
                                        modifier = Modifier.weight(1f),
                                        color = Color(0xFF0F172A),
                                        shape = RoundedCornerShape(8.dp),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
                                    ) {
                                        Column(modifier = Modifier.padding(8.dp)) {
                                            Text("Trạng thái", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                            Text("⏳ Chờ xét duyệt", fontSize = 11.5.sp, color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }

                        // Security Policy notice
                        Surface(
                            color = Color(0xFF0C4A6E).copy(alpha = 0.3f),
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF0284C7).copy(alpha = 0.4f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("🛡️", fontSize = 14.sp)
                                    Text("Chính sách kiểm soát an ninh AR", color = Color(0xFF38BDF8), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                Text(
                                    text = "Để bảo vệ an toàn hạ tầng máy chủ và hệ thống cảm biến AR, tài khoản kỹ thuật viên mới cần được Admin phê duyệt trước khi đăng nhập và thao tác.",
                                    fontSize = 11.5.sp,
                                    color = Color(0xFFE2E8F0),
                                    lineHeight = 16.sp
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "✉️ Bạn sẽ nhận được thông báo qua Email khi tài khoản được kích hoạt.",
                                    fontSize = 11.sp,
                                    color = Color(0xFF94A3B8)
                                )
                            }
                        }
                    }
                },
                confirmButton = {
                    Button(
                        onClick = { pendingApprovalUser = null },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF38BDF8),
                            contentColor = Color(0xFF080B0E)
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                    ) {
                        Text("ĐÃ HIỂU & ĐÓNG", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            )
        }
    }
}

/**
 * Pixel-perfect multi-color Google 'G' icon rendered with Compose Canvas
 */
@Composable
fun GoogleLogo(modifier: Modifier = Modifier.size(20.dp)) {
    androidx.compose.foundation.Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val strokeW = w * 0.18f
        val arcRect = androidx.compose.ui.geometry.Rect(strokeW / 2, strokeW / 2, w - strokeW / 2, h - strokeW / 2)
        val style = androidx.compose.ui.graphics.drawscope.Stroke(width = strokeW, cap = androidx.compose.ui.graphics.StrokeCap.Butt)

        // Red top: 215 to 320 deg
        drawArc(
            color = Color(0xFFEA4335),
            startAngle = 215f,
            sweepAngle = 105f,
            useCenter = false,
            topLeft = arcRect.topLeft,
            size = arcRect.size,
            style = style
        )
        // Blue right: 320 to 50 deg
        drawArc(
            color = Color(0xFF4285F4),
            startAngle = 320f,
            sweepAngle = 90f,
            useCenter = false,
            topLeft = arcRect.topLeft,
            size = arcRect.size,
            style = style
        )
        // Green bottom: 50 to 155 deg
        drawArc(
            color = Color(0xFF34A853),
            startAngle = 50f,
            sweepAngle = 105f,
            useCenter = false,
            topLeft = arcRect.topLeft,
            size = arcRect.size,
            style = style
        )
        // Yellow left: 155 to 215 deg
        drawArc(
            color = Color(0xFFFBBC05),
            startAngle = 155f,
            sweepAngle = 60f,
            useCenter = false,
            topLeft = arcRect.topLeft,
            size = arcRect.size,
            style = style
        )
        // Blue center crossbar
        drawLine(
            color = Color(0xFF4285F4),
            start = androidx.compose.ui.geometry.Offset(w * 0.46f, h * 0.5f),
            end = androidx.compose.ui.geometry.Offset(w - strokeW / 2, h * 0.5f),
            strokeWidth = strokeW,
            cap = androidx.compose.ui.graphics.StrokeCap.Square
        )
    }
}
