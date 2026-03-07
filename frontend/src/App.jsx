import { useState, useEffect } from 'react';
import { studentApi } from './api';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    birth_year: '',
    major: '',
    gpa: '',
  });

  // Fetch all students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getAll();
      setStudents(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch students. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      name: '',
      birth_year: '',
      major: '',
      gpa: '',
    });
    setEditingStudent(null);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.student_id || !formData.name || !formData.birth_year || !formData.major || !formData.gpa) {
      showMessage('error', 'Please fill in all fields');
      return;
    }

    const studentData = {
      ...formData,
      birth_year: parseInt(formData.birth_year),
      gpa: parseFloat(formData.gpa),
    };

    try {
      if (editingStudent) {
        // Update existing student
        await studentApi.update(editingStudent.student_id, {
          name: studentData.name,
          birth_year: studentData.birth_year,
          major: studentData.major,
          gpa: studentData.gpa,
        });
        showMessage('success', 'Student updated successfully!');
      } else {
        // Create new student
        await studentApi.create(studentData);
        showMessage('success', 'Student added successfully!');
      }
      resetForm();
      fetchStudents();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'An error occurred';
      showMessage('error', errorMessage);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      name: student.name,
      birth_year: student.birth_year.toString(),
      major: student.major,
      gpa: student.gpa.toString(),
    });
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await studentApi.delete(studentId);
      showMessage('success', 'Student deleted successfully!');
      fetchStudents();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete student';
      showMessage('error', errorMessage);
    }
  };

  return (
    <div className="container">
      <h1>Student Management System</h1>

      {/* Form Card */}
      <div className="card">
        <h2>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="student_id">Student ID</label>
              <input
                type="text"
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                placeholder="e.g., STU001"
                disabled={editingStudent !== null}
              />
            </div>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="form-group">
              <label htmlFor="birth_year">Birth Year</label>
              <input
                type="number"
                id="birth_year"
                name="birth_year"
                value={formData.birth_year}
                onChange={handleInputChange}
                placeholder="e.g., 2000"
                min="1900"
                max="2024"
              />
            </div>
            <div className="form-group">
              <label htmlFor="major">Major</label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gpa">GPA</label>
              <input
                type="number"
                id="gpa"
                name="gpa"
                value={formData.gpa}
                onChange={handleInputChange}
                placeholder="e.g., 3.5"
                step="0.01"
                min="0"
                max="4"
              />
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">
              {editingStudent ? 'Update Student' : 'Add Student'}
            </button>
            {editingStudent && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Students Table Card */}
      <div className="card">
        <h2>Student List</h2>
        
        {loading ? (
          <div className="empty-message">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="empty-message">No students found. Add your first student above!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Birth Year</th>
                <th>Major</th>
                <th>GPA</th>
                <th>Actions</th>
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
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEdit(student)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(student.student_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
