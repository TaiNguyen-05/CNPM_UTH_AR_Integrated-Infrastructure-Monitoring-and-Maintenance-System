package com.arimms.app.data.local

import android.content.Context
import android.content.SharedPreferences
import com.arimms.app.domain.model.User
import com.arimms.app.domain.model.UserRole
import com.google.gson.Gson

class AppPreferences(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("ar_imms_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    companion object {
        private const val KEY_SERVER_URL = "server_url"
        private const val KEY_DEMO_MODE = "demo_mode"
        private const val KEY_USER_DATA = "user_data"
        private const val KEY_AUTH_TOKEN = "auth_token"
        const val DEFAULT_SERVER_URL = "http://10.0.2.2:9999"
    }


    var serverUrl: String
        get() = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL
        set(value) = prefs.edit().putString(KEY_SERVER_URL, value).apply()

    var isDemoMode: Boolean
        get() = prefs.getBoolean(KEY_DEMO_MODE, true) // Default true for seamless offline evaluation
        set(value) = prefs.edit().putBoolean(KEY_DEMO_MODE, value).apply()

    var authToken: String?
        get() = prefs.getString(KEY_AUTH_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_AUTH_TOKEN, value).apply()

    var currentUser: User?
        get() {
            val json = prefs.getString(KEY_USER_DATA, null) ?: return null
            return try {
                gson.fromJson(json, User::class.java)
            } catch (e: Exception) {
                null
            }
        }
        set(value) {
            if (value == null) {
                prefs.edit().remove(KEY_USER_DATA).apply()
            } else {
                prefs.edit().putString(KEY_USER_DATA, gson.toJson(value)).apply()
            }
        }

    fun clearAuth() {
        prefs.edit().remove(KEY_AUTH_TOKEN).remove(KEY_USER_DATA).apply()
    }
}
