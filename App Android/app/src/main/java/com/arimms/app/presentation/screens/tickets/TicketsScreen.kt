package com.arimms.app.presentation.screens.tickets

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.FilterList
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
import com.arimms.app.ARImmsApp
import com.arimms.app.domain.model.MaintenanceTicket
import com.arimms.app.domain.model.TicketPriority
import com.arimms.app.domain.model.TicketStatus
import com.arimms.app.presentation.components.CyberCard
import com.arimms.app.presentation.components.PriorityBadge
import com.arimms.app.presentation.components.TicketStatusBadge
import com.arimms.app.presentation.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TicketsScreen(
    onNavigateToTicketDetail: (String) -> Unit
) {
    val repository = ARImmsApp.instance.repository
    var allTickets by remember { mutableStateOf<List<MaintenanceTicket>>(emptyList()) }
    var selectedFilter by remember { mutableStateOf<TicketStatus?>(null) }

    LaunchedEffect(Unit) {
        repository.getTickets().onSuccess {
            allTickets = it
        }
    }

    val filteredTickets = if (selectedFilter != null) {
        allTickets.filter { it.status == selectedFilter }
    } else {
        allTickets
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "QUẢN LÝ PHIẾU BẢO TRÌ & SỰ CỐ",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Black,
                            color = PrimaryCyan,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Danh sách công việc & sự cố hạ tầng",
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // Status Filter Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        FilterChip(
                            selected = selectedFilter == null,
                            onClick = { selectedFilter = null },
                            label = { Text("Tất cả (${allTickets.size})") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = PrimaryCyan.copy(alpha = 0.2f),
                                selectedLabelColor = PrimaryCyan,
                                containerColor = SurfaceCard,
                                labelColor = TextSecondary
                            )
                        )
                    }
                    listOf(
                        TicketStatus.OPEN to "Mở",
                        TicketStatus.ASSIGNED to "Đã giao",
                        TicketStatus.IN_PROGRESS to "Đang xử lý",
                        TicketStatus.RESOLVED to "Đã giải quyết"
                    ).forEach { (status, label) ->
                        val count = allTickets.count { it.status == status }
                        item {
                            FilterChip(
                                selected = selectedFilter == status,
                                onClick = { selectedFilter = if (selectedFilter == status) null else status },
                                label = { Text("$label ($count)") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = PrimaryCyan.copy(alpha = 0.2f),
                                    selectedLabelColor = PrimaryCyan,
                                    containerColor = SurfaceCard,
                                    labelColor = TextSecondary
                                )
                            )
                        }
                    }
                }
            }

            // Ticket Items
            if (filteredTickets.isEmpty()) {
                item {
                    CyberCard(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            "Không tìm thấy phiếu bảo trì phù hợp.",
                            fontSize = 13.sp,
                            color = TextSecondary
                        )
                    }
                }
            } else {
                items(filteredTickets) { ticket ->
                    CyberCard(
                        modifier = Modifier.fillMaxWidth(),
                        borderColor = when (ticket.priority) {
                            TicketPriority.EMERGENCY -> StatusCritical.copy(alpha = 0.6f)
                            TicketPriority.HIGH -> Color(0xFFFF6D00).copy(alpha = 0.5f)
                            else -> BorderStroke
                        },
                        onClick = { onNavigateToTicketDetail(ticket.id) }
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                PriorityBadge(ticket.priority)
                                TicketStatusBadge(ticket.status)
                            }
                            Text(
                                text = ticket.id,
                                fontSize = 11.sp,
                                color = PrimaryCyan,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = ticket.title,
                            style = MaterialTheme.typography.titleMedium,
                            color = TextPrimary,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = ticket.description,
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary,
                            maxLines = 2
                        )

                        Spacer(modifier = Modifier.height(10.dp))
                        Divider(color = BorderStroke)
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Vị trí: Rack ${ticket.rackCode} • ${ticket.nodeName}",
                                fontSize = 11.sp,
                                color = TextTertiary,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = ticket.assignedToName.split(" ").takeLast(2).joinToString(" "),
                                fontSize = 11.sp,
                                color = PrimaryCyan,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }
    }
}
