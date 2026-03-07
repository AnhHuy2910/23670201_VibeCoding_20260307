from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./students.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Model
class StudentDB(Base):
    __tablename__ = "students"
    
    student_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    birth_year = Column(Integer, nullable=False)
    major = Column(String, nullable=False)
    gpa = Column(Float, nullable=False)

# Create tables
Base.metadata.create_all(bind=engine)

# Seed initial data from CSV
import csv
import os

def seed_data():
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(StudentDB).count() == 0:
            csv_path = os.path.join(os.path.dirname(__file__), "data.csv")
            if os.path.exists(csv_path):
                with open(csv_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        student = StudentDB(
                            student_id=row["student_id"],
                            name=row["name"],
                            birth_year=int(row["birth_year"]),
                            major=row["major"],
                            gpa=float(row["gpa"])
                        )
                        db.add(student)
                db.commit()
                print("Sample data loaded from data.csv!")
    finally:
        db.close()

seed_data()

# Pydantic Models
class StudentBase(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    birth_year: Optional[int] = None
    major: Optional[str] = None
    gpa: Optional[float] = None

class Student(StudentBase):
    class Config:
        from_attributes = True

# FastAPI app
app = FastAPI(title="Student Management API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Endpoints
@app.get("/students", response_model=List[Student])
def get_students(db: Session = Depends(get_db)):
    """Get all students"""
    return db.query(StudentDB).all()

@app.get("/students/{student_id}", response_model=Student)
def get_student(student_id: str, db: Session = Depends(get_db)):
    """Get a student by ID"""
    student = db.query(StudentDB).filter(StudentDB.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.post("/students", response_model=Student)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student"""
    existing = db.query(StudentDB).filter(StudentDB.student_id == student.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student ID already exists")
    
    db_student = StudentDB(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.put("/students/{student_id}", response_model=Student)
def update_student(student_id: str, student: StudentUpdate, db: Session = Depends(get_db)):
    """Update a student"""
    db_student = db.query(StudentDB).filter(StudentDB.student_id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = student.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)
    
    db.commit()
    db.refresh(db_student)
    return db_student

@app.delete("/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    """Delete a student"""
    db_student = db.query(StudentDB).filter(StudentDB.student_id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(db_student)
    db.commit()
    return {"message": "Student deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
