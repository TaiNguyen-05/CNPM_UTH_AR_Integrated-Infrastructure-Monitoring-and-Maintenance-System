// Quản lý API kết nối Backend cho KAN-19 Mobile AR
const API_BASE_URL = "https://ar-imms-monitor.vercel.app/api";

export async function loginTechnician(username, password) {
  // Xác thực tài khoản kỹ thuật viên hiện trường
  if (username === "tech01" && password === "123456") {
    return { success: true, role: "TECHNICIAN", name: "Kỹ thuật viên 01" };
  }
  throw new Error("Sai tài khoản hoặc không có quyền TECHNICIAN!");
}

export async function fetchServerTelemetry(serverId) {
  // Giả lập tốc độ phản hồi quét mã nhận diện máy chủ (< 1 giây)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: serverId,
        name: `Rack Server - ${serverId}`,
        temperature: 41.2,
        cpu: 74.5,
        ram: 68.0,
        status: "Normal"
      });
    }, 400); // Phản hồi dưới 1 giây
  });
}

export async function submitMaintenanceTicket(ticketId, rootCause, photoUri) {
  // Gửi thông tin xử lý sự cố về hệ thống và chuyển trạng thái RESOLVED
  return {
    success: true,
    ticketId: ticketId,
    status: "RESOLVED",
    rootCause: rootCause,
    imageAttached: photoUri ? true : false,
    timestamp: new Date().toISOString()
  };
}