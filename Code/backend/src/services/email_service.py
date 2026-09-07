import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

class EmailService:
    @property
    def smtp_server(self):
        return os.getenv("SMTP_SERVER", "smtp.gmail.com")

    @property
    def smtp_port(self):
        return int(os.getenv("SMTP_PORT", 587))

    @property
    def smtp_user(self):
        return os.getenv("SMTP_USER", "")

    @property
    def smtp_password(self):
        return os.getenv("SMTP_PASSWORD", "")

    @property
    def sender_name(self):
        return os.getenv("EMAIL_SENDER_NAME", "Trung Tâm Giám Sát AR-IMMS")

    @property
    def app_url(self):
        return os.getenv("APP_URL", os.getenv("FRONTEND_URL", "https://ar-imms-monitor.vercel.app")).rstrip("/")

    def _is_configured(self) -> bool:
        return bool(self.smtp_user and self.smtp_password and self.smtp_password != "your_16_character_app_password")

    def send_email(self, recipients: list[str], subject: str, html_body: str, text_body: str = "") -> bool:
        if not recipients:
            print("[EmailService] Không có danh sách người nhận email.")
            return False

        if not self._is_configured():
            print(f"[EmailService - MÔ PHỎNG] Chưa cấu hình SMTP_USER / SMTP_PASSWORD trong .env.")
            print(f"[EmailService - MÔ PHỎNG] Sẽ gửi email tới {len(recipients)} người nhận: {recipients}")
            print(f"[EmailService - MÔ PHỎNG] Tiêu đề: {subject}")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.sender_name} <{self.smtp_user}>"
            msg["To"] = ", ".join(recipients)

            if text_body:
                msg.attach(MIMEText(text_body, "plain", "utf-8"))
            if html_body:
                msg.attach(MIMEText(html_body, "html", "utf-8"))

            server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.sendmail(self.smtp_user, recipients, msg.as_string())
            server.quit()

            print(f"[EmailService] Đã gửi email thành công tới: {', '.join(recipients)}")
            return True
        except Exception as e:
            print(f"[EmailService] Lỗi khi gửi email qua SMTP: {e}")
            return False

    def send_incident_alert(self, node_id: str, node_name: str, rack_id: str, severity: str, message: str, recipients: list[str]) -> bool:
        if not recipients:
            return False

        subject = f"🚨 [AR-IMMS CẢNH BÁO SỰ CỐ] Server Node {node_name} ({node_id}) Bị Mất Kết Nối"
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #000000; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cccccc; border-radius: 6px; overflow: hidden; }}
            .header {{ background-color: #dc2626; padding: 18px 24px; color: #ffffff; text-align: left; }}
            .header h1 {{ margin: 0; font-size: 18px; font-weight: bold; }}
            .header p {{ margin: 4px 0 0 0; font-size: 13px; color: #ffffff; }}
            .content {{ padding: 24px; background-color: #ffffff; color: #000000; }}
            .alert-banner {{ background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #991b1b; font-weight: bold; }}
            .info-table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
            .info-table th, .info-table td {{ padding: 10px 12px; border: 1px solid #e5e7eb; font-size: 13px; text-align: left; }}
            .info-table th {{ background-color: #f3f4f6; color: #000000; width: 35%; font-weight: bold; }}
            .info-table td {{ color: #000000; background-color: #ffffff; }}
            .btn {{ display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 13px; border-radius: 4px; }}
            .footer {{ background-color: #f9fafb; padding: 14px 24px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #666666; text-align: center; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HỆ THỐNG GIÁM SÁT HẠ TẦNG AR-IMMS</h1>
              <p>THÔNG BÁO SỰ CỐ KHẨN CẤP ĐẾN KỸ THUẬT VIÊN</p>
            </div>
            <div class="content">
              <div class="alert-banner">
                MỨC ĐỘ NGUY CẤP: {severity.upper()} - PHÁT HIỆN MẤT KẾT NỐI
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #000000; margin: 0 0 16px 0;">
                Hệ thống Watchdog giám sát tự động phát hiện thiết bị máy chủ dưới đây đã ngừng gửi tín hiệu Heartbeat và hiện ở trạng thái <strong>MẤT KẾT NỐI (OFFLINE)</strong>:
              </p>
              
              <table class="info-table">
                <tr>
                  <th>Tên Máy Chủ:</th>
                  <td><strong>{node_name}</strong></td>
                </tr>
                <tr>
                  <th>Mã Định Danh (ID):</th>
                  <td><strong>{node_id}</strong></td>
                </tr>
                <tr>
                  <th>Vị Trí Tủ Rack:</th>
                  <td>{rack_id or 'Rack Alpha'}</td>
                </tr>
                <tr>
                  <th>Mô Tả Sự Cố:</th>
                  <td style="color: #dc2626; font-weight: bold;">{message}</td>
                </tr>
                <tr>
                  <th>Thời Gian Ghi Nhận:</th>
                  <td>{timestamp}</td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #333333; line-height: 1.5;">
                Vui lòng mở ứng dụng AR-IMMS trên Web Dashboard hoặc Kính AR để quét mã QR định danh và tiến hành kiểm tra khắc phục.
              </p>

              <div style="text-align: center; margin-top: 20px;">
                <a href="{self.app_url}/#operations" class="btn">
                  Mở Trung Tâm Điều Khiển AR-IMMS
                </a>
              </div>
            </div>
            <div class="footer">
              Email này được gửi tự động bởi Hệ thống AR-IMMS. Vui lòng không trả lời trực tiếp email này.
            </div>
          </div>
        </body>
        </html>
        """

        text_body = f"""
        [AR-IMMS CẢNH BÁO SỰ CỐ]
        Thiết bị: {node_name} ({node_id})
        Vị trí tủ: {rack_id}
        Mức độ: {severity}
        Mô tả: {message}
        Thời gian: {timestamp}
        Truy cập hệ thống: {self.app_url}/
        """

        return self.send_email(recipients, subject, html_body, text_body)

    def send_welcome_approved_email(self, recipient_email: str, full_name: str, role: str) -> bool:
        subject = f"✅ [AR-IMMS] Tài Khoản Của Bạn Đã Được Admin Phê Duyệt"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #000000; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cccccc; border-radius: 6px; overflow: hidden; }}
            .header {{ background-color: #0284c7; padding: 18px 24px; color: #ffffff; text-align: left; }}
            .header h1 {{ margin: 0; font-size: 18px; font-weight: bold; }}
            .header p {{ margin: 4px 0 0 0; font-size: 13px; color: #ffffff; }}
            .content {{ padding: 24px; background-color: #ffffff; color: #000000; font-size: 14px; line-height: 1.6; }}
            .info-box {{ background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; margin: 16px 0; color: #15803d; font-weight: 500; }}
            .btn {{ display: inline-block; padding: 12px 24px; background-color: #0284c7; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 13px; border-radius: 4px; }}
            .footer {{ background-color: #f9fafb; padding: 14px 24px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #666666; text-align: center; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HỆ THỐNG GIÁM SÁT HẠ TẦNG AR-IMMS</h1>
              <p>XÁC NHẬN PHÊ DUYỆT TÀI KHOẢN NGƯỜI DÙNG</p>
            </div>
            <div class="content">
              <p style="margin-top: 0; color: #000000;">Xin chào <strong>{full_name}</strong>,</p>
              
              <div class="info-box">
                Tài khoản Google <strong>{recipient_email}</strong> của bạn đã được <strong>Quản trị viên (Admin) phê duyệt</strong> thành công.
              </div>

              <p style="color: #000000;">
                <strong>Vai trò của bạn:</strong> <span style="background-color: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-weight: bold;">{role.upper()}</span>
              </p>
              
              <p style="color: #000000;">
                Từ thời điểm này, bạn có thể đăng nhập vào hệ thống để quét mã QR AR máy chủ, tiếp nhận phiếu bảo trì và sẽ tự động nhận email cảnh báo khẩn cấp khi phòng máy có sự cố hoặc mất kết nối.
              </p>

              <div style="text-align: center; margin-top: 24px;">
                <a href="{self.app_url}/" class="btn">
                  Đăng Nhập Vào Hệ Thống Ngay
                </a>
              </div>
            </div>
            <div class="footer">
              AR-IMMS Platform • Augmented Reality Infrastructure Monitoring System
            </div>
          </div>
        </body>
        </html>
        """
        return self.send_email([recipient_email], subject, html_body, f"Chào {full_name}, tài khoản {recipient_email} đã được phê duyệt. Truy cập tại: {self.app_url}/")

email_service = EmailService()

