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
        private const val KEY_USER_DATA = "user_data"
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_REGISTERED_USERS = "registered_users"
        const val DEFAULT_SERVER_URL = "https://ar-imms-monitor.vercel.app"
    }

    var serverUrl: String
        get() = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL
        set(value) = prefs.edit().putString(KEY_SERVER_URL, value).apply()

    val isDemoMode: Boolean
        get() = false // 100% Pure Online Mode

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

    fun getRegisteredUsers(): List<User> {
        val json = prefs.getString(KEY_REGISTERED_USERS, null) ?: return emptyList()
        return try {
            val type = object : com.google.gson.reflect.TypeToken<List<User>>() {}.type
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveRegisteredUser(user: User) {
        val current = getRegisteredUsers().toMutableList()
        current.removeAll { it.email.equals(user.email, ignoreCase = true) || it.username.equals(user.username, ignoreCase = true) || it.id == user.id }
        current.add(0, user)
        prefs.edit().putString(KEY_REGISTERED_USERS, gson.toJson(current)).apply()
    }

    fun clearAuth() {
        prefs.edit().remove(KEY_AUTH_TOKEN).remove(KEY_USER_DATA).apply()
    }
}
