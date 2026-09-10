# TỔNG HỢP MÃ NGUỒN SEQUENCE DIAGRAM (PLANTUML CHUẨN KỸ THUẬT CHO DRAW.IO)
## HỆ THỐNG GIÁM SÁT VÀ BẢO TRÌ CƠ SỞ HẠ TẦNG TÍCH HỢP AR (AR-IMMS)

> **Phong cách vẽ:** Chuẩn kỹ thuật (Engineering / Clean Monochrome), **khung hộp vuông vắn (Sharp 90°)**, **đường kẻ thẳng đen nét**, không bóng đổ, có đánh số thứ tự bước (`autonumber`), phân khối kích hoạt (`activate/deactivate`) rõ ràng, tự nhiên và chuyên nghiệp khi import vào Draw.io.

---

### 📌 HƯỚNG DẪN IMPORT VÀO DRAW.IO:
1. Mở trang web [draw.io](https://app.diagrams.net/).
2. Trên thanh menu chọn: **Arrange** (Sắp xếp) -> **Insert** (Chèn) -> **Advanced** (Nâng cao) -> **PlantUML...**
3. Sao chép (Copy) toàn bộ đoạn mã trong khối `@startuml ... @enduml` của biểu đồ bạn muốn vẽ và dán vào ô nhập liệu.
4. Nhấn **Insert** (Chèn). Draw.io sẽ tự động dựng thành biểu đồ tuần tự hoàn chỉnh.

---

## MỤC LỤC CÁC BIỂU ĐỒ TUẦN TỰ (SEQUENCE DIAGRAMS)
- [SD-01: Quy trình Xác thực Người dùng & Cấp quyền JWT (Authentication & RBAC)](#sd-01-quy-trình-xác-thực-người-dùng--cấp-quyền-jwt)
- [SD-02: Quy trình Khai báo Máy chủ & Sinh mã Spatial QR (Asset Registration & QR Binding)](#sd-02-quy-trình-khai-báo-máy-chủ--sinh-mã-spatial-qr)
- [SD-03: Quy trình Thu thập Telemetry & Phát sóng Real-time (Telemetry Ingestion & Socket Stream)](#sd-03-quy-trình-thu-thập-telemetry--phát-sóng-real-time)
- [SD-04: Quy trình Phát hiện Máy chủ Mất kết nối (Heartbeat Timeout & Offline Alert)](#sd-04-quy-trình-phát-hiện-máy-chủ-mất-kết-nối)
- [SD-05: Quy trình Đánh giá Ngưỡng & Tự động Tạo Phiếu Sự cố (Threshold & Auto-Ticket Engine)](#sd-05-quy-trình-đánh-giá-ngưỡng--tự-động-tạo-phiếu-sự-cố)
- [SD-06: Quy trình Phân công & Điều phối Phiếu Bảo trì (Ticket Dispatching & Notification)](#sd-06-quy-trình-phân-công--điều-phối-phiếu-bảo-trì)
- [SD-07: Quy trình Quét Camera AR & Dựng HUD Không gian (AR Scanner & HUD Realtime)](#sd-07-quy-trình-quét-camera-ar--dựng-hud-không-gian)
- [SD-08: Quy trình Xử lý Sự cố Hiện trường & Nghiệm thu Đóng phiếu (On-site Ticket Resolution)](#sd-08-quy-trình-xử-lý-sự-cố-hiện-trường--nghiệm-thu-đóng-phiếu)
- [SD-09: Quy trình Điều khiển Từ xa An toàn & Ghi Nhật ký Kiểm toán (Safe Remote Action & Audit Trail)](#sd-09-quy-trình-điều-khiển-từ-xa-an-toàn--ghi-nhật-ký-kiểm-toán)
- [SD-10: Quy trình Báo cáo Hiệu năng, Dự báo Dung lượng & PUE (Analytics & Capacity Forecast)](#sd-10-quy-trình-báo-cáo-hiệu-năng-dự-báo-dung-lượng--pue)

---

### SD-01: Quy trình Xác thực Người dùng & Cấp quyền JWT
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam ActorBorderColor #000000
skinparam ActorBackgroundColor #FFFFFF

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

skinparam SequenceGroupBorderColor #000000
skinparam SequenceGroupBackgroundColor #FFFFFF
skinparam SequenceGroupBorderThickness 1.2

actor "Người dùng\n(Admin/Op/Tech)" as User
participant "Giao diện Client\n(Web/Mobile)" as Client
participant "Auth Controller\n(Flask API)" as AuthCtrl
participant "JWT Guard &\nAuth Service" as AuthService
database "PostgreSQL\n(Supabase)" as DB

User -> Client: Nhập Username & Password, bấm Đăng nhập
activate Client

Client -> AuthCtrl: POST /api/auth/login {username, password}
activate AuthCtrl

AuthCtrl -> AuthService: authenticate_user(username, password)
activate AuthService

AuthService -> DB: SELECT * FROM users WHERE username = ?
activate DB
DB --> AuthService: Trả về bản ghi User (password_hash, role, is_active)
deactivate DB

alt Tài khoản không tồn tại hoặc is_active == false
    AuthService --> AuthCtrl: Ném ngoại lệ Unauthorized (Tài khoản không hợp lệ)
    AuthCtrl --> Client: HTTP 401/403 {message: "Tài khoản không hợp lệ"}
    Client --> User: Hiển thị lỗi trên màn hình
else Tài khoản hợp lệ
    AuthService -> AuthService: Kiểm tra Bcrypt hash(password, password_hash)
    alt Mật khẩu không đúng
        AuthService --> AuthCtrl: Ném ngoại lệ Unauthorized (Sai mật khẩu)
        AuthCtrl --> Client: HTTP 401 {message: "Mật khẩu không chính xác"}
        Client --> User: Hiển thị lỗi sai mật khẩu
    else Mật khẩu trùng khớp
        AuthService -> AuthService: generate_tokens(user_id, role)
        AuthService -> DB: INSERT INTO audit_logs (user_id, action: "USER_LOGIN", ip)
        activate DB
        DB --> AuthService: Ghi log thành công
        deactivate DB
        
        AuthService --> AuthCtrl: Trả về (access_token, refresh_token, user_info)
        deactivate AuthService
        
        AuthCtrl --> Client: HTTP 200 OK {tokens, user}
        deactivate AuthCtrl
        
        Client -> Client: Lưu Token vào SecureStorage & Điều hướng theo Role
        Client --> User: Hiển thị giao diện tương ứng (Dashboard/AR View)
        deactivate Client
    end
end
@enduml
```

---

### SD-02: Quy trình Khai báo Máy chủ & Sinh mã Spatial QR
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam ActorBorderColor #000000
skinparam ActorBackgroundColor #FFFFFF

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

skinparam SequenceGroupBorderColor #000000
skinparam SequenceGroupBackgroundColor #FFFFFF

actor "System Operator" as Op
participant "Web Admin Portal" as Web
participant "Node Controller" as NodeCtrl
participant "Asset Service" as AssetSvc
participant "QR Generator" as QRGen
database "Database\n(Supabase)" as DB
participant "Socket.IO Gateway" as Socket

Op -> Web: Nhập thông tin Server mới (Rack, U-Slot, IP, Specs) và bấm "Tạo mới"
activate Web

Web -> NodeCtrl: POST /api/nodes (Bearer JWT, payload)
activate NodeCtrl

NodeCtrl -> AssetSvc: create_server(rack_id, u_pos, ip, specs)
activate AssetSvc

AssetSvc -> DB: SELECT id FROM servers WHERE rack_id = ? AND u_position = ?
activate DB
DB --> AssetSvc: Kết quả kiểm tra vị trí U-Slot
deactivate DB

alt Vị trí U-Slot đã bị chiếm dụng
    AssetSvc --> NodeCtrl: Báo lỗi Conflict (Trùng U-Slot)
    NodeCtrl --> Web: HTTP 400 Bad Request ("Vị trí U đã có thiết bị")
    Web --> Op: Hiển thị cảnh báo trùng vị trí
else Vị trí còn trống
    AssetSvc -> AssetSvc: Sinh UUID & Chuỗi Spatial QR Identifier
    AssetSvc -> QRGen: generate_qr_image(qr_identifier)
    activate QRGen
    QRGen --> AssetSvc: Trả về Base64 / URL ảnh QR Code
    deactivate QRGen
    
    AssetSvc -> DB: INSERT INTO servers (id, rack_id, u_pos, qr_identifier, status: "HEALTHY")
    activate DB
    AssetSvc -> DB: INSERT INTO audit_logs (action: "CREATE_SERVER", details)
    DB --> AssetSvc: Lưu thành công
    deactivate DB
    
    AssetSvc -> Socket: emit("asset_updated", {server_id, rack_id})
    activate Socket
    Socket --> Web: Broadcast cập nhật Digital Twin tới các Client
    deactivate Socket
    
    AssetSvc --> NodeCtrl: Trả về đối tượng Server mới tạo kèm QR Code
    deactivate AssetSvc
    
    NodeCtrl --> Web: HTTP 201 Created {server, qr_code_url}
    deactivate NodeCtrl
    
    Web -> Web: Tự động vẽ Server lên mô hình 2D/3D Rack Layout
    Web --> Op: Hiển thị thông báo thành công & Tùy chọn In tem QR
    deactivate Web
end
@enduml
```

---

### SD-03: Quy trình Thu thập Telemetry & Phát sóng Real-time
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

participant "Collector Agent\n(psutil + Docker)" as Agent
participant "Telemetry Controller\n(Flask Ingestion)" as IngestCtrl
participant "Telemetry Service" as TelemSvc
database "Database\n(PostgreSQL)" as DB
participant "Socket.IO Gateway" as Socket
participant "Web Dashboard &\nMobile AR HUD" as Client

loop Định kỳ mỗi 5 giây
    Agent -> Agent: Đọc CPU%, RAM%, Disk%, Net I/O & Docker Container Stats
    Agent -> IngestCtrl: POST /api/telemetry/ingest {server_id, metrics, workloads}
    activate IngestCtrl
    
    IngestCtrl -> TelemSvc: process_telemetry(payload)
    activate TelemSvc
    
    TelemSvc -> DB: UPDATE servers SET last_heartbeat = NOW() WHERE id = ?
    activate DB
    TelemSvc -> DB: INSERT INTO metrics (server_id, cpu, ram, disk, net_in, net_out, temp)
    TelemSvc -> DB: UPSERT workloads (server_id, container_id, cpu, mem, status)
    DB --> TelemSvc: Lưu dữ liệu time-series thành công
    deactivate DB
    
    TelemSvc -> Socket: broadcast_telemetry(server_id, metric_data)
    activate Socket
    Socket -> Client: emit("telemetry_stream", {server_id, cpu, ram, temp, timestamp})
    activate Client
    Client -> Client: Cập nhật biểu đồ đường Recharts & AR HUD Card
    deactivate Client
    deactivate Socket
    
    TelemSvc --> IngestCtrl: Trả về trạng thái xử lý thành công
    deactivate TelemSvc
    
    IngestCtrl --> Agent: HTTP 200 OK {status: "ACK"}
    deactivate IngestCtrl
end
@enduml
```

---

### SD-04: Quy trình Phát hiện Máy chủ Mất kết nối
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

skinparam SequenceGroupBorderColor #000000
skinparam SequenceGroupBackgroundColor #FFFFFF

participant "Offline Detection\nCron Service" as Cron
participant "Node Service" as NodeSvc
participant "Alert Service" as AlertSvc
database "Database\n(Supabase)" as DB
participant "Socket.IO Gateway" as Socket
participant "Web Admin Portal" as Web

loop Chạy nền định kỳ mỗi 30 giây
    Cron -> NodeSvc: check_stale_servers(timeout_seconds = 90)
    activate NodeSvc
    
    NodeSvc -> DB: SELECT * FROM servers WHERE status != 'OFFLINE' AND last_heartbeat < (NOW() - INTERVAL '90 seconds')
    activate DB
    DB --> NodeSvc: Trả về danh sách Server bị mất kết nối quá 90s
    deactivate DB
    
    alt Có Server quá hạn heartbeat (>90s)
        loop Với mỗi Server quá hạn
            NodeSvc -> DB: UPDATE servers SET status = 'OFFLINE' WHERE id = ?
            activate DB
            DB --> NodeSvc: Đã cập nhật trạng thái OFFLINE
            deactivate DB
            
            NodeSvc -> AlertSvc: trigger_alert(server_id, severity: "CRITICAL", title: "Server Unreachable")
            activate AlertSvc
            AlertSvc -> DB: INSERT INTO alerts (server_id, severity, title, status: "OPEN")
            activate DB
            DB --> AlertSvc: Lưu Alert mới thành công
            deactivate DB
            
            AlertSvc -> Socket: emit("alert_triggered", {alert_id, server_id, severity: "CRITICAL"})
            activate Socket
            Socket --> Web: Bắn chuông báo động đỏ trên Web Admin
            deactivate Socket
            deactivate AlertSvc
            
            NodeSvc -> Socket: emit("server_status_changed", {server_id, status: "OFFLINE"})
            activate Socket
            Socket --> Web: Đổi màu Server sang Xám/Đỏ trên Digital Twin 3D
            deactivate Socket
        end
    else Không có Server nào quá hạn
        NodeSvc -> NodeSvc: Tất cả Server hoạt động bình thường
    end
    
    NodeSvc --> Cron: Hoàn thành chu kỳ kiểm tra
    deactivate NodeSvc
end
@enduml
```

---

### SD-05: Quy trình Đánh giá Ngưỡng & Tự động Tạo Phiếu Sự cố
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

skinparam SequenceGroupBorderColor #000000
skinparam SequenceGroupBackgroundColor #FFFFFF

participant "Ingestion Service" as Ingest
participant "Threshold Engine" as Threshold
participant "Alert Service" as AlertSvc
participant "Ticket Service" as TicketSvc
database "Database\n(Supabase)" as DB
participant "Socket.IO Gateway" as Socket

Ingest -> Threshold: evaluate_metrics(server_id, cpu: 94.5%, ram: 88.0%)
activate Threshold

Threshold -> Threshold: So sánh chỉ số với ngưỡng hệ thống (CPU > 90% = CRITICAL)

alt Chỉ số vượt ngưỡng Critical
    Threshold -> AlertSvc: process_alert(server_id, "CRITICAL", "CPU Utilization > 90%")
    activate AlertSvc
    
    AlertSvc -> DB: SELECT id FROM alerts WHERE server_id = ? AND title = ? AND status = 'OPEN' AND triggered_at > (NOW() - INTERVAL '5 minutes')
    activate DB
    DB --> AlertSvc: Kiểm tra lịch sử cảnh báo trùng lặp (Storm Suppression)
    deactivate DB
    
    alt Chưa có Cảnh báo trùng lặp trong 5 phút
        AlertSvc -> DB: INSERT INTO alerts (server_id, severity: 'CRITICAL', title: 'CPU > 90%', status: 'OPEN')
        activate DB
        DB --> AlertSvc: Sinh alert_id mới
        deactivate DB
        
        AlertSvc -> DB: UPDATE servers SET status = 'CRITICAL' WHERE id = ?
        activate DB
        DB --> AlertSvc: Cập nhật trạng thái
        deactivate DB
        
        AlertSvc -> Socket: emit("alert_triggered", {alert_id, server_id, severity: 'CRITICAL'})
        activate Socket
        Socket --> Socket: Phát thông báo khẩn tới toàn bộ Client
        deactivate Socket
        
        AlertSvc -> TicketSvc: auto_create_ticket(alert_id, server_id, priority: "URGENT")
        activate TicketSvc
        TicketSvc -> DB: INSERT INTO tickets (server_id, alert_id, title: "Khắc phục CPU quá tải", priority: "URGENT", status: "ASSIGNED")
        activate DB
        DB --> TicketSvc: Tạo Ticket sự cố thành công
        deactivate DB
        
        TicketSvc -> Socket: emit("ticket_created", {ticket_id, server_id, priority: "URGENT"})
        activate Socket
        Socket --> Socket: Đẩy ticket lên bảng Kanban Web Admin
        deactivate Socket
        deactivate TicketSvc
    else Đã tồn tại cảnh báo tương tự
        AlertSvc -> AlertSvc: Bỏ qua tạo mới, tăng biến đếm số lần lặp
    end
    deactivate AlertSvc
else Chỉ số bình thường
    Threshold -> Threshold: Không phát sinh cảnh báo
end
deactivate Threshold
@enduml
```

---

### SD-06: Quy trình Phân công & Điều phối Phiếu Bảo trì
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam ActorBorderColor #000000
skinparam ActorBackgroundColor #FFFFFF

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

actor "System Operator" as Op
participant "Web Admin Portal" as Web
participant "Ticket Controller" as TicketCtrl
participant "Ticket Service" as TicketSvc
database "Database\n(Supabase)" as DB
participant "Socket.IO Gateway" as Socket
actor "Kỹ thuật viên\n(Technician)" as Tech
participant "Mobile AR App" as Mobile

Op -> Web: Mở Ticket, chọn Kỹ thuật viên phụ trách và nhấn "Gán việc (Assign)"
activate Web

Web -> TicketCtrl: POST /api/tickets/{id}/assign {technician_id: "uuid"}
activate TicketCtrl

TicketCtrl -> TicketSvc: assign_technician(ticket_id, technician_id, operator_id)
activate TicketSvc

TicketSvc -> DB: UPDATE tickets SET assigned_technician_id = ?, status = 'ASSIGNED' WHERE id = ?
activate DB
TicketSvc -> DB: INSERT INTO audit_logs (action: "ASSIGN_TICKET", user_id: operator_id, details)
DB --> TicketSvc: Lưu thành công
deactivate DB

TicketSvc -> Socket: emit_to_user(technician_id, "ticket_assigned", {ticket_id, server_info, priority})
activate Socket
Socket -> Mobile: Gửi Push Notification & Sự kiện Socket
activate Mobile
deactivate Socket

Mobile --> Tech: Rung chuông & Hiển thị thông báo: "Bạn có phiếu bảo trì mới!"
deactivate Mobile

TicketSvc --> TicketCtrl: Trả về đối tượng Ticket đã cập nhật
deactivate TicketSvc

TicketCtrl --> Web: HTTP 200 OK {ticket}
deactivate TicketCtrl

Web --> Op: Cập nhật trạng thái phân công trên bảng điều phối
deactivate Web
@enduml
```

---

### SD-07: Quy trình Quét Camera AR & Dựng HUD Không gian
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam ActorBorderColor #000000
skinparam ActorBackgroundColor #FFFFFF

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

skinparam SequenceGroupBorderColor #000000
skinparam SequenceGroupBackgroundColor #FFFFFF

actor "Kỹ thuật viên" as Tech
participant "Mobile AR Scanner\n(Camera Screen)" as Camera
participant "AR Engine &\nVision Processor" as AREngine
participant "Node Controller" as NodeCtrl
database "Database\n(Supabase)" as DB
participant "Socket.IO Gateway" as Socket

Tech -> Camera: Hướng Camera về phía mã QR dán trên mặt trước Server
activate Camera

Camera -> AREngine: Truyền luồng hình ảnh thời gian thực (Camera frames)
activate AREngine

AREngine -> AREngine: Quét và giải mã mẫu hình QR / ArUco Marker
AREngine --> Camera: Trích xuất thành công chuỗi qr_identifier
deactivate AREngine

Camera -> NodeCtrl: GET /api/nodes/by-qr/{qr_identifier} (Bearer JWT)
activate NodeCtrl

NodeCtrl -> DB: SELECT s.*, r.name as rack_name FROM servers s JOIN racks r ON s.rack_id = r.id WHERE s.qr_identifier = ?
activate DB
NodeCtrl -> DB: SELECT * FROM workloads WHERE server_id = ?
NodeCtrl -> DB: SELECT * FROM alerts WHERE server_id = ? AND status = 'OPEN'
DB --> NodeCtrl: Trả về thông tin phần cứng, containers và alerts
deactivate DB

alt Không tìm thấy Server
    NodeCtrl --> Camera: HTTP 404 Not Found ("Không tìm thấy thiết bị")
    Camera --> Tech: Hiển thị cảnh báo lỗi mã QR không hợp lệ
else Tìm thấy Server hợp lệ
    NodeCtrl --> Camera: HTTP 200 OK {server, workloads, alerts}
    deactivate NodeCtrl
    
    Camera -> Socket: emit("join_room", {server_id: server.id})
    activate Socket
    Socket --> Camera: Xác nhận tham gia room stream
    deactivate Socket
    
    Camera -> Camera: Dựng lớp phủ không gian 3D AR HUD Overlay:
    note over Camera
      - Tên Server, U-Slot, Địa chỉ IP
      - Trạng thái màu sắc (Xanh / Vàng / Đỏ)
      - Biểu đồ Live Telemetry (CPU, RAM, Temp)
      - Danh sách Container đang chạy/lỗi
      - Thẻ Ticket đang chờ xử lý
    end note
    
    Camera --> Tech: Hiển thị giao diện AR tương tác nổi trước Server
    deactivate Camera
end
@enduml
```

---

### SD-08: Quy trình Xử lý Sự cố Hiện trường & Nghiệm thu Đóng phiếu
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam ActorBorderColor #000000
skinparam ActorBackgroundColor #FFFFFF

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

skinparam SequenceGroupBorderColor #000000
skinparam SequenceGroupBackgroundColor #FFFFFF

actor "Kỹ thuật viên\n(Technician)" as Tech
participant "Mobile AR App" as Mobile
participant "Ticket Controller" as TicketCtrl
participant "Ticket Service" as TicketSvc
database "Database\n(Supabase)" as DB
participant "Socket.IO Gateway" as Socket
actor "System Operator" as Op
participant "Web Admin Portal" as Web

Tech -> Mobile: Nhấn nút "Bắt đầu xử lý (Start Investigation)"
activate Mobile

Mobile -> TicketCtrl: PATCH /api/tickets/{id}/status {status: "IN_PROGRESS"}
activate TicketCtrl
TicketCtrl -> DB: UPDATE tickets SET status = 'IN_PROGRESS' WHERE id = ?
activate DB
DB --> TicketCtrl: Đã cập nhật
deactivate DB
TicketCtrl --> Mobile: HTTP 200 OK
deactivate TicketCtrl

Tech -> Tech: Sửa chữa phần cứng, cắm lại cáp hoặc thay linh kiện
Tech -> Mobile: Chụp ảnh hiện trường & Nhập ghi chú nguyên nhân/giải pháp
Tech -> Mobile: Nhấn nút "Hoàn thành & Gửi nghiệm thu"

Mobile -> TicketCtrl: POST /api/tickets/{id}/resolve (URL ảnh, ghi chú giải pháp)
activate TicketCtrl
TicketCtrl -> TicketSvc: resolve_ticket(ticket_id, notes, image_url)
activate TicketSvc

TicketSvc -> DB: UPDATE tickets SET status = 'RESOLVED', investigation_notes = ?, attached_image_url = ? WHERE id = ?
activate DB
TicketSvc -> DB: INSERT INTO audit_logs (action: "RESOLVE_TICKET", user_id: tech_id)
DB --> TicketSvc: Cập nhật thành công
deactivate DB

TicketSvc -> Socket: emit("ticket_status_changed", {ticket_id, status: "RESOLVED"})
activate Socket
Socket -> Web: Bắn thông báo lên Web Admin của Operator
activate Web
deactivate Socket

TicketSvc --> TicketCtrl: Trả về kết quả
deactivate TicketSvc
TicketCtrl --> Mobile: HTTP 200 OK
deactivate TicketCtrl
Mobile --> Tech: Báo gửi yêu cầu nghiệm thu thành công
deactivate Mobile

Op -> Web: Kiểm tra Telemetry thời gian thực của Server
alt Server đã hoạt động ổn định và đạt yêu cầu
    Op -> Web: Nhấn nút "Phê duyệt & Đóng Ticket"
    Web -> TicketCtrl: POST /api/tickets/{id}/close
    activate TicketCtrl
    TicketCtrl -> DB: UPDATE tickets SET status = 'CLOSED', closed_at = NOW() WHERE id = ?
    activate DB
    TicketCtrl -> DB: UPDATE alerts SET status = 'RESOLVED' WHERE id = ticket.alert_id
    DB --> TicketCtrl: Đóng phiếu thành công
    deactivate DB
    TicketCtrl --> Web: HTTP 200 OK
    deactivate TicketCtrl
    Web --> Op: Phiếu đã đóng hoàn tất và lưu trữ vào lịch sử
    deactivate Web
else Server vẫn còn bất thường
    Op -> Web: Nhấn nút "Từ chối / Yêu cầu kiểm tra lại"
    Web -> TicketCtrl: PATCH /api/tickets/{id}/status {status: "IN_PROGRESS"}
    activate TicketCtrl
    TicketCtrl --> Web: Yêu cầu xử lý lại
    deactivate TicketCtrl
end
@enduml
```

---

### SD-09: Quy trình Điều khiển Từ xa An toàn & Ghi Nhật ký Kiểm toán
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam ActorBorderColor #000000
skinparam ActorBackgroundColor #FFFFFF

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

skinparam SequenceGroupBorderColor #000000
skinparam SequenceGroupBackgroundColor #FFFFFF

actor "Người dùng\n(Operator/Tech)" as User
participant "Giao diện (Web/AR)" as UI
participant "Node Controller" as NodeCtrl
participant "RBAC Guard &\nAudit Interceptor" as Guard
participant "Collector Agent\n(Docker Daemon)" as Agent
database "Database\n(Supabase)" as DB
participant "Socket.IO Gateway" as Socket

User -> UI: Nhấn nút "Restart Container" trên thẻ dịch vụ bị lỗi
activate UI

UI -> UI: Hiển thị Hộp thoại Cảnh báo Xác nhận 2 bước
User -> UI: Nhấn nút "Xác nhận thực thi"

UI -> NodeCtrl: POST /api/nodes/{id}/containers/{cid}/action (Bearer JWT, action: "restart")
activate NodeCtrl

NodeCtrl -> Guard: check_permission(user_id, action: "CONTAINER_RESTART")
activate Guard

alt Không đủ quyền thực thi
    Guard --> NodeCtrl: Ném ngoại lệ Forbidden
    NodeCtrl --> UI: HTTP 403 Forbidden ("Bạn không có quyền thực hiện thao tác này")
    UI --> User: Hiển thị thông báo bị từ chối
else Có quyền thực thi
    Guard --> NodeCtrl: Quyền hợp lệ
    deactivate Guard
    
    NodeCtrl -> Agent: POST /agent/docker/restart {container_id: cid}
    activate Agent
    Agent -> Agent: docker restart <container_id>
    
    alt Thực thi thành công
        Agent --> NodeCtrl: Trả về {success: true, status: "RUNNING"}
        deactivate Agent
        
        NodeCtrl -> DB: INSERT INTO audit_logs (user_id, action: "CONTAINER_RESTART", target_id: cid, status: "SUCCESS", ip: client_ip)
        activate DB
        NodeCtrl -> DB: UPDATE workloads SET status = 'RUNNING' WHERE container_id = cid
        DB --> NodeCtrl: Ghi nhật ký thành công
        deactivate DB
        
        NodeCtrl -> Socket: emit("container_status_changed", {container_id: cid, status: "RUNNING"})
        activate Socket
        Socket --> UI: Cập nhật thẻ trạng thái xanh trên Web & AR HUD
        deactivate Socket
        
        NodeCtrl --> UI: HTTP 200 OK {message: "Khởi động lại thành công"}
        UI --> User: Hiển thị popup thông báo thành công
    else Lỗi thực thi Docker
        Agent --> NodeCtrl: Trả về {success: false, error: "Container timeout"}
        NodeCtrl -> DB: INSERT INTO audit_logs (user_id, action: "CONTAINER_RESTART", status: "FAILED", error: "Timeout")
        activate DB
        DB --> NodeCtrl: Lưu vết thất bại
        deactivate DB
        
        NodeCtrl --> UI: HTTP 500 Internal Error ("Thao tác thất bại")
        UI --> User: Hiển thị cảnh báo lỗi thực thi
    end
end
deactivate NodeCtrl
deactivate UI
@enduml
```

---

### SD-10: Quy trình Báo cáo Hiệu năng, Dự báo Dung lượng & PUE
```plantuml
@startuml
autonumber
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 12

skinparam ParticipantBorderColor #000000
skinparam ParticipantBackgroundColor #FFFFFF
skinparam ParticipantBorderThickness 1.5

skinparam ActorBorderColor #000000
skinparam ActorBackgroundColor #FFFFFF

skinparam DatabaseBorderColor #000000
skinparam DatabaseBackgroundColor #FFFFFF

skinparam SequenceLifeLineBorderColor #000000
skinparam SequenceLifeLineBackgroundColor #FFFFFF

skinparam SequenceArrowColor #000000
skinparam SequenceArrowThickness 1.2

skinparam SequenceGroupBorderColor #000000
skinparam SequenceGroupBackgroundColor #FFFFFF

actor "Operator / Quản lý" as Manager
participant "Web Analytics Page" as Web
participant "Analytics Controller" as AnalyticsCtrl
participant "Analytics Engine" as AnalyticsSvc
database "Database\n(Supabase)" as DB

Manager -> Web: Chọn phạm vi (Site/Rack/Node) và Khoảng thời gian (7 ngày), bấm "Tạo báo cáo"
activate Web

Web -> AnalyticsCtrl: GET /api/analytics/summary?scope=site&range=7d (Bearer JWT)
activate AnalyticsCtrl

AnalyticsCtrl -> AnalyticsSvc: generate_analytics_report(scope, range)
activate AnalyticsSvc

AnalyticsSvc -> DB: SELECT recorded_at, cpu_usage_percent, memory_usage_percent, disk_usage_percent, network_in_kbps FROM metrics WHERE recorded_at >= NOW() - INTERVAL '7 days'
activate DB
AnalyticsSvc -> DB: SELECT COUNT(*), AVG(EXTRACT(EPOCH FROM (closed_at - created_at)))/60 as mttr FROM tickets WHERE status = 'CLOSED' AND created_at >= NOW() - INTERVAL '7 days'
DB --> AnalyticsSvc: Trả về tập dữ liệu time-series và thống kê tickets
deactivate DB

AnalyticsSvc -> AnalyticsSvc: Tính toán chỉ số thống kê nâng cao:
note over AnalyticsSvc
  1. Tính AVG & PEAK (CPU, RAM, Disk, Net)
  2. Tính chỉ số PUE = Tổng công suất / Công suất thiết bị IT
  3. Tính thời gian xử lý trung bình MTTR & MTTA
  4. Hồi quy tuyến tính dự báo dung lượng Disk quá tải
end note

alt Dự báo dung lượng chạm mốc 90% trong 30 ngày
    AnalyticsSvc -> AnalyticsSvc: Đính kèm khuyến nghị nâng cấp phần cứng
end

AnalyticsSvc --> AnalyticsCtrl: Trả về đối tượng ReportSummary JSON
deactivate AnalyticsSvc

AnalyticsCtrl --> Web: HTTP 200 OK {metrics_trend, pue_data, sla_stats, forecasts}
deactivate AnalyticsCtrl

Web -> Web: Vẽ các biểu đồ Recharts (Đường xu hướng, Cột PUE, Radar hiệu năng)
Web --> Manager: Hiển thị báo cáo trực quan sinh động trên Dashboard

opt Người dùng chọn "Xuất file PDF / CSV"
    Manager -> Web: Nhấn nút "Xuất file PDF"
    Web -> AnalyticsCtrl: GET /api/analytics/export?format=pdf
    activate AnalyticsCtrl
    AnalyticsCtrl --> Web: Trả về file Stream nhị phân (PDF Document)
    deactivate AnalyticsCtrl
    Web --> Manager: Tải file báo cáo hoàn chỉnh về máy tính
end
deactivate Web
@enduml
```
