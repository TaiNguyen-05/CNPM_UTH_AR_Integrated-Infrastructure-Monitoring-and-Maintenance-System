package com.arimms.app.presentation.screens.ar_scanner

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import android.util.Size
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
import androidx.compose.material.icons.automirrored.filled.*
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
    var lastScanTimestamp by remember { mutableStateOf(0L) }

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
                        val preview = Preview.Builder()
                            .setTargetResolution(Size(1280, 720))
                            .build().also {
                                it.setSurfaceProvider(previewView.surfaceProvider)
                            }

                        val imageAnalysis = ImageAnalysis.Builder()
                            .setTargetResolution(Size(1280, 720))
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
                                        val validBarcode = barcodes.firstOrNull { !it.rawValue.isNullOrBlank() }
                                        if (validBarcode != null) {
                                            val rawValue = validBarcode.rawValue!!
                                            val now = System.currentTimeMillis()
                                            if (detectedNode == null || detectedNode?.id.isNullOrBlank() || now - lastScanTimestamp > 500L) {
                                                lastScanTimestamp = now
                                                scope.launch {
                                                    repository.getNodeByMarker(rawValue).onSuccess { node ->
                                                        if (node != null) {
                                                            recognizedMarker = rawValue
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

                            previewView.setOnTouchListener { view, event ->
                                if (event.action == android.view.MotionEvent.ACTION_UP) {
                                    val factory = previewView.meteringPointFactory
                                    val point = factory.createPoint(event.x, event.y)
                                    val action = FocusMeteringAction.Builder(point, FocusMeteringAction.FLAG_AF or FocusMeteringAction.FLAG_AE).build()
                                    cameraControl?.startFocusAndMetering(action)
                                    view.performClick()
                                }
                                true
                            }
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
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(Color(0xEEFFFFFF))
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary, modifier = Modifier.size(20.dp))
            }

            Surface(
                color = Color(0xEEFFFFFF),
                shape = RoundedCornerShape(20.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryCyan.copy(alpha = 0.5f)),
                modifier = Modifier
                    .weight(1f, fill = false)
                    .padding(horizontal = 8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
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
                        text = if (detectedNode != null) "LOCKED: ${detectedNode!!.name}" else "SCANNING AR MARKERS...",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        maxLines = 1,
                        overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
                        softWrap = false,
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
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(Color(0xEEFFFFFF))
            ) {
                Icon(
                    imageVector = if (isFlashOn) Icons.Default.FlashOn else Icons.Default.FlashOff,
                    contentDescription = "Flashlight",
                    tint = if (isFlashOn) PrimaryCyan else TextSecondary,
                    modifier = Modifier.size(20.dp)
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
                color = Color(0xF2FFFFFF),
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
                                color = if (isSelected) PrimaryCyan.copy(alpha = 0.15f) else SurfaceElevated,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSelected) PrimaryCyan else BorderStroke
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "${node.markerCode.substringAfterLast("/")} (U${node.rackUnitPosition})",
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
                        color = Color(0xF8FFFFFF),
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
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // Header Row: Rack Info & Status Badge
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    modifier = Modifier.weight(1f, fill = false)
                                ) {
                                    Surface(
                                        color = PrimaryCyan.copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            text = node.markerCode.substringAfterLast("/").ifBlank { node.markerCode },
                                            fontSize = 10.sp,
                                            color = PrimaryCyan,
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Monospace,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                    Text(
                                        text = "TỦ: ${node.rackId.uppercase()} • U${node.rackUnitPosition} (${node.unitHeight}U)",
                                        fontSize = 11.sp,
                                        color = TextSecondary,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        maxLines = 1
                                    )
                                }
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    StatusBadge(status = telem.status)
                                    IconButton(
                                        onClick = {
                                            detectedNode = null
                                            recognizedMarker = null
                                        },
                                        modifier = Modifier.size(24.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Close,
                                            contentDescription = "Close",
                                            tint = TextSecondary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }

                            // Node Name & Model/IP
                            Column {
                                Text(
                                    text = node.name,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = TextPrimary,
                                    fontWeight = FontWeight.Black
                                )
                                Text(
                                    text = "${node.model} • IP: ${node.ipAddress}",
                                    fontSize = 11.sp,
                                    color = TextSecondary
                                )
                            }

                            Divider(color = BorderStroke)

                            // Telemetry Live Metrics (5 equal-width clean stat boxes)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                listOf(
                                    Triple("CPU", "${telem.cpuUsagePercent}%", CpuColor),
                                    Triple("RAM", "${telem.memoryUsagePercent}%", RamColor),
                                    Triple("NHIỆT", "${telem.temperatureCelsius}°C", if (telem.temperatureCelsius > 75) StatusCritical else TempColor),
                                    Triple("QUẠT", "${telem.fanSpeedRpm}", NetColor),
                                    Triple("ĐIỆN", "${telem.powerWatts}W", PowerColor)
                                ).forEach { (label, value, color) ->
                                    Surface(
                                        modifier = Modifier.weight(1f),
                                        color = Color(0x0A000000),
                                        shape = RoundedCornerShape(6.dp),
                                        border = androidx.compose.foundation.BorderStroke(0.5.dp, BorderStroke)
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(vertical = 4.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally
                                        ) {
                                            Text(
                                                text = label,
                                                fontSize = 9.sp,
                                                color = TextSecondary,
                                                fontWeight = FontWeight.Bold,
                                                maxLines = 1
                                            )
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(
                                                text = value,
                                                fontSize = 11.sp,
                                                color = color,
                                                fontWeight = FontWeight.Black,
                                                fontFamily = FontFamily.Monospace,
                                                maxLines = 1
                                            )
                                        }
                                    }
                                }
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
                                            color = if (container.state == ContainerState.RUNNING) StatusHealthyBg else StatusCriticalBg,
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
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Blink LED
                                OutlinedButton(
                                    onClick = {
                                        scope.launch {
                                            repository.toggleNodeLed(node.id)
                                        }
                                    },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(38.dp),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        contentColor = if (node.isBlinkingLed) StatusWarning else PrimaryCyan
                                    ),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Lightbulb,
                                        contentDescription = null,
                                        modifier = Modifier.size(15.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        if (node.isBlinkingLed) "TẮT LED" else "NHÁY ĐÈN LED",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        softWrap = false
                                    )
                                }

                                // Open Detail
                                Button(
                                    onClick = { onNavigateToNodeDetail(node.id) },
                                    modifier = Modifier
                                        .weight(1.1f)
                                        .height(38.dp),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = PrimaryCyan,
                                        contentColor = Color.White
                                    ),
                                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 2.dp)
                                ) {
                                    Text("XEM CHI TIẾT", fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(15.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
