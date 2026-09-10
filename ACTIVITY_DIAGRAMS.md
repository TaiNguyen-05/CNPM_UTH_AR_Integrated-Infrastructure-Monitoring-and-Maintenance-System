# TỔNG HỢP MÃ NGUỒN ACTIVITY DIAGRAM (PLANTUML CHUẨN KỸ THUẬT CHO DRAW.IO)
## HỆ THỐNG GIÁM SÁT VÀ BẢO TRÌ CƠ SỞ HẠ TẦNG TÍCH HỢP AR (AR-IMMS)

> **Phong cách vẽ:** Chuẩn kỹ thuật (Engineering / Clean Monochrome), **đường nối vuông góc thẳng tắp (Ortho)**, **không bo tròn góc (Sharp 90°)**, **viền đen rõ nét**, không bóng đổ, bố cục tự nhiên và chỉn chu như vẽ tay trên Draw.io / Visio.

---

### 📌 HƯỚNG DẪN IMPORT VÀO DRAW.IO:
1. Mở trang web [draw.io](https://app.diagrams.net/).
2. Trên thanh menu chọn: **Arrange** (Sắp xếp) -> **Insert** (Chèn) -> **Advanced** (Nâng cao) -> **PlantUML...**
3. Sao chép (Copy) toàn bộ đoạn mã trong khối `@startuml ... @enduml` của biểu đồ bạn muốn vẽ và dán vào ô nhập liệu.
4. Nhấn **Insert** (Chèn).

---

## MỤC LỤC CÁC BIỂU ĐỒ HOẠT ĐỘNG
- [AD-01: Quy trình Đăng nhập & Phân quyền Người dùng (Auth & RBAC)](#ad-01-quy-trình-đăng-nhập--phân-quyền-người-dùng)
- [AD-02: Quy trình Khai báo Tài sản & Ánh xạ Mã QR Không gian (Asset & QR Binding)](#ad-02-quy-trình-khai-báo-tài-sản--ánh-xạ-mã-qr-không-gian)
- [AD-03: Quy trình Thu thập Telemetry & Phát hiện Máy chủ Mất kết nối (Heartbeat Engine)](#ad-03-quy-trình-thu-thập-telemetry--phát-hiện-máy-chủ-mất-kết-nối)
- [AD-04: Quy trình Đánh giá Ngưỡng & Tự động Kích hoạt Cảnh báo (Threshold & Alert Engine)](#ad-04-quy-trình-đánh-giá-ngưỡng--tự-động-kích-hoạt-cảnh-báo)
- [AD-05: Quy trình Quản lý & Điều phối Phiếu Bảo trì (Ticket Lifecycle Management)](#ad-05-quy-trình-quản-lý--điều-phối-phiếu-bảo-trì)
- [AD-06: Quy trình Quét Camera AR & Dựng Lớp phủ HUD Không gian (AR Scanner & HUD Overlay)](#ad-06-quy-trình-quét-camera-ar--dựng-lớp-phủ-hud-không-gian)
- [AD-07: Quy trình Kỹ thuật viên Xử lý Sự cố Hiện trường (On-site Maintenance Execution)](#ad-07-quy-trình-kỹ-thuật-viên-xử-lý-sự-cố-hiện-trường)
- [AD-08: Quy trình Thao tác Từ xa An toàn & Ghi Nhật ký Kiểm toán (Safe Remote Action & Audit Trail)](#ad-08-quy-trình-thao-tác-từ-xa-an-toàn--ghi-nhật-ký-kiểm-toán)
- [AD-09: Quy trình Báo cáo Hiệu năng, Dự báo Dung lượng & PUE (Analytics & Capacity Planning)](#ad-09-quy-trình-báo-cáo-hiệu-năng-dự-báo-dung-lượng--pue)
- [AD-10: Quy trình Quản lý Tài khoản & Phân quyền Quản trị (User Management Admin CRUD)](#ad-10-quy-trình-quản-lý-tài-khoản--phân-quyền-quản-trị)

---

### AD-01: Quy trình Đăng nhập & Phân quyền Người dùng
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|Người dùng (Client)|
start
:Mở ứng dụng (Web Admin hoặc Mobile AR);
:Nhập Username và Password;
:Nhấn nút "Đăng nhập";

|API Gateway & Auth Controller|
:Nhận yêu cầu POST /api/auth/login;
:Kiểm tra tính hợp lệ dữ liệu đầu vào;

|Database (Supabase)|
:Truy vấn bảng users theo username;

|API Gateway & Auth Controller|
if (Tài khoản tồn tại và is_active == true?) then (Hợp lệ)
  :Xác thực mật khẩu với Bcrypt hash;
  if (Mật khẩu trùng khớp?) then (Đúng)
    :Sinh Access Token & Refresh Token JWT;
    :Ghi log đăng nhập vào bảng audit_logs;
    |Người dùng (Client)|
    :Lưu JWT token vào SecureStorage;
    if (Vai trò người dùng?) then (ADMIN)
      :Điều hướng: Dashboard Quản trị Toàn quyền;
    else if (OPERATOR) then
      :Điều hướng: Trung tâm Digital Twin;
    else (TECHNICIAN)
      :Điều hướng: Danh sách Phiếu & Camera AR;
    endif
    stop
  else (Sai mật khẩu)
    |API Gateway & Auth Controller|
    :Trả về lỗi 401 Unauthorized;
    |Người dùng (Client)|
    :Hiển thị thông báo "Mật khẩu không chính xác";
    stop
  endif
else (Không tồn tại / Bị khóa)
  |API Gateway & Auth Controller|
  :Trả về lỗi 403/404;
  |Người dùng (Client)|
  :Hiển thị thông báo "Tài khoản không hợp lệ";
  stop
endif
@enduml
```

---

### AD-02: Quy trình Khai báo Tài sản & Ánh xạ Mã QR Không gian
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|System Operator|
start
:Truy cập mục Quản lý Tài sản (Asset Management);
:Chọn phân cấp vị trí: Site -> Room -> Rack;
:Nhập thông số Node: Tên Server, Vị trí U, IP, MAC, Specs;
:Nhấn nút "Tạo mới Máy chủ";

|Rack & Node Controller|
:Tiếp nhận POST /api/nodes;
:Kiểm tra cú pháp IP/MAC;

|Database (PostgreSQL)|
:Kiểm tra vị trí U-Slot trong Rack đã có thiết bị chưa;

|Rack & Node Controller|
if (Vị trí U-Slot còn trống?) then (Hợp lệ)
  :Sinh mã định danh duy nhất UUID;
  :Tạo chuỗi Spatial QR Identifier;
  
  |Database (PostgreSQL)|
  :Lưu thông tin Node và QR Identifier vào bảng servers;
  :Ghi nhật ký thao tác vào bảng audit_logs;
  
  |Rack & Node Controller|
  :Sinh file ảnh mã QR Code;
  :Gửi sự kiện Socket.IO asset_updated;
  
  |System Operator|
  :Mô hình Digital Twin 2D/3D cập nhật Node mới;
  :Tải file nhãn tem QR Code;
  :In tem và dán vật lý lên mặt trước Server;
  stop
else (Bị trùng vị trí U)
  |Rack & Node Controller|
  :Trả về lỗi 400 Bad Request;
  |System Operator|
  :Hiển thị thông báo trùng vị trí, yêu cầu chọn lại U-Slot;
  stop
endif
@enduml
```

---

### AD-03: Quy trình Thu thập Telemetry & Phát hiện Máy chủ Mất kết nối
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|Python Collector Agent (Server vật lý)|
start
:Daemon khởi chạy trên máy chủ;
repeat
  :Đọc CPU, RAM, Disk, Net qua psutil;
  :Đọc danh sách & trạng thái container qua Docker SDK;
  :Đóng gói gói tin Telemetry Payload JSON;
  :Gửi POST /api/telemetry/ingest đến Backend;
  
  |Backend Ingestion Gateway|
  if (Kết nối thành công?) then (Có)
    :Cập nhật last_heartbeat = NOW() cho Server;
    |Database (Supabase)|
    :Ghi log time-series vào bảng metrics;
    :Cập nhật trạng thái workloads vào bảng workloads;
    |Backend Ingestion Gateway|
    :Socket.IO phát sóng telemetry_stream tới Web & AR App;
  else (Mất kết nối mạng)
    |Python Collector Agent (Server vật lý)|
    :Lưu payload vào hàng đợi bộ nhớ đệm Buffer;
    :Ghi log cảnh báo mất kết nối;
  endif
  |Python Collector Agent (Server vật lý)|
  :Chờ chu kỳ 5 giây;
repeat while (Agent đang chạy)

|Offline Detection Monitor (Chạy định kỳ mỗi 30s)|
start
:Quét bảng servers tìm các node đang ONLINE;
if (NOW() - last_heartbeat > 90 giây?) then (Quá hạn 90s)
  :Cập nhật trạng thái status = OFFLINE;
  |Database (Supabase)|
  :Tạo cảnh báo CRITICAL: "Server Unreachable / Timeout";
  |Offline Detection Monitor (Chạy định kỳ mỗi 30s)|
  :Phát sóng Socket.IO server_status_changed & alert_triggered;
  :Đổi màu hiển thị Server sang Xám/Đỏ trên Web & AR;
  stop
else (Bình thường)
  :Duy trì trạng thái hiện tại của Server;
  stop
endif
@enduml
```

---

### AD-04: Quy trình Đánh giá Ngưỡng & Tự động Kích hoạt Cảnh báo
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|Backend Threshold Engine|
start
:Nhận gói tin Telemetry mới từ Ingestion Gateway;
:Đọc cấu hình ngưỡng cảnh báo hệ thống:
- CPU Warning: >80%, Critical: >90%
- RAM Warning: >85%, Critical: >95%
- Disk Warning: >85%, Critical: >95%;

if (Chỉ số vượt ngưỡng quy định?) then (Vượt ngưỡng)
  :Xác định mức độ nghiêm trọng (WARNING hoặc CRITICAL);
  
  |Database (Supabase)|
  :Truy vấn bảng alerts để kiểm tra chống bão cảnh báo;
  
  |Backend Threshold Engine|
  if (Đã có Cảnh báo cùng loại đang OPEN trên Server trong 5 phút?) then (Đã tồn tại)
    :Bỏ qua tạo mới;
    :Tăng bộ đếm tần suất lặp lại (Occurrence count);
    stop
  else (Cảnh báo mới)
    |Database (Supabase)|
    :Tạo bản ghi mới trong bảng alerts (status: OPEN);
    :Cập nhật trạng thái Server thành WARNING / CRITICAL;
    
    |Backend Threshold Engine|
    :Socket.IO phát sóng sự kiện alert_triggered;
    
    if (Mức độ cảnh báo == CRITICAL?) then (Đúng)
      |Database (Supabase)|
      :Tự động tạo Phiếu sự cố tickets mức độ HIGH / URGENT;
      |Backend Threshold Engine|
      :Gửi Push Notification thông báo khẩn tới Quản trị viên;
    else (WARNING)
      :Hiển thị cảnh báo màu vàng trên Web Dashboard;
    endif
    stop
  endif
else (Dưới ngưỡng)
  if (Server đang ở trạng thái WARNING/CRITICAL và không còn lỗi khác?) then (Đã hết lỗi)
    |Database (Supabase)|
    :Tự động cập nhật status = HEALTHY;
  endif
  stop
endif
@enduml
```

---

### AD-05: Quy trình Quản lý & Điều phối Phiếu Bảo trì
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|System Operator|
start
:Mở Trung tâm Điều phối Sự cố (Tickets Management);
:Tạo mới Ticket (hoặc chọn Ticket tự động sinh từ Alert);
:Thiết lập Mức độ Ưu tiên: LOW / MEDIUM / HIGH / URGENT;
:Chọn Kỹ thuật viên phụ trách (Assignee);
:Nhấn nút "Gán việc (Dispatch)";

|Ticket Controller & Services|
:Tiếp nhận POST /api/tickets/assign;
|Database (Supabase)|
:Cập nhật Ticket: assigned_technician_id, status = ASSIGNED;
:Ghi nhật ký phân công vào bảng audit_logs;

|Ticket Controller & Services|
:Phát sóng Socket.IO sự kiện ticket_assigned tới Mobile App;

|Kỹ thuật viên (Mobile App)|
:Nhận Push Notification thông báo công việc mới;
:Mở App xem chi tiết: Vị trí Rack, Mã Server, Mô tả lỗi;
:Di chuyển đến phòng máy và nhấn "Bắt đầu xử lý";

|Ticket Controller & Services|
:Nhận PATCH /api/tickets/{id}/status -> Cập nhật status = IN_PROGRESS;

|Kỹ thuật viên (Mobile App)|
:Tiến hành sửa chữa, thay thế linh kiện hoặc cấu hình lại;
:Chụp ảnh bằng chứng hiện trường sau khi khắc phục;
:Nhập ghi chú nguyên nhân và giải pháp;
:Nhấn nút "Hoàn thành & Gửi nghiệm thu";

|Ticket Controller & Services|
|Database (Supabase)|
:Lưu ảnh và ghi chú, cập nhật status = RESOLVED;

|System Operator|
:Kiểm tra lại biểu đồ Telemetry và trạng thái Server trên Web;
if (Server hoạt động ổn định trở lại?) then (Đạt yêu cầu)
  :Duyệt đóng Ticket (status = CLOSED);
  |Database (Supabase)|
  :Tự động chuyển các Alerts liên quan sang RESOLVED;
  :Lưu vết đóng phiếu vào audit_logs;
  |System Operator|
  stop
else (Chưa đạt / Vẫn còn lỗi)
  :Từ chối đóng phiếu, yêu cầu Kỹ thuật viên kiểm tra lại;
  |Kỹ thuật viên (Mobile App)|
  :Nhận thông báo phản hồi và tiếp tục xử lý;
  stop
endif
@enduml
```

---

### AD-06: Quy trình Quét Camera AR & Dựng Lớp phủ HUD Không gian
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|Kỹ thuật viên (Mobile AR App)|
start
:Mở màn hình "AR Scanner";
:Cấp quyền truy cập Camera thiết bị;
:Hướng Camera về phía mặt trước tủ Rack / Server vật lý;

|AR Engine & Image Processor (Mobile)|
repeat
  :Phân tích luồng khung hình thời gian thực;
  :Tìm kiếm mẫu hình mã QR / ArUco Marker;
repeat while (Chưa phát hiện Marker)

:Phát hiện Marker thành công;
:Trích xuất chuỗi định danh QR Identifier Token;
:Gọi API GET /api/nodes/by-qr/{qr_identifier};

|Backend Node Controller|
|Database (Supabase)|
:Truy vấn chi tiết Node, phần cứng, workloads và alerts;

|Backend Node Controller|
if (Tìm thấy Server?) then (Hợp lệ)
  :Trả về JSON thông tin thiết bị;
  
  |AR Engine & Image Processor (Mobile)|
  :Đăng ký Socket.IO room theo Server ID (join_room);
  :Dựng thẻ lớp phủ không gian AR HUD Overlay:
  - Tên Server, Vị trí U, Địa chỉ IP
  - Thẻ trạng thái màu: Xanh (Healthy), Vàng (Warning), Đỏ (Critical)
  - Biểu đồ mini realtime CPU, RAM, Nhiệt độ
  - Danh sách Container đang chạy / lỗi
  - Nút thao tác nhanh (Xem Ticket, Điều khiển từ xa);
  
  |Kỹ thuật viên (Mobile AR App)|
  :Quan sát thông số trực quan nổi ngay trước máy chủ thực tế;
  stop
else (Không tìm thấy)
  |Backend Node Controller|
  :Trả về lỗi 404 Not Found;
  |Kỹ thuật viên (Mobile AR App)|
  :Hiển thị popup cảnh báo không tìm thấy thiết bị;
  stop
endif
@enduml
```

---

### AD-07: Quy trình Kỹ thuật viên Xử lý Sự cố Hiện trường
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|Kỹ thuật viên Hiện trường|
start
:Đến trước tủ Rack chứa máy chủ gặp sự cố;
:Dùng App quét mã QR trên thân máy chủ;
:Lớp phủ AR HUD hiển thị cảnh báo và Ticket đang gán;
:Chạm vào Thẻ Ticket trên màn hình AR;

|Ứng dụng Mobile AR|
:Hiển thị chi tiết Phiếu sự cố;
:Kỹ thuật viên nhấn nút "Bắt đầu kiểm tra";
:Gửi API PATCH /api/tickets/{id}/status (IN_PROGRESS);

|Kỹ thuật viên Hiện trường|
:Kiểm tra phần cứng vật lý (Nguồn, Cáp LAN, Ổ cứng, Quạt);
:Thực hiện sửa chữa hoặc thay thế linh kiện lỗi;
:Kiểm tra lại chỉ số Live Telemetry cập nhật trên AR HUD;

if (Chỉ số Telemetry phục hồi bình thường?) then (Đã ổn định)
  :Nhấn nút "Chụp ảnh nghiệm thu";
  |Ứng dụng Mobile AR|
  :Mở Camera chụp hình ảnh linh kiện / máy chủ đã sửa;
  :Nén ảnh và tải lên lưu trữ đám mây;
  
  |Kỹ thuật viên Hiện trường|
  :Nhập nội dung biên bản: Nguyên nhân lỗi & Biện pháp khắc phục;
  :Nhấn nút "Gửi yêu cầu đóng phiếu";
  
  |Backend API|
  |Database (Supabase)|
  :Lưu URL ảnh, ghi chú và chuyển Ticket sang RESOLVED;
  :Phát Socket thông báo cho Operator trên Web Admin;
  
  |Kỹ thuật viên Hiện trường|
  :Nhận thông báo gửi nghiệm thu thành công;
  stop
else (Chỉ số vẫn bất thường)
  :Tiếp tục kiểm tra chuyên sâu các module dịch vụ / Docker;
  stop
endif
@enduml
```

---

### AD-08: Quy trình Thao tác Từ xa An toàn & Ghi Nhật ký Kiểm toán
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|Người dùng (Operator / Technician)|
start
:Chọn Container / Service bị lỗi trên Web hoặc AR HUD;
:Nhấn nút thao tác từ xa (ví dụ: "Restart Container");

|Giao diện Ứng dụng (UI)|
:Hiển thị Hộp thoại Xác nhận 2 bước:
- Cảnh báo gián đoạn dịch vụ
- Tên Server & Container ID
- Yêu cầu nhấn "Xác nhận";

|Người dùng (Operator / Technician)|
if (Người dùng đồng ý thực hiện?) then (Xác nhận)
  |Giao diện Ứng dụng (UI)|
  :Gửi POST /api/nodes/{id}/containers/{cid}/action kèm Bearer JWT Token;
  
  |Backend API & RBAC Guard|
  :Kiểm tra quyền hạn của User đối với hành động;
  if (Có quyền thực thi?) then (Hợp lệ)
    :Chuyển tiếp lệnh điều khiển tới Collector Daemon của Server đích;
    
    |Collector Agent / Docker Engine|
    :Thực thi lệnh docker restart container;
    
    |Backend API & RBAC Guard|
    if (Lệnh thực thi thành công?) then (Thành công)
      :Ghi bản ghi thành công vào bảng audit_logs:
      - User ID, Username, Vai trò
      - Action: RESTART_CONTAINER
      - Target: Server ID & Container ID
      - IP Client & Timestamp;
      :Socket.IO phát sóng trạng thái mới của container;
      
      |Người dùng (Operator / Technician)|
      :Hiển thị thông báo thành công trên màn hình;
      stop
    else (Lỗi hệ thống)
      :Ghi bản ghi thất bại vào bảng audit_logs;
      :Trả về mã lỗi 500 Internal Error;
      |Người dùng (Operator / Technician)|
      :Hiển thị thông báo lỗi thao tác từ xa;
      stop
    endif
  else (Không đủ quyền)
    :Trả về lỗi 403 Forbidden;
    |Người dùng (Operator / Technician)|
    :Hiển thị cảnh báo từ chối truy cập;
    stop
  endif
else (Hủy bỏ)
  |Giao diện Ứng dụng (UI)|
  :Đóng hộp thoại, không thực hiện bất kỳ lệnh nào;
  stop
endif
@enduml
```

---

### AD-09: Quy trình Báo cáo Hiệu năng, Dự báo Dung lượng & PUE
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|System Operator / Quản lý|
start
:Mở mục "Báo cáo & Phân tích (Analytics & Reports)";
:Chọn Phạm vi phân tích: Toàn bộ Site, Từng Rack hoặc Node;
:Chọn Khoảng thời gian: 24h qua, 7 ngày qua, 30 ngày qua;
:Nhấn nút "Tạo báo cáo";

|Analytics Controller & Engine|
:Nhận GET /api/analytics/summary;

|Database (Supabase)|
:Truy vấn tổng hợp chuỗi thời gian (Metrics Time-series);
:Truy vấn lịch sử cảnh báo và phiếu bảo trì (Alerts & Tickets);

|Analytics Controller & Engine|
:Thực hiện các thuật toán tính toán thống kê:
- Tính trung bình (AVG), đỉnh (PEAK) CPU, RAM, Disk, Net
- Tính chỉ số hiệu quả năng lượng PUE: Tổng điện năng tiêu thụ / Điện năng IT
- Tính thời gian phản hồi trung bình (MTTA) & thời gian xử lý trung bình (MTTR)
- Phân tích hồi quy tốc độ tăng trưởng dung lượng Disk/RAM;

if (Dự báo tài nguyên chạm ngưỡng 90% trong 30 ngày tới?) then (Có nguy cơ quá tải)
  :Sinh cảnh báo khuyến nghị nâng cấp phần cứng (Capacity Warning);
else (An toàn)
  :Ghi nhận trạng thái dung lượng ổn định;
endif

|System Operator / Quản lý|
:Hiển thị trực quan các biểu đồ Recharts trên Web:
- Biểu đồ xu hướng tải đa trục
- Biểu đồ phân bổ PUE theo thời gian
- Bảng xếp hạng các server hoạt động nặng nhất;

if (Người dùng chọn "Xuất báo cáo"?) then (Xuất file)
  :Chọn định dạng PDF / CSV;
  |Analytics Controller & Engine|
  :Kết xuất tài liệu báo cáo tổng hợp;
  |System Operator / Quản lý|
  :Tải file báo cáo hoàn chỉnh về máy tính;
  stop
else (Chỉ xem)
  stop
endif
@enduml
```

---

### AD-10: Quy trình Quản lý Tài khoản & Phân quyền Quản trị
```plantuml
@startuml
skinparam linetype ortho
skinparam roundCorner 0
skinparam shadowing false
skinparam defaultFontName "Segoe UI", Arial, sans-serif
skinparam defaultFontSize 13

skinparam ActivityBorderThickness 1.5
skinparam ActivityBorderColor #000000
skinparam ActivityBackgroundColor #FFFFFF

skinparam ArrowColor #000000
skinparam ArrowThickness 1.2

skinparam DiamondBorderColor #000000
skinparam DiamondBackgroundColor #FFFFFF
skinparam DiamondBorderThickness 1.5

skinparam PartitionBorderColor #000000
skinparam PartitionBorderThickness 1.5
skinparam PartitionBackgroundColor #FFFFFF
skinparam PartitionFontStyle bold

|Quản trị viên Hệ thống (Admin)|
start
:Mở module "Quản lý Người dùng (Users Management)";
:Nhập thông tin tài khoản mới: Username, Email, Mật khẩu, Vai trò (Role);
:Nhấn nút "Tạo người dùng";

|User Controller & Services|
:Tiếp nhận POST /api/users;
:Kiểm tra tính hợp lệ định dạng Email và độ mạnh Mật khẩu;

|Database (Supabase)|
:Kiểm tra sự tồn tại của Username hoặc Email trong bảng users;

|User Controller & Services|
if (Username hoặc Email đã tồn tại?) then (Bị trùng)
  :Trả về lỗi 409 Conflict;
  |Quản trị viên Hệ thống (Admin)|
  :Hiển thị thông báo lỗi trùng tài khoản;
  stop
else (Chưa tồn tại)
  :Băm mật khẩu bằng thuật toán Bcrypt với Salt;
  
  |Database (Supabase)|
  :Lưu bản ghi User mới vào bảng users (is_active = true);
  :Ghi nhận thao tác tạo tài khoản vào audit_logs;
  
  |User Controller & Services|
  :Trả về kết quả 201 Created kèm thông tin User;
  
  |Quản trị viên Hệ thống (Admin)|
  :Danh sách tài khoản tự động cập nhật người dùng mới;
  :Người dùng mới có thể đăng nhập vào hệ thống;
  stop
endif
@enduml
```
