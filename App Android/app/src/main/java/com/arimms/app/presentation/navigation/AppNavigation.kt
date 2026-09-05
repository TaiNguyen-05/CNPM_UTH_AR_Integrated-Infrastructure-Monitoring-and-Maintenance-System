package com.arimms.app.presentation.navigation

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.arimms.app.ARImmsApp
import com.arimms.app.presentation.screens.alerts.AlertsScreen
import com.arimms.app.presentation.screens.ar_scanner.ARScannerScreen
import com.arimms.app.presentation.screens.auth.LoginScreen
import com.arimms.app.presentation.screens.dashboard.DashboardScreen
import com.arimms.app.presentation.screens.digital_twin.DigitalTwinScreen
import com.arimms.app.presentation.screens.node_detail.NodeDetailScreen
import com.arimms.app.presentation.screens.settings.SettingsScreen
import com.arimms.app.presentation.screens.tickets.TicketDetailScreen
import com.arimms.app.presentation.screens.tickets.TicketsScreen
import com.arimms.app.presentation.theme.*

data class BottomNavItem(
    val screen: Screen,
    val icon: ImageVector,
    val label: String
)

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val repository = ARImmsApp.instance.repository
    val isLoggedIn = repository.getCurrentUser() != null

    val startDestination = if (isLoggedIn) Screen.Dashboard.route else Screen.Login.route

    val bottomNavItems = listOf(
        BottomNavItem(Screen.Dashboard, Icons.Default.Dashboard, "Tổng quan"),
        BottomNavItem(Screen.ARScanner, Icons.Default.QrCodeScanner, "Quét AR"),
        BottomNavItem(Screen.DigitalTwin, Icons.Default.Lan, "Digital Twin"),
        BottomNavItem(Screen.Tickets, Icons.Default.Assignment, "Bảo trì"),
        BottomNavItem(Screen.Settings, Icons.Default.Settings, "Cài đặt")
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = bottomNavItems.any { it.screen.route == currentRoute }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = SurfaceDark,
                    tonalElevation = 8.dp,
                    modifier = Modifier.border(1.dp, BorderStroke)
                ) {
                    bottomNavItems.forEach { item ->
                        val isSelected = currentRoute == item.screen.route
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                navController.navigate(item.screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = item.icon,
                                    contentDescription = item.label,
                                    modifier = Modifier.size(22.dp)
                                )
                            },
                            label = {
                                Text(
                                    text = item.label,
                                    fontSize = 10.sp
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = BgDark,
                                selectedTextColor = PrimaryCyan,
                                indicatorColor = PrimaryCyan,
                                unselectedIconColor = TextSecondary,
                                unselectedTextColor = TextSecondary
                            )
                        )
                    }
                }
            }
        },
        containerColor = BgDark
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(Screen.Login.route) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateToSettings = {
                        navController.navigate(Screen.Settings.route)
                    }
                )
            }

            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    onNavigateToARScanner = { navController.navigate(Screen.ARScanner.route) },
                    onNavigateToNodeDetail = { nodeId -> navController.navigate(Screen.NodeDetail.createRoute(nodeId)) },
                    onNavigateToTickets = { navController.navigate(Screen.Tickets.route) },
                    onNavigateToTicketDetail = { ticketId -> navController.navigate(Screen.TicketDetail.createRoute(ticketId)) },
                    onNavigateToAlerts = { navController.navigate(Screen.Alerts.route) },
                    onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
                )
            }

            composable(Screen.ARScanner.route) {
                ARScannerScreen(
                    onNavigateToNodeDetail = { nodeId -> navController.navigate(Screen.NodeDetail.createRoute(nodeId)) },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.DigitalTwin.route) {
                DigitalTwinScreen(
                    onNavigateToNodeDetail = { nodeId -> navController.navigate(Screen.NodeDetail.createRoute(nodeId)) }
                )
            }

            composable(Screen.Tickets.route) {
                TicketsScreen(
                    onNavigateToTicketDetail = { ticketId -> navController.navigate(Screen.TicketDetail.createRoute(ticketId)) }
                )
            }

            composable(
                route = Screen.TicketDetail.route,
                arguments = listOf(navArgument("ticketId") { type = NavType.StringType })
            ) { backStackEntry ->
                val ticketId = backStackEntry.arguments?.getString("ticketId") ?: ""
                TicketDetailScreen(
                    ticketId = ticketId,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToNodeDetail = { nodeId -> navController.navigate(Screen.NodeDetail.createRoute(nodeId)) }
                )
            }

            composable(
                route = Screen.NodeDetail.route,
                arguments = listOf(navArgument("nodeId") { type = NavType.StringType })
            ) { backStackEntry ->
                val nodeId = backStackEntry.arguments?.getString("nodeId") ?: ""
                NodeDetailScreen(
                    nodeId = nodeId,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToTickets = { navController.navigate(Screen.Tickets.route) }
                )
            }

            composable(Screen.Alerts.route) {
                AlertsScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToNodeDetail = { nodeId -> navController.navigate(Screen.NodeDetail.createRoute(nodeId)) }
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
