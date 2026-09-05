package com.arimms.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.arimms.app.presentation.navigation.AppNavigation
import com.arimms.app.presentation.theme.ARIMMSTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ARIMMSTheme {
                AppNavigation()
            }
        }
    }
}
