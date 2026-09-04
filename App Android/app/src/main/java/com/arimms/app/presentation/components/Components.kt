package com.arimms.app.presentation.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arimms.app.domain.model.AlertSeverity
import com.arimms.app.domain.model.NodeHealthStatus
import com.arimms.app.domain.model.TelemetryMetric
import com.arimms.app.domain.model.TicketPriority
import com.arimms.app.domain.model.TicketStatus
import com.arimms.app.presentation.theme.*

@Composable
fun StatusBadge(
    status: NodeHealthStatus,
    modifier: Modifier = Modifier,
    showLabel: Boolean = true
) {
    val (color, bgColor, text) = when (status) {
        NodeHealthStatus.HEALTHY -> Triple(StatusHealthy, StatusHealthyBg, "HEALTHY")
        NodeHealthStatus.WARNING -> Triple(StatusWarning, StatusWarningBg, "WARNING")
        NodeHealthStatus.CRITICAL -> Triple(StatusCritical, StatusCriticalBg, "CRITICAL")
        NodeHealthStatus.OFFLINE -> Triple(StatusOffline, StatusOfflineBg, "OFFLINE")
    }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .border(1.dp, color.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(if (status == NodeHealthStatus.CRITICAL || status == NodeHealthStatus.WARNING) color.copy(alpha = alpha) else color)
        )
        if (showLabel) {
            Text(
                text = text,
                color = color,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

@Composable
fun SeverityBadge(severity: AlertSeverity) {
    val (color, bgColor, text) = when (severity) {
        AlertSeverity.CRITICAL -> Triple(StatusCritical, StatusCriticalBg, "CRITICAL")
        AlertSeverity.WARNING -> Triple(StatusWarning, StatusWarningBg, "WARNING")
        AlertSeverity.INFO -> Triple(PrimaryCyan, Color(0x2200E5FF), "INFO")
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .border(1.dp, color.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = text,
            color = color,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
    }
}

@Composable
fun PriorityBadge(priority: TicketPriority) {
    val (color, text) = when (priority) {
        TicketPriority.EMERGENCY -> Pair(StatusCritical, "EMERGENCY")
        TicketPriority.HIGH -> Pair(Color(0xFFFF6D00), "HIGH")
        TicketPriority.MEDIUM -> Pair(StatusWarning, "MEDIUM")
        TicketPriority.LOW -> Pair(PrimaryCyan, "LOW")
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(color.copy(alpha = 0.15f))
            .border(1.dp, color.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = text,
            color = color,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
    }
}

@Composable
fun TicketStatusBadge(status: TicketStatus) {
    val (color, text) = when (status) {
        TicketStatus.OPEN -> Pair(StatusCritical, "OPEN")
        TicketStatus.ASSIGNED -> Pair(StatusWarning, "ASSIGNED")
        TicketStatus.IN_PROGRESS -> Pair(PrimaryCyan, "IN PROGRESS")
        TicketStatus.RESOLVED -> Pair(StatusHealthy, "RESOLVED")
        TicketStatus.CLOSED -> Pair(StatusOffline, "CLOSED")
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(color.copy(alpha = 0.15f))
            .border(1.dp, color.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = text,
            color = color,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
    }
}

@Composable
fun CyberCard(
    modifier: Modifier = Modifier,
    borderColor: Color = BorderStroke,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val cardModifier = if (onClick != null) {
        modifier
            .clip(RoundedCornerShape(14.dp))
            .background(SurfaceCard)
            .border(1.dp, borderColor, RoundedCornerShape(14.dp))
            .clickable { onClick() }
            .padding(14.dp)
    } else {
        modifier
            .clip(RoundedCornerShape(14.dp))
            .background(SurfaceCard)
            .border(1.dp, borderColor, RoundedCornerShape(14.dp))
            .padding(14.dp)
    }

    Column(modifier = cardModifier) {
        content()
    }
}

@Composable
fun MetricGauge(
    label: String,
    value: Double,
    unit: String = "%",
    maxValue: Double = 100.0,
    accentColor: Color = PrimaryCyan,
    modifier: Modifier = Modifier,
    size: Dp = 88.dp
) {
    val progress = (value / maxValue).toFloat().coerceIn(0f, 1f)
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(durationMillis = 600, easing = FastOutSlowInEasing),
        label = "gauge"
    )

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(size)
        ) {
            Canvas(modifier = Modifier.fillMaxSize().padding(4.dp)) {
                val strokeWidth = 7.dp.toPx()
                // Track
                drawArc(
                    color = BorderStroke,
                    startAngle = 140f,
                    sweepAngle = 260f,
                    useCenter = false,
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
                // Progress
                drawArc(
                    brush = Brush.sweepGradient(
                        0.0f to accentColor.copy(alpha = 0.5f),
                        0.7f to accentColor,
                        1.0f to accentColor
                    ),
                    startAngle = 140f,
                    sweepAngle = 260f * animatedProgress,
                    useCenter = false,
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = String.format("%.0f", value),
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = unit,
                    fontSize = 10.sp,
                    color = TextSecondary
                )
            }
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            fontSize = 11.sp,
            color = TextSecondary,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun MetricItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, fontSize = 10.sp, color = TextSecondary, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            fontSize = 12.sp,
            color = color,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
    }
}


@Composable
fun MiniSparkline(
    metrics: List<TelemetryMetric>,
    valueSelector: (TelemetryMetric) -> Double,
    lineColor: Color = PrimaryCyan,
    modifier: Modifier = Modifier.fillMaxWidth().height(48.dp)
) {
    if (metrics.isEmpty()) return

    val values = metrics.map { valueSelector(it) }
    val minVal = (values.minOrNull() ?: 0.0).coerceAtLeast(0.0)
    val maxVal = (values.maxOrNull() ?: 100.0).coerceAtLeast(minVal + 10.0)

    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val stepX = if (values.size > 1) width / (values.size - 1) else width

        val path = Path()
        val fillPath = Path()

        values.forEachIndexed { index, v ->
            val x = index * stepX
            val ratio = ((v - minVal) / (maxVal - minVal)).toFloat().coerceIn(0f, 1f)
            val y = height - (ratio * (height - 8.dp.toPx())) - 4.dp.toPx()

            if (index == 0) {
                path.moveTo(x, y)
                fillPath.moveTo(x, height)
                fillPath.lineTo(x, y)
            } else {
                path.lineTo(x, y)
                fillPath.lineTo(x, y)
            }

            if (index == values.size - 1) {
                fillPath.lineTo(x, height)
                fillPath.close()
            }
        }

        // Draw gradient fill
        drawPath(
            path = fillPath,
            brush = Brush.verticalGradient(
                colors = listOf(lineColor.copy(alpha = 0.25f), Color.Transparent),
                startY = 0f,
                endY = height
            )
        )

        // Draw stroke line
        drawPath(
            path = path,
            color = lineColor,
            style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
        )
    }
}

@Composable
fun SafetyConfirmDialog(
    title: String,
    message: String,
    confirmActionText: String = "XÁC NHẬN THỰC HIỆN",
    isDestructive: Boolean = true,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    var checkAgreed by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = if (isDestructive) StatusCritical else StatusWarning,
                modifier = Modifier.size(36.dp)
            )
        },
        title = {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = TextPrimary,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
                Surface(
                    color = SurfaceDark,
                    shape = RoundedCornerShape(8.dp),
                    border = borderStroke(1.dp, BorderStroke)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { checkAgreed = !checkAgreed }
                            .padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = checkAgreed,
                            onCheckedChange = { checkAgreed = it },
                            colors = CheckboxDefaults.colors(checkedColor = if (isDestructive) StatusCritical else PrimaryCyan)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Tôi đã xác minh vị trí phần cứng & đồng ý thực hiện.",
                            fontSize = 12.sp,
                            color = TextPrimary
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                enabled = checkAgreed,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isDestructive) StatusCritical else PrimaryCyan,
                    contentColor = if (isDestructive) Color.White else BgDark
                )
            ) {
                Text(confirmActionText, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("HỦY BỎ", color = TextSecondary)
            }
        },
        containerColor = SurfaceCard,
        shape = RoundedCornerShape(16.dp)
    )
}

fun borderStroke(width: Dp, color: Color) = androidx.compose.foundation.BorderStroke(width, color)
