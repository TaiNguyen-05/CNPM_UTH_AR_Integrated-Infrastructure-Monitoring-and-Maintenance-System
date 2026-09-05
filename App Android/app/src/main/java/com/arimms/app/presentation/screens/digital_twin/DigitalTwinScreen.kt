package com.arimms.app.presentation.screens.digital_twin

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.viewinterop.AndroidView
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.*
import com.arimms.app.presentation.components.CyberCard
import com.arimms.app.presentation.components.StatusBadge
import com.arimms.app.presentation.theme.*
import kotlinx.coroutines.flow.collectLatest

enum class DigitalTwinViewMode {
    THREE_JS_3D,
    ELEVATION_2D
}

class AndroidThreeJsBridge(
    private val onOpenNodeDetail: (String) -> Unit
) {
    @JavascriptInterface
    fun onNodeSelected(nodeId: String) {
        // Callback when user taps 3D node
    }

    @JavascriptInterface
    fun openNodeDetail(nodeId: String) {
        onOpenNodeDetail(nodeId)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DigitalTwinScreen(
    onNavigateToNodeDetail: (String) -> Unit
) {
    val repository = ARImmsApp.instance.repository

    var viewMode by remember { mutableStateOf(DigitalTwinViewMode.THREE_JS_3D) }
    var sites by remember { mutableStateOf<List<Site>>(emptyList()) }
    var selectedRackId by remember { mutableStateOf("rack-01") }
    var allNodes by remember { mutableStateOf<List<ServerNode>>(emptyList()) }
    var webViewRef by remember { mutableStateOf<WebView?>(null) }

    LaunchedEffect(Unit) {
        repository.getSites().onSuccess {
            sites = it
        }
    }

    LaunchedEffect(Unit) {
        repository.streamAllNodes().collectLatest { nodes ->
            allNodes = nodes
            // Push real-time telemetry updates to Three.js JavaScript scene
            webViewRef?.let { wv ->
                nodes.forEach { node ->
                    val telem = node.currentTelemetry
                    val js = "if(window.updateNodeTelemetry) { window.updateNodeTelemetry('${node.id}', ${telem.cpuUsagePercent}, ${telem.temperatureCelsius}, '${telem.status.name}'); }"
                    wv.post { wv.evaluateJavascript(js, null) }
                }
            }
        }
    }

    val currentRacks = sites.flatMap { it.rooms }.flatMap { it.racks }
    val selectedRack = currentRacks.find { it.id == selectedRackId } ?: currentRacks.firstOrNull()
    val rackNodes = allNodes.filter { it.rackId == selectedRackId }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "DIGITAL TWIN 3D & KHÔNG GIAN",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = PrimaryCyan,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Mô hình Data Center Trực quan với Three.js WebGL",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
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
        ) {
            // View Mode Selector Tabs (Three.js 3D vs 2D Elevation)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // 3D Three.js Tab
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .clickable { viewMode = DigitalTwinViewMode.THREE_JS_3D },
                    color = if (viewMode == DigitalTwinViewMode.THREE_JS_3D) PrimaryCyan.copy(alpha = 0.2f) else SurfaceCard,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (viewMode == DigitalTwinViewMode.THREE_JS_3D) PrimaryCyan else BorderStroke
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(vertical = 10.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.ViewInAr,
                            contentDescription = null,
                            tint = if (viewMode == DigitalTwinViewMode.THREE_JS_3D) PrimaryCyan else TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "3D WEBGL (Three.js)",
                            fontSize = 12.sp,
                            fontWeight = if (viewMode == DigitalTwinViewMode.THREE_JS_3D) FontWeight.Bold else FontWeight.Normal,
                            color = if (viewMode == DigitalTwinViewMode.THREE_JS_3D) PrimaryCyan else TextSecondary
                        )
                    }
                }

                // 2D Elevation Tab
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .clickable { viewMode = DigitalTwinViewMode.ELEVATION_2D },
                    color = if (viewMode == DigitalTwinViewMode.ELEVATION_2D) PrimaryCyan.copy(alpha = 0.2f) else SurfaceCard,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (viewMode == DigitalTwinViewMode.ELEVATION_2D) PrimaryCyan else BorderStroke
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(vertical = 10.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Dns,
                            contentDescription = null,
                            tint = if (viewMode == DigitalTwinViewMode.ELEVATION_2D) PrimaryCyan else TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "2D TỦ RACK (42U)",
                            fontSize = 12.sp,
                            fontWeight = if (viewMode == DigitalTwinViewMode.ELEVATION_2D) FontWeight.Bold else FontWeight.Normal,
                            color = if (viewMode == DigitalTwinViewMode.ELEVATION_2D) PrimaryCyan else TextSecondary
                        )
                    }
                }
            }

            // Body content based on selected mode
            when (viewMode) {
                DigitalTwinViewMode.THREE_JS_3D -> {
                    // Fullscreen 3D Three.js WebGL Viewport
                    Box(modifier = Modifier.fillMaxSize()) {
                        AndroidView(
                            factory = { ctx ->
                                WebView(ctx).apply {
                                    @SuppressLint("SetJavaScriptEnabled")
                                    settings.javaScriptEnabled = true
                                    settings.domStorageEnabled = true
                                    settings.allowFileAccess = true
                                    settings.cacheMode = WebSettings.LOAD_NO_CACHE
                                    setBackgroundColor(0xFF0A0E1A.toInt())

                                    webViewClient = object : WebViewClient() {
                                        override fun onPageFinished(view: WebView?, url: String?) {
                                            super.onPageFinished(view, url)
                                            webViewRef = view
                                        }
                                    }

                                    addJavascriptInterface(
                                        AndroidThreeJsBridge { nodeId ->
                                            onNavigateToNodeDetail(nodeId)
                                        },
                                        "AndroidBridge"
                                    )

                                    loadUrl("file:///android_asset/threejs_digital_twin/index.html")
                                }
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }

                DigitalTwinViewMode.ELEVATION_2D -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        contentPadding = PaddingValues(vertical = 12.dp)
                    ) {
                        // Hierarchy Path Breadcrumb
                        item {
                            Surface(
                                color = SurfaceDark,
                                shape = RoundedCornerShape(10.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, BorderStroke)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = PrimaryCyan, modifier = Modifier.size(16.dp))
                                    Text("DC-Saigon", fontSize = 12.sp, color = TextPrimary, fontWeight = FontWeight.Bold)
                                    Text(">", fontSize = 12.sp, color = TextSecondary)
                                    Text("Server Room A", fontSize = 12.sp, color = TextPrimary, fontWeight = FontWeight.Bold)
                                    Text(">", fontSize = 12.sp, color = TextSecondary)
                                    Text(selectedRack?.code ?: "R-01", fontSize = 12.sp, color = PrimaryCyan, fontWeight = FontWeight.Black)
                                }
                            }
                        }

                        // Rack Switcher Tabs
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                listOf("rack-01" to "Tủ R-01 (Core)", "rack-02" to "Tủ R-02 (Storage/AI)").forEach { (id, label) ->
                                    val isSelected = selectedRackId == id
                                    Surface(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(10.dp))
                                            .clickable { selectedRackId = id },
                                        color = if (isSelected) PrimaryCyan.copy(alpha = 0.2f) else SurfaceCard,
                                        border = androidx.compose.foundation.BorderStroke(
                                            1.dp,
                                            if (isSelected) PrimaryCyan else BorderStroke
                                        ),
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(10.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally
                                        ) {
                                            Text(
                                                text = label,
                                                fontSize = 12.sp,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                                color = if (isSelected) PrimaryCyan else TextSecondary
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // Rack Specification & Telemetry Summary
                        item {
                            selectedRack?.let { rack ->
                                val rackPower = rackNodes.sumOf { it.currentTelemetry.powerWatts }
                                val avgTemp = if (rackNodes.isNotEmpty()) rackNodes.map { it.currentTelemetry.temperatureCelsius }.average() else 24.0

                                CyberCard(modifier = Modifier.fillMaxWidth()) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = rack.name,
                                            style = MaterialTheme.typography.titleMedium,
                                            color = TextPrimary,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Surface(
                                            color = Color(0x2200E5FF),
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text(
                                                text = "${rack.totalUnits}U Standard Rack",
                                                fontSize = 11.sp,
                                                color = PrimaryCyan,
                                                fontFamily = FontFamily.Monospace,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Column {
                                            Text("CÔNG SUẤT", fontSize = 10.sp, color = TextSecondary)
                                            Text(
                                                text = String.format("%.1f / %.0f W", rackPower, rack.powerCapacityWatts),
                                                fontSize = 12.sp,
                                                color = PowerColor,
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = FontFamily.Monospace
                                            )
                                        }
                                        Column {
                                            Text("NHIỆT ĐỘ TỦ", fontSize = 10.sp, color = TextSecondary)
                                            Text(
                                                text = String.format("%.1f°C", avgTemp),
                                                fontSize = 12.sp,
                                                color = if (avgTemp > 30) StatusWarning else StatusHealthy,
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = FontFamily.Monospace
                                            )
                                        }
                                        Column {
                                            Text("SỐ MÁY CHỦ", fontSize = 10.sp, color = TextSecondary)
                                            Text(
                                                text = "${rackNodes.size} Nodes",
                                                fontSize = 12.sp,
                                                color = TextPrimary,
                                                fontWeight = FontWeight.Bold,
                                                fontFamily = FontFamily.Monospace
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // Rack 42U Elevation Cabinet Layout Visualizer
                        item {
                            Text(
                                text = "SƠ ĐỒ VỊ TRÍ U TRONG TỦ RACK (42U ELEVATION)",
                                style = MaterialTheme.typography.titleSmall,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Interactive Rack Chassis Slots
                        item {
                            Surface(
                                color = Color(0xFF0D1424),
                                shape = RoundedCornerShape(12.dp),
                                border = androidx.compose.foundation.BorderStroke(2.dp, Color(0xFF263859)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(
                                    modifier = Modifier.padding(8.dp),
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    rackNodes.sortedByDescending { it.rackUnitPosition }.forEach { node ->
                                        val telem = node.currentTelemetry
                                        val glowColor = when (telem.status) {
                                            NodeHealthStatus.CRITICAL -> StatusCritical
                                            NodeHealthStatus.WARNING -> StatusWarning
                                            else -> StatusHealthy
                                        }

                                        Surface(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(8.dp))
                                                .clickable { onNavigateToNodeDetail(node.id) },
                                            color = SurfaceCard,
                                            border = androidx.compose.foundation.BorderStroke(1.dp, glowColor.copy(alpha = 0.7f)),
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(10.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                                ) {
                                                    Surface(
                                                        color = glowColor.copy(alpha = 0.2f),
                                                        shape = RoundedCornerShape(6.dp)
                                                    ) {
                                                        Text(
                                                            text = "U${node.rackUnitPosition}",
                                                            fontSize = 12.sp,
                                                            fontWeight = FontWeight.Black,
                                                            color = glowColor,
                                                            fontFamily = FontFamily.Monospace,
                                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                                        )
                                                    }

                                                    Column {
                                                        Text(
                                                            text = node.name,
                                                            fontSize = 13.sp,
                                                            fontWeight = FontWeight.Bold,
                                                            color = TextPrimary
                                                        )
                                                        Text(
                                                            text = "${node.model} • Tag: ${node.markerCode} (${node.unitHeight}U)",
                                                            fontSize = 11.sp,
                                                            color = TextSecondary
                                                        )
                                                    }
                                                }

                                                Column(horizontalAlignment = Alignment.End) {
                                                    StatusBadge(status = telem.status)
                                                    Spacer(modifier = Modifier.height(2.dp))
                                                    Text(
                                                        text = "${telem.cpuUsagePercent}% CPU • ${telem.temperatureCelsius}°C",
                                                        fontSize = 10.sp,
                                                        color = TextSecondary,
                                                        fontFamily = FontFamily.Monospace
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Workloads in this Rack
                        item {
                            Text(
                                text = "DỊCH VỤ WORKLOADS TRONG TỦ (${rackNodes.sumOf { it.containers.size }})",
                                style = MaterialTheme.typography.titleSmall,
                                color = TextPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        items(rackNodes.flatMap { node -> node.containers.map { Pair(node, it) } }) { (node, container) ->
                            CyberCard(
                                modifier = Modifier.fillMaxWidth(),
                                borderColor = if (container.state == ContainerState.CRASHED) StatusCritical.copy(alpha = 0.5f) else BorderStroke
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = container.name,
                                            style = MaterialTheme.typography.titleSmall,
                                            color = TextPrimary,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Image: ${container.image} • Node: ${node.name}",
                                            fontSize = 11.sp,
                                            color = TextSecondary,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
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
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
