package com.arimms.app

import android.app.Application
import com.arimms.app.data.api.ApiClient
import com.arimms.app.data.api.SocketManager
import com.arimms.app.data.local.AppPreferences
import com.arimms.app.data.repository.ARImmsRepositoryImpl
import com.arimms.app.domain.repository.ARImmsRepository

class ARImmsApp : Application() {

    lateinit var preferences: AppPreferences
        private set
    lateinit var apiClient: ApiClient
        private set
    lateinit var socketManager: SocketManager
        private set
    lateinit var repository: ARImmsRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        preferences = AppPreferences(this)
        apiClient = ApiClient(preferences)
        socketManager = SocketManager(preferences)
        repository = ARImmsRepositoryImpl(preferences, apiClient, socketManager)

        // Always connect to backend server in 100% online mode
        socketManager.connect()
    }

    companion object {
        lateinit var instance: ARImmsApp
            private set
    }
}
