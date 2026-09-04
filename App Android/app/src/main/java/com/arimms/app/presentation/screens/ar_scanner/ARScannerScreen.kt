package com.arimms.app.presentation.screens.ar_scanner

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.OptIn
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.ContainerState
import com.arimms.app.domain.model.NodeHealthStatus
import com.arimms.app.domain.model.ServerNode
import com.arimms.app.presentation.components.MetricItem
import com.arimms.app.presentation.components.StatusBadge
import com.arimms.app.presentation.theme.*
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.util.concurrent.Executors

@OptIn(ExperimentalGetImage::class)
@Composable
fun ARScannerScreen(
    onNavigateToNodeDetail: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val repository = ARImmsApp.instance.repository
    val scope = rememberCoroutineScope()

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    var recognizedMarker by remember { mutableStateOf<String?>(null) }
    var detectedNode by remember { mutableStateOf<ServerNode?>(null) }
    var isFlashOn by remember { mutableStateOf(false) }
    var cameraControl by remember { mutableStateOf<CameraControl?>(null) }
    var allNodes by remember { mutableStateOf<List<ServerNode>>(emptyList()) }

    // Real-time telemetry updates for the detected node
    LaunchedEffect(detectedNode?.id) {
        detectedNode?.let { node ->
            repository.streamNodeTelemetry(node.id).collectLatest { updatedTelem ->
                detectedNode = detectedNode?.copy(currentTelemetry = updatedTelem)
            }
        }
    }

    LaunchedEffect(Unit) {
        repository.streamAllNodes().collectLatest {
            allNodes = it
            // If current detected node updated in stream, keep it synced
            detectedNode?.let { cur ->
                val fresh = it.find { n -> n.id == cur.id }
                if (fresh != null) detectedNode = fresh
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(BgDark)) {
        // Camera Preview
        if (hasCameraPermission) {
            AndroidView(
                factory = { ctx ->
                    val previewView = PreviewView(ctx)
                    val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                    val cameraExecutor = Executors.newSingleThreadExecutor()
                    val barcodeScanner = BarcodeScanning.getClient()

                    cameraProviderFuture.addListener({
                        val cameraProvider = cameraProviderFuture.get()
                        val preview = Preview.Builder().build().also {
                            it.setSurfaceProvider(previewView.surfaceProvider)
                        }

                        val imageAnalysis = ImageAnalysis.Builder()
                            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                            .build()

                        imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                            val mediaImage = imageProxy.image
                            if (mediaImage != null) {
                                val image = InputImage.fromMediaImage(
                                    mediaImage,
                                    imageProxy.imageInfo.rotationDegrees
                                )
                                barcodeScanner.process(image)
                                    .addOnSuccessListener { barcodes ->
                                        for (barcode in barcodes) {
                                            val rawValue = barcode.rawValue
                                            if (!rawValue.isNullOrBlank() && rawValue != recognizedMarker) {
                                                recognizedMarker = rawValue
                                                scope.launch {
                                                    repository.getNodeByMarker(rawValue).onSuccess { node ->
                                                        if (node != null) {
                                                            detectedNode = node
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    .addOnCompleteListener {
                                        imageProxy.close()
                                    }
                            } else {
                                imageProxy.close()
                            }
                        }

                        try {
                            cameraProvider.unbindAll()
                            val camera = cameraProvider.bindToLifecycle(
                                lifecycleOwner,
                                CameraSelector.DEFAULT_BACK_CAMERA,
                                preview,
                                imageAnalysis
                            )
                            cameraControl = camera.cameraControl
                        } catch (e: Exception) {
                            Log.e("ARScannerScreen", "Camera binding failed", e)
                        }
                    }, ContextCompat.getMainExecutor(ctx))

                    previewView
                },
                modifier = Modifier.fillMaxSize()
            )
        } else {
            // Permission placeholder
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Default.VideocamOff, contentDescription = null, tint = StatusWarning, modifier = Modifier.size(54.dp))
                Spacer(modifier = Modifier.height(16.dp))
                Text("Cần cấp quyền Camera để quét AR Marker", color = TextPrimary, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }) {
                    Text("CẤP QUYỀN CAMERA")
                }
            }
        }

        // AR Spatial Crosshair HUD Overlay (Canvas Drawing)
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height
            val centerX = width / 2
            val centerY = height / 2 - 40.dp.toPx()
            val boxSize = 220.dp.toPx()
            val cornerLength = 30.dp.toPx()

            val strokeColor = if (detectedNode != null) {
                when (detectedNode!!.currentTelemetry.status) {
                    NodeHealthStatus.CRITICAL -> StatusCritical
                    NodeHealthStatus.WARNING -> StatusWarning
                    else -> PrimaryCyan
                }
            } else {
                PrimaryCyan.copy(alpha = 0.7f)
            }

            // Draw Holographic Corner Brackets
            val halfBox = boxSize / 2
            val left = centerX - halfBox
            val right = centerX + halfBox
            val top = centerY - halfBox
            val bottom = centerY + halfBox

            val path = Path().apply {
                // Top-Left Corner
                moveTo(left, top + cornerLength)
                lineTo(left, top)
                lineTo(left + cornerLength, top)

                // Top-Right Corner
                moveTo(right - cornerLength, top)
                lineTo(right, top)
                lineTo(right, top + cornerLength)

                // Bottom-Right Corner
                moveTo(right, bottom - cornerLength)
                lineTo(right, bottom)
                lineTo(right - cornerLength, bottom)

                // Bottom-Left Corner
                moveTo(left + cornerLength, bottom)
                lineTo(left, bottom)
                lineTo(left, bottom - cornerLength)
            }

            drawPath(
                path = path,
                color = strokeColor,
                style = Stroke(width = 3.dp.toPx())
            )

            // Center targeting reticle dot
            drawCircle(
                color = strokeColor.copy(alpha = 0.8f),
                radius = 4.dp.toPx(),
                center = androidx.compose.ui.geometry.Offset(centerX, centerY)
            )
        }

        // Top Controls (Back Button, Torch Toggle, Title)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color(0x880A0E1A))
            ) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
            }

            Surface(
                color = Color(0xCC131B2E),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryCyan.copy(alpha = 0.5f))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(if (detectedNode != null) StatusHealthy else PrimaryCyan)
                    )
                    Text(
                        text = if (detectedNode != null) "LOCKED: ${detectedNode!!.markerCode}" else "SCANNING AR MARKERS...",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            IconButton(
                onClick = {
                    isFlashOn = !isFlashOn
                    cameraControl?.enableTorch(isFlashOn)
                },
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color(0x880A0E1A))
            ) {
                Icon(
                    imageVector = if (isFlashOn) Icons.Default.FlashOn else Icons.Default.FlashOff,
                    contentDescription = "Flashlight",
                    tint = if (isFlashOn) PrimaryCyan else TextSecondary
                )
            }
        }

        // Bottom HUD Card & Quick Tag Simulator Bar
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Quick Marker Switcher (Enables instant testing on physical device / emulator without printed QR codes)
            Surface(
                color = Color(0xCC0F172A),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderStroke)
            ) {
                Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                    Text(
                        text = "Mô phỏng quét nhanh Tag (Không cần in mã QR):",
                        fontSize = 10.sp,
                        color = TextSecondary,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(allNodes) { node ->
                            val isSelected = detectedNode?.id == node.id
                            Surface(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable {
                                        recognizedMarker = node.markerCode
                                        detectedNode = node
                                    },
                                color = if (isSelected) PrimaryCyan.copy(alpha = 0.25f) else SurfaceCard,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSelected) PrimaryCyan else BorderStroke
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "${node.markerCode} (U${node.rackUnitPosition})",
                                    fontSize = 11.sp,
                                    color = if (isSelected) PrimaryCyan else TextSecondary,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Real-time Holographic AR HUD Card
            AnimatedVisibility(
                visible = detectedNode != null,
                enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
                exit = slideOutVertically(targetOffsetY = { it }) + fadeOut()
            ) {
                detectedNode?.let { node ->
                    val telem = node.currentTelemetry
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Color(0xEE131B2E),
                        shape = RoundedCornerShape(18.dp),
                        border = androidx.compose.foundation.BorderStroke(
                            1.5.dp,
                            when (telem.status) {
                                NodeHealthStatus.CRITICAL -> StatusCritical
                                NodeHealthStatus.WARNING -> StatusWarning
                                else -> PrimaryCyan
                            }
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Header: Tag, Name & Status Badge
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Surface(
                                            color = PrimaryCyan.copy(alpha = 0.15f),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = node.markerCode,
                                                fontSize = 11.sp,
                                                color = PrimaryCyan,
                                                fontWeight = FontWeight.Black,
                                                fontFamily = FontFamily.Monospace,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                        Text(
                                            text = "Tủ: ${node.rackId.uppercase()} / U${node.rackUnitPosition} (${node.unitHeight}U)",
                                            fontSize = 11.sp,
                                            color = TextSecondary,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = node.name,
                                        style = MaterialTheme.typography.titleMedium,
                                        color = TextPrimary,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "${node.model} • ${node.ipAddress}",
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                }
                                StatusBadge(status = telem.status)
                            }

                            Divider(color = BorderStroke)

                            // Telemetry Live Metrics Row
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                MetricItem(label = "CPU USAGE", value = "${telem.cpuUsagePercent}%", color = CpuColor)
                                MetricItem(label = "RAM USAGE", value = "${telem.memoryUsagePercent}%", color = RamColor)
                                MetricItem(
                                    label = "CHASSIS TEMP",
                                    value = "${telem.temperatureCelsius}°C",
                                    color = if (telem.temperatureCelsius > 75) StatusCritical else TempColor
                                )
                                MetricItem(label = "FAN SPEED", value = "${telem.fanSpeedRpm} RPM", color = NetColor)
                                MetricItem(label = "POWER", value = "${telem.powerWatts} W", color = PowerColor)
                            }

                            // Active Docker Workloads Pills
                            if (node.containers.isNotEmpty()) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text("Containers:", fontSize = 10.sp, color = TextSecondary)
                                    node.containers.forEach { container ->
                                        Surface(
                                            color = if (container.state == ContainerState.RUNNING) Color(0x2200E676) else Color(0x22FF1744),
                                            shape = RoundedCornerShape(4.dp),
                                            border = androidx.compose.foundation.BorderStroke(
                                                0.5.dp,
                                                if (container.state == ContainerState.RUNNING) StatusHealthy else StatusCritical
                                            )
                                        ) {
                                            Text(
                                                text = "${container.name} (${container.state.name})",
                                                fontSize = 9.sp,
                                                color = if (container.state == ContainerState.RUNNING) StatusHealthy else StatusCritical,
                                                fontFamily = FontFamily.Monospace,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                }
                            }

                            // Action Buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                // Blink LED
                                OutlinedButton(
                                    onClick = {
                                        scope.launch {
                                            repository.toggleNodeLed(node.id)
                                        }
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        contentColor = if (node.isBlinkingLed) StatusWarning else PrimaryCyan
                                    )
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Lightbulb,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        if (node.isBlinkingLed) "TẮT LED" else "NHÁY ĐÈN LED",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }

                                // Open Detail
                                Button(
                                    onClick = { onNavigateToNodeDetail(node.id) },
                                    modifier = Modifier.weight(1.2f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = PrimaryCyan,
                                        contentColor = BgDark
                                    )
                                ) {
                                    Text("XEM CHI TIẾT", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
