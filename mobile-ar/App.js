import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { loginTechnician } from './api';
import ARView from './ar-view';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('tech01');
  const [password, setPassword] = useState('123456');
  const [technician, setTechnician] = useState(null);

  const handleLogin = async () => {
    try {
      const res = await loginTechnician(username, password);
      setTechnician(res);
      setIsLoggedIn(true);
    } catch (err) {
      Alert.alert("Lỗi đăng nhập", err.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>AR-IMMS Technician Login</Text>
          <Text style={styles.subtitle}>Phân hệ Mobile AR (KAN-19)</Text>
          
          <TextInput 
            style={styles.input} 
            placeholder="Tài khoản kỹ thuật viên" 
            placeholderTextColor="#94a3b8"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Mật khẩu" 
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>ĐĂNG NHẬP (TECHNICIAN)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return <ARView technician={technician} onLogout={() => setIsLoggedIn(false)} />;
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  loginCard: { width: '85%', backgroundColor: '#1e293b', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  loginTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { color: '#38bdf8', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#0f172a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#475569' },
  loginButton: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: '#ffffff', fontWeight: 'bold' }
});