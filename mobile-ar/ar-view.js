import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { fetchServerTelemetry, submitMaintenanceTicket } from './api';

export default function ARView({ technician, onLogout }) {
  const [scannedServer, setScannedServer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rootCause, setRootCause] = useState('');
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [ticketStatus, setTicketStatus] = useState('IN_PROGRESS');

  // Yêu cầu 2: Module Camera QR Scanner nhận diện máy chủ (<1 giây)
  const handleScanQRCode = async (serverId) => {
    setLoading(true);
    try {
      const data = await fetchServerTelemetry(serverId);
      setScannedServer(data);
      setTicketStatus('IN_PROGRESS');
      setRootCause('');
      setPhotoCaptured(false);
    } catch (e) {
      Alert.alert("Lỗi", "Không nhận diện được thiết bị.");
    } finally {
      setLoading(false);
    }
  };

  // Yêu cầu 4: Chụp ảnh hiện trường
  const handleCapturePhoto = () => {
    setPhotoCaptured(true);
    Alert.alert("Thành công", "Đã chụp ảnh hiện trường sự cố tủ rack.");
  };

  // Yêu cầu 4: Nút chuyển trạng thái RESOLVED cho Ticket
  const handleResolveTicket = async () => {
    if (!rootCause) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập ghi chú nguyên nhân trước khi đóng ticket.");
      return;
    }
    const res = await submitMaintenanceTicket("TICKET-KAN-19", rootCause, photoCaptured);
    setTicketStatus(res.status);
    Alert.alert("Đã cập nhật", `Trạng thái Ticket: ${res.status}. Đã đồng bộ lên hệ thống.`);
  };

  return (
    <View style={styles.container}>
      {/* Header thông tin Kỹ thuật viên */}
      <View style={styles.header}>
        <Text style={styles.headerText}>KTV: {technician.name} ({technician.role})</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Vùng Camera AR & Lớp phủ HUD */}
      <View style={styles.cameraView}>
        <Text style={styles.cameraGuide}>[Camera AR: Hướng camera về phía mã QR/ArUco trên tủ máy chủ]</Text>

        {/* Yêu cầu 3: Lớp phủ AR HUD hiển thị thông số CPU, RAM, Temp bám theo máy chủ */}
        {scannedServer && (
          <View style={styles.arHudCard}>
            <Text style={styles.hudTitle}>⚡ AR HUD: {scannedServer.name}</Text>
            <Text style={styles.hudText}>🌡 Nhiệt độ (Temp): <Text style={styles.highlight}>{scannedServer.temperature}°C</Text></Text>
            <Text style={styles.hudText}>💻 CPU Usage: <Text style={styles.highlight}>{scannedServer.cpu}%</Text></Text>
            <Text style={styles.hudText}>🧠 RAM Usage: <Text style={styles.highlight}>{scannedServer.ram}%</Text></Text>
            <Text style={[styles.statusText, { color: ticketStatus === 'RESOLVED' ? '#22c55e' : '#f59e0b' }]}>
              Trạng thái Ticket: {ticketStatus}
            </Text>
          </View>
        )}
      </View>

      {/* Khu vực thao tác nghiệp vụ xử lý tại chỗ & giả lập quét mã nhanh */}
      <ScrollView style={styles.actionPanel}>
        <Text style={styles.sectionTitle}>1. Giả lập quét mã QR/ArUco (dưới 1s):</Text>
        <View style={styles.scanButtonsRow}>
          <TouchableOpacity style={styles.scanBtn} onPress={() => handleScanQRCode('SRV-A01')}>
            <Text style={styles.scanBtnText}>Quét Server A01</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.scanBtn} onPress={() => handleScanQRCode('SRV-B02')}>
            <Text style={styles.scanBtnText}>Quét Server B02</Text>
          </TouchableOpacity>
        </View>

        {scannedServer && (
          <View style={styles.ticketWorkflowBox}>
            <Text style={styles.sectionTitle}>2. Quy trình Xử lý Sự cố Tại chỗ (KAN-19):</Text>
            
            <TouchableOpacity 
              style={[styles.actionButton, photoCaptured && styles.buttonDone]} 
              onPress={handleCapturePhoto}
            >
              <Text style={styles.actionBtnText}>{photoCaptured ? "✓ Đã chụp ảnh hiện trường" : "📷 Chụp ảnh sự cố"}</Text>
            </TouchableOpacity>

            <TextInput 
              style={styles.textArea}
              placeholder="Nhập ghi chú nguyên nhân hỏng hóc..."
              placeholderTextColor="#94a3b8"
              multiline
              value={rootCause}
              onChangeText={setRootCause}
            />

            <TouchableOpacity style={styles.resolveButton} onPress={handleResolveTicket}>
              <Text style={styles.resolveButtonText}>CHUYỂN TRẠNG THÁI: RESOLVED</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#1e293b', alignItems: 'center' },
  headerText: { color: '#38bdf8', fontWeight: 'bold' },
  logoutText: { color: '#ef4444', fontWeight: 'bold' },
  cameraView: { flex: 2.2, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', padding: 10, position: 'relative' },
  cameraGuide: { color: '#64748b', fontSize: 12, textAlign: 'center' },
  arHudCard: { position: 'absolute', top: 15, width: '90%', backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#3b82f6' },
  hudTitle: { color: '#ffffff', fontWeight: 'bold', fontSize: 15, marginBottom: 6 },
  hudText: { color: '#cbd5e1', fontSize: 13, marginBottom: 3 },
  highlight: { color: '#38bdf8', fontWeight: 'bold' },
  statusText: { fontWeight: 'bold', fontSize: 13, marginTop: 6 },
  actionPanel: { flex: 2.5, backgroundColor: '#0f172a', padding: 15 },
  sectionTitle: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 13, marginBottom: 8 },
  scanButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  scanBtn: { flex: 1, backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  scanBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  ticketWorkflowBox: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  actionButton: { backgroundColor: '#475569', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonDone: { backgroundColor: '#15803d' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  textArea: { backgroundColor: '#0f172a', color: '#fff', padding: 10, borderRadius: 8, height: 60, textAlignVertical: 'top', marginBottom: 10, borderWidth: 1, borderColor: '#475569' },
  resolveButton: { backgroundColor: '#16a34a', padding: 12, borderRadius: 8, alignItems: 'center' },
  resolveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});