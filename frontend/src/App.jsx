import { useState, useEffect } from 'react';
import { studentApi, classApi } from './api';

function App() {
  const [activeTab, setActiveTab] = useState('students');
  
  // Student states
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    student_id: '',
    name: '',
    birth_year: '',
    major: '',
    gpa: '',
    class_id: '',
  });

  // Class states
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    class_id: '',
    class_name: '',
    advisor: '',
  });

  // Common states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Statistics states
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchStats();
  }, []);

  // ========== STATISTICS FUNCTIONS ==========
  const fetchStats = async () => {
    try {
      const data = await studentApi.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ========== STUDENT FUNCTIONS ==========
  const fetchStudents = async (search = '') => {
    try {
      setLoadingStudents(true);
      const data = await studentApi.getAll(search);
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    fetchStudents(searchTerm);
  };

  const handleStudentInputChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetStudentForm = () => {
    setStudentForm({ student_id: '', name: '', birth_year: '', major: '', gpa: '', class_id: '' });
    setEditingStudent(null);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentForm.student_id || !studentForm.name || !studentForm.birth_year || !studentForm.major || !studentForm.gpa || !studentForm.class_id) {
      showMessage('error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const studentData = {
      ...studentForm,
      birth_year: parseInt(studentForm.birth_year),
      gpa: parseFloat(studentForm.gpa),
    };

    try {
      if (editingStudent) {
        await studentApi.update(editingStudent.student_id, {
          name: studentData.name,
          birth_year: studentData.birth_year,
          major: studentData.major,
          gpa: studentData.gpa,
          class_id: studentData.class_id,
        });
        showMessage('success', 'Cập nhật sinh viên thành công!');
      } else {
        await studentApi.create(studentData);
        showMessage('success', 'Thêm sinh viên thành công!');
      }
      resetStudentForm();
      fetchStudents();
      fetchStats();
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Có lỗi xảy ra');
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      student_id: student.student_id,
      name: student.name,
      birth_year: student.birth_year.toString(),
      major: student.major,
      gpa: student.gpa.toString(),
      class_id: student.class_id,
    });
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?')) return;
    try {
      await studentApi.delete(studentId);
      showMessage('success', 'Xóa sinh viên thành công!');
      fetchStudents();
      fetchStats();
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Không thể xóa sinh viên');
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await studentApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showMessage('success', 'Xuất CSV thành công!');
    } catch (err) {
      showMessage('error', 'Không thể xuất CSV');
    }
  };

  // ========== CLASS FUNCTIONS ==========
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const data = await classApi.getAll();
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleClassInputChange = (e) => {
    const { name, value } = e.target;
    setClassForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetClassForm = () => {
    setClassForm({ class_id: '', class_name: '', advisor: '' });
    setEditingClass(null);
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    if (!classForm.class_id || !classForm.class_name || !classForm.advisor) {
      showMessage('error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      if (editingClass) {
        await classApi.update(editingClass.class_id, {
          class_name: classForm.class_name,
          advisor: classForm.advisor,
        });
        showMessage('success', 'Cập nhật lớp thành công!');
      } else {
        await classApi.create(classForm);
        showMessage('success', 'Thêm lớp thành công!');
      }
      resetClassForm();
      fetchClasses();
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Có lỗi xảy ra');
    }
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setClassForm({
      class_id: cls.class_id,
      class_name: cls.class_name,
      advisor: cls.advisor,
    });
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Bạn có chắc muốn xóa lớp này?')) return;
    try {
      await classApi.delete(classId);
      showMessage('success', 'Xóa lớp thành công!');
      fetchClasses();
    } catch (err) {
      showMessage('error', err.response?.data?.detail || 'Không thể xóa lớp');
    }
  };

  // ========== COMMON FUNCTIONS ==========
  const showMessage = (type, message) => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="container">
      <h1>Hệ Thống Quản Lý</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Quản lý Sinh viên
        </button>
        <button
          className={`tab ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          Quản lý Lớp học
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Thống kê
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <>
          <div className="card">
            <h2>{editingStudent ? 'Sửa Sinh viên' : 'Thêm Sinh viên'}</h2>
            <form onSubmit={handleStudentSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mã sinh viên</label>
                  <input
                    type="text"
                    name="student_id"
                    value={studentForm.student_id}
                    onChange={handleStudentInputChange}
                    placeholder="VD: SV001"
                    disabled={editingStudent !== null}
                  />
                </div>
                <div className="form-group">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    name="name"
                    value={studentForm.name}
                    onChange={handleStudentInputChange}
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
                <div className="form-group">
                  <label>Năm sinh</label>
                  <input
                    type="number"
                    name="birth_year"
                    value={studentForm.birth_year}
                    onChange={handleStudentInputChange}
                    placeholder="VD: 2005"
                  />
                </div>
                <div className="form-group">
                  <label>Ngành học</label>
                  <input
                    type="text"
                    name="major"
                    value={studentForm.major}
                    onChange={handleStudentInputChange}
                    placeholder="VD: Công nghệ thông tin"
                  />
                </div>
                <div className="form-group">
                  <label>GPA</label>
                  <input
                    type="number"
                    name="gpa"
                    value={studentForm.gpa}
                    onChange={handleStudentInputChange}
                    placeholder="VD: 3.5"
                    step="0.01"
                    min="0"
                    max="4"
                  />
                </div>
                <div className="form-group">
                  <label>Lớp học</label>
                  <select
                    name="class_id"
                    value={studentForm.class_id}
                    onChange={handleStudentInputChange}
                  >
                    <option value="">-- Chọn lớp --</option>
                    {classes.map((cls) => (
                      <option key={cls.class_id} value={cls.class_id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Cập nhật' : 'Thêm mới'}
                </button>
                {editingStudent && (
                  <button type="button" className="btn btn-secondary" onClick={resetStudentForm}>
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Danh sách Sinh viên</h2>
              <button className="btn btn-success" onClick={handleExportCsv}>
                Xuất CSV
              </button>
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sinh viên..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <button className="btn btn-primary" onClick={handleSearchClick}>
                Tìm kiếm
              </button>
            </div>
            {loadingStudents ? (
              <div className="empty-message">Đang tải...</div>
            ) : students.length === 0 ? (
              <div className="empty-message">Chưa có sinh viên nào</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Mã SV</th>
                    <th>Họ tên</th>
                    <th>Năm sinh</th>
                    <th>Ngành</th>
                    <th>GPA</th>
                    <th>Lớp</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.student_id}>
                      <td>{student.student_id}</td>
                      <td>{student.name}</td>
                      <td>{student.birth_year}</td>
                      <td>{student.major}</td>
                      <td>{student.gpa.toFixed(2)}</td>
                      <td>{classes.find(c => c.class_id === student.class_id)?.class_name || student.class_id}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-warning btn-sm" onClick={() => handleEditStudent(student)}>
                            Sửa
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStudent(student.student_id)}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* CLASSES TAB */}
      {activeTab === 'classes' && (
        <>
          <div className="card">
            <h2>{editingClass ? 'Sửa Lớp học' : 'Thêm Lớp học'}</h2>
            <form onSubmit={handleClassSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mã lớp</label>
                  <input
                    type="text"
                    name="class_id"
                    value={classForm.class_id}
                    onChange={handleClassInputChange}
                    placeholder="VD: CLS001"
                    disabled={editingClass !== null}
                  />
                </div>
                <div className="form-group">
                  <label>Tên lớp</label>
                  <input
                    type="text"
                    name="class_name"
                    value={classForm.class_name}
                    onChange={handleClassInputChange}
                    placeholder="VD: CNTT01"
                  />
                </div>
                <div className="form-group">
                  <label>Cố vấn học tập</label>
                  <input
                    type="text"
                    name="advisor"
                    value={classForm.advisor}
                    onChange={handleClassInputChange}
                    placeholder="VD: Nguyễn Văn Hùng"
                  />
                </div>
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">
                  {editingClass ? 'Cập nhật' : 'Thêm mới'}
                </button>
                {editingClass && (
                  <button type="button" className="btn btn-secondary" onClick={resetClassForm}>
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card">
            <h2>Danh sách Lớp học</h2>
            {loadingClasses ? (
              <div className="empty-message">Đang tải...</div>
            ) : classes.length === 0 ? (
              <div className="empty-message">Chưa có lớp học nào</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Mã lớp</th>
                    <th>Tên lớp</th>
                    <th>Cố vấn học tập</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls.class_id}>
                      <td>{cls.class_id}</td>
                      <td>{cls.class_name}</td>
                      <td>{cls.advisor}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-warning btn-sm" onClick={() => handleEditClass(cls)}>
                            Sửa
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClass(cls.class_id)}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* STATISTICS TAB */}
      {activeTab === 'stats' && (
        <div className="card">
          <h2>Thống kê Sinh viên</h2>
          {stats ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.total_students}</div>
                  <div className="stat-label">Tổng số sinh viên</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.average_gpa}</div>
                  <div className="stat-label">GPA trung bình</div>
                </div>
              </div>
              
              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Số sinh viên theo ngành</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ngành học</th>
                    <th>Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.students_by_major.map((item, index) => (
                    <tr key={index}>
                      <td>{item.major}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="empty-message">Đang tải thống kê...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
