package com.arimms.app.presentation.navigation

sealed class Screen(val route: String, val title: String) {
    object Login : Screen("login", "Đăng nhập")
    object Dashboard : Screen("dashboard", "Tổng quan")
    object ARScanner : Screen("ar_scanner", "Quét AR Marker")
    object DigitalTwin : Screen("digital_twin", "Digital Twin")
    object Tickets : Screen("tickets", "Phiếu bảo trì")
    object TicketDetail : Screen("ticket_detail/{ticketId}", "Chi tiết phiếu") {
        fun createRoute(ticketId: String) = "ticket_detail/$ticketId"
    }
    object NodeDetail : Screen("node_detail/{nodeId}", "Chi tiết Server") {
        fun createRoute(nodeId: String) = "node_detail/$nodeId"
    }
    object Alerts : Screen("alerts", "Cảnh báo hệ thống")
    object Settings : Screen("settings", "Cấu hình")
}
