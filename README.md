# VIBE CODING - HỆ THỐNG QUẢN LÝ SINH VIÊN

## Thông tin cá nhân
- **Họ và tên:** Nguyễn Anh Huy
- **MSSV:** 23670201
- **Lớp:** DHKHDL19A

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React JS (Vite)
- **Database:** SQLite

## Tools sử dụng
- **IDE:** VS Code, Cursor
- **AI Assistant:** GitHub Copilot
- **Version Control:** Git, GitHub

## Tính năng

### PHẦN 1 - MVP
- Thêm sinh viên
- Sửa sinh viên
- Xóa sinh viên
- Hiển thị danh sách sinh viên

### PHẦN 2 - Các yêu cầu mở rộng
1. **YÊU CẦU 1:** Thêm bảng Lớp học (Class)
2. **YÊU CẦU 2:** Thay đổi nghiệp vụ - Sinh viên phải thuộc một lớp (class_id)
3. **YÊU CẦU 3:** Thêm chức năng tìm kiếm sinh viên theo tên
4. **YÊU CẦU 4:** Thống kê cơ bản (tổng số SV, GPA trung bình, số SV theo ngành)
5. **YÊU CẦU 5:** Xuất dữ liệu sinh viên ra file CSV

## Log quá trình thực hiện

### 07/03/2026
| Thời gian | Công việc | Commit |
|-----------|-----------|--------|
| Bước 1 | Xây dựng MVP - Tạo backend FastAPI với CRUD sinh viên, frontend React với giao diện quản lý | `PHẦN 1 - Xây dựng MVP` |
| Bước 2 | Thêm bảng Class với các trường class_id, class_name, advisor và CRUD endpoints | `PHẦN 02 - YÊU CẦU 01: THÊM LỚP HỌC` |
| Bước 3 | Thêm foreign key class_id vào bảng Student, cập nhật form thêm/sửa sinh viên | `PHẦN 02 - YÊU CẦU 2: THAY ĐỔI NGHIỆP VỤ` |
| Bước 4 | Thêm chức năng tìm kiếm sinh viên theo tên với search input | `PHẦN 02 - YÊU CẦU 3: THÊM CHỨC NĂNG TÌM KIẾM` |
| Bước 5 | Thêm tab Thống kê với các chỉ số: tổng SV, GPA trung bình, SV theo ngành | `PHẦN 02 - YÊU CẦU 4: THỐNG KÊ CƠ BẢN` |
| Bước 6 | Thêm nút xuất CSV để download danh sách sinh viên | `PHẦN 02 - YÊU CẦU 5: THÊM CHỨC NĂNG XUẤT CSV` |

## Hướng dẫn cài đặt

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Server chạy tại: http://localhost:8001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Ứng dụng chạy tại: http://localhost:5173

## Cấu trúc thư mục
```
23670201_VibeCoding/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── data.csv         # Sample student data
│   ├── classes.csv      # Sample class data
│   ├── requirements.txt # Python dependencies
│   └── students.db      # SQLite database
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main React component
│   │   ├── api.js       # API service
│   │   └── index.css    # Styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## API Endpoints

### Students
- `GET /students` - Lấy danh sách sinh viên
- `GET /students/{id}` - Lấy thông tin sinh viên
- `POST /students` - Thêm sinh viên mới
- `PUT /students/{id}` - Cập nhật sinh viên
- `DELETE /students/{id}` - Xóa sinh viên
- `GET /students/stats/summary` - Lấy thống kê
- `GET /students/export/csv` - Xuất CSV

### Classes
- `GET /classes` - Lấy danh sách lớp
- `GET /classes/{id}` - Lấy thông tin lớp
- `POST /classes` - Thêm lớp mới
- `PUT /classes/{id}` - Cập nhật lớp
- `DELETE /classes/{id}` - Xóa lớp
