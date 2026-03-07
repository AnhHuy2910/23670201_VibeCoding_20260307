from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./students.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models
class ClassDB(Base):
    __tablename__ = "classes"
    
    class_id = Column(String, primary_key=True, index=True)
    class_name = Column(String, nullable=False)
    advisor = Column(String, nullable=False)

class StudentDB(Base):
    __tablename__ = "students"
    
    student_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    birth_year = Column(Integer, nullable=False)
    major = Column(String, nullable=False)
    gpa = Column(Float, nullable=False)
    class_id = Column(String, ForeignKey("classes.class_id"), nullable=False)
    
    # Relationship
    student_class = relationship("ClassDB", backref="students")

# Create tables
Base.metadata.create_all(bind=engine)

# Seed initial data from CSV
import csv
import os

def seed_data():
    db = SessionLocal()
    try:
        # Seed classes
        if db.query(ClassDB).count() == 0:
            classes_csv = os.path.join(os.path.dirname(__file__), "classes.csv")
            if os.path.exists(classes_csv):
                with open(classes_csv, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        cls = ClassDB(
                            class_id=row["class_id"],
                            class_name=row["class_name"],
                            advisor=row["advisor"]
                        )
                        db.add(cls)
                db.commit()
                print("Classes data loaded from classes.csv!")
        
        # Seed students
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
                            gpa=float(row["gpa"]),
                            class_id=row["class_id"]
                        )
                        db.add(student)
                db.commit()
                print("Students data loaded from data.csv!")
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
    class_id: str

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    birth_year: Optional[int] = None
    major: Optional[str] = None
    gpa: Optional[float] = None
    class_id: Optional[str] = None

class Student(StudentBase):
    class Config:
        from_attributes = True

# Class Pydantic Models
class ClassBase(BaseModel):
    class_id: str
    class_name: str
    advisor: str

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    class_name: Optional[str] = None
    advisor: Optional[str] = None

class Class(ClassBase):
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
def get_students(search: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all students, optionally filter by name"""
    query = db.query(StudentDB)
    if search:
        query = query.filter(StudentDB.name.ilike(f"%{search}%"))
    return query.all()

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

# Class API Endpoints
@app.get("/classes", response_model=List[Class])
def get_classes(db: Session = Depends(get_db)):
    """Get all classes"""
    return db.query(ClassDB).all()

@app.get("/classes/{class_id}", response_model=Class)
def get_class(class_id: str, db: Session = Depends(get_db)):
    """Get a class by ID"""
    cls = db.query(ClassDB).filter(ClassDB.class_id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    return cls

@app.post("/classes", response_model=Class)
def create_class(cls: ClassCreate, db: Session = Depends(get_db)):
    """Create a new class"""
    existing = db.query(ClassDB).filter(ClassDB.class_id == cls.class_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Class ID already exists")
    
    db_class = ClassDB(**cls.model_dump())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

@app.put("/classes/{class_id}", response_model=Class)
def update_class(class_id: str, cls: ClassUpdate, db: Session = Depends(get_db)):
    """Update a class"""
    db_class = db.query(ClassDB).filter(ClassDB.class_id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    update_data = cls.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_class, key, value)
    
    db.commit()
    db.refresh(db_class)
    return db_class

@app.delete("/classes/{class_id}")
def delete_class(class_id: str, db: Session = Depends(get_db)):
    """Delete a class"""
    db_class = db.query(ClassDB).filter(ClassDB.class_id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    db.delete(db_class)
    db.commit()
    return {"message": "Class deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
