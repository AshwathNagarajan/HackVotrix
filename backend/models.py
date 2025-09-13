from datetime import datetime
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, EmailStr


class ResponseModel(BaseModel):
	success: bool
	data: Optional[Any] = None
	error: Optional[str] = None


class UserCreate(BaseModel):
	email: EmailStr
	password: str


class UserLogin(BaseModel):
	email: EmailStr
	password: str


class UserDB(BaseModel):
	id: str = Field(alias="_id")
	email: EmailStr
	password_hash: str


class TokenResponse(BaseModel):
	access_token: str
	token_type: str = "bearer"
	expires_in: int


class PatientBase(BaseModel):
	name: str
	age: int = Field(ge=0)
	gender: Literal["male", "female", "other"]
	medical_history: Optional[str] = None
	lifestyle: Optional[str] = None
	risk_factors: Optional[List[str]] = None


class PatientCreate(PatientBase):
	pass


class PatientUpdate(BaseModel):
	name: Optional[str] = None
	age: Optional[int] = Field(default=None, ge=0)
	gender: Optional[Literal["male", "female", "other"]] = None
	medical_history: Optional[str] = None
	lifestyle: Optional[str] = None
	risk_factors: Optional[List[str]] = None


class PatientDB(PatientBase):
	id: str = Field(alias="_id")


class ReportMetadata(BaseModel):
	type: Literal["pdf", "image"]
	uploaded_at: datetime


class ReportCreate(BaseModel):
	patient_id: str
	report_text: str
	report_date: datetime
	metadata: ReportMetadata


class ReportDB(ReportCreate):
	report_id: str


class SymptomRequest(BaseModel):
	symptom: str


class ChatMessage(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = []