from pydantic import BaseModel, EmailStr, Field, validator, model_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import re

class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"
    LEADER = "leader"
    PATRON = "patron"
    DEPUTY_PATRON = "deputy_patron"
    COMMITTEE_MEMBER = "committee_member"

class ComplaintStatus(str, Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"

class EventCategory(str, Enum):
    MEETING = "meeting"
    SPORTS = "sports"
    CULTURAL = "cultural"
    ACADEMIC = "academic"
    ELECTION = "election"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class DocumentType(str, Enum):
    CONSTITUTION = "constitution"
    STUDENT_DATABASE = "student_database"
    GENERAL = "general"

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# NEW: Unified registration for students + non-students
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    admission_number: Optional[str] = None
    course: Optional[str] = None
    year_of_study: Optional[int] = None

    @validator('role', pre=True)
    @classmethod
    def normalize_role(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @validator('phone_number')
    def validate_kenyan_phone(cls, v):
        if not v:
            return v
        v = v.replace(' ', '')
        if not re.match(r'^254\d{9}$', v):
            raise ValueError('Phone must be a valid Kenyan number (254XXXXXXXXX)')
        prefix = v[3:5]
        valid = ['10', '11', '12', '70', '71', '72', '73', '74', '79', '75', '76', '77', '78']
        if prefix not in valid:
            raise ValueError('Invalid Kenyan mobile network prefix')
        return v

    @model_validator(mode='before')
    @classmethod
    def validate_student_fields(cls, values):
        if isinstance(values, dict):
            role = values.get('role')
            if role == UserRole.STUDENT or role == 'student':
                if not values.get('admission_number'):
                    raise ValueError('Admission number is required for students')
                if not values.get('course'):
                    raise ValueError('Course is required for students')
                if not values.get('year_of_study'):
                    raise ValueError('Year of study is required for students')
        return values

# Kept for backward compatibility / admin use
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    admission_number: str
    course: str
    year_of_study: int
    phone_number: Optional[str] = None

    @validator('phone_number')
    def validate_kenyan_phone(cls, v):
        if not v:
            return v
        v = v.replace(' ', '')
        if not re.match(r'^254\d{9}$', v):
            raise ValueError('Phone must be a valid Kenyan number (254XXXXXXXXX)')
        prefix = v[3:5]
        valid = ['10', '11', '12', '70', '71', '72', '73', '74', '79', '75', '76', '77', '78']
        if prefix not in valid:
            raise ValueError('Invalid Kenyan mobile network prefix')
        return v

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    course: Optional[str] = None
    year_of_study: Optional[int] = None
    phone_number: Optional[str] = None

    @validator('phone_number')
    def validate_kenyan_phone(cls, v):
        if not v:
            return v
        v = v.replace(' ', '')
        if not re.match(r'^254\d{9}$', v):
            raise ValueError('Phone must be a valid Kenyan number (254XXXXXXXXX)')
        prefix = v[3:5]
        valid = ['10', '11', '12', '70', '71', '72', '73', '74', '79', '75', '76', '77', '78']
        if prefix not in valid:
            raise ValueError('Invalid Kenyan mobile network prefix')
        return v

class StudentProfileOut(BaseModel):
    id: int
    full_name: str
    admission_number: str
    course: str
    year_of_study: int
    phone_number: Optional[str] = None
    profile_picture_url: Optional[str] = None
    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    profile: Optional[StudentProfileOut] = None
    class Config:
        from_attributes = True

class MembershipCardOut(BaseModel):
    id: int
    user_id: int
    card_number: str
    issue_date: datetime
    expiry_date: datetime
    is_active: bool
    payment_status: PaymentStatus
    amount_paid: int
    created_at: datetime
    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    amount: int = 100
    payment_method: str = "mpesa"
    mpesa_receipt: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    user_id: int
    amount: int
    payment_method: str
    mpesa_receipt: Optional[str]
    status: PaymentStatus
    description: str
    created_at: datetime
    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "general"
    is_pinned: Optional[bool] = False

class AnnouncementOut(AnnouncementCreate):
    id: int
    created_by: int
    created_at: datetime
    class Config:
        from_attributes = True

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    banner_url: Optional[str] = None
    location: Optional[str] = None
    event_date: datetime
    category: Optional[EventCategory] = EventCategory.MEETING

class EventOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    banner_url: Optional[str] = None
    location: Optional[str] = None
    event_date: datetime
    category: Optional[str] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class EventRegistrationOut(BaseModel):
    id: int
    event_id: int
    student_id: int
    registered_at: datetime
    attended: bool
    class Config:
        from_attributes = True

class ElectionCreate(BaseModel):
    title: str
    position: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    require_membership: Optional[bool] = True

class ElectionOut(ElectionCreate):
    id: int
    is_active: bool
    created_by: int
    created_at: datetime
    candidates: Optional[List["CandidateOut"]] = []
    class Config:
        from_attributes = True

class CandidateCreate(BaseModel):
    student_id: int
    manifesto: Optional[str] = None
    photo_url: Optional[str] = None

class CandidateOut(BaseModel):
    id: int
    election_id: int
    student_id: int
    manifesto: Optional[str] = None
    photo_url: Optional[str] = None
    student: Optional[StudentProfileOut] = None
    class Config:
        from_attributes = True

class VoteCreate(BaseModel):
    candidate_id: int

class VoteOut(BaseModel):
    id: int
    election_id: int
    candidate_id: int
    student_id: int
    voted_at: datetime
    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = "general"
    is_anonymous: Optional[bool] = False

class ComplaintOut(ComplaintCreate):
    id: int
    student_id: int
    status: ComplaintStatus
    admin_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    student: Optional[UserOut] = None
    class Config:
        from_attributes = True

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus

class ComplaintResponse(BaseModel):
    admin_response: str

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: Optional[str] = None
    type: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    is_group: Optional[bool] = False
    name: Optional[str] = None
    participant_ids: List[int]

class ConversationOut(BaseModel):
    id: int
    is_group: bool
    name: Optional[str] = None
    created_at: datetime
    last_message: Optional[str] = None
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    conversation_id: int
    content: Optional[str] = None
    file_url: Optional[str] = None
    image_url: Optional[str] = None
    reply_to_id: Optional[int] = None

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: Optional[str] = None
    file_url: Optional[str] = None
    image_url: Optional[str] = None
    reply_to_id: Optional[int] = None
    created_at: datetime
    edited_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class LeaderCreate(BaseModel):
    user_id: int
    position: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    display_order: Optional[int] = 0

class LeaderOut(BaseModel):
    id: int
    user_id: int
    position: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    display_order: int
    is_active: bool
    created_at: datetime
    user: Optional[UserOut] = None
    class Config:
        from_attributes = True

# ==================== DOCUMENT SCHEMAS ====================

class DocumentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    file_type: Optional[DocumentType] = DocumentType.GENERAL

class DocumentOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    file_type: str
    file_url: str
    file_name: str
    file_size: Optional[int] = None
    uploaded_by: Optional[int] = None
    is_active: bool
    uploaded_at: datetime
    class Config:
        from_attributes = True

# ==================== CONTRIBUTION SCHEMAS ====================

class ContributionPeriodCreate(BaseModel):
    title: str
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2020, le=2100)
    amount: int = Field(..., gt=0)
    due_date: Optional[datetime] = None

class ContributionPeriodOut(BaseModel):
    id: int
    title: str
    month: int
    year: int
    amount: int
    due_date: Optional[datetime] = None
    is_active: bool
    created_by: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ContributionPaymentCreate(BaseModel):
    period_id: int
    amount: int
    payment_method: str = "mpesa"
    mpesa_receipt: Optional[str] = None

class ContributionPaymentOut(BaseModel):
    id: int
    user_id: int
    period_id: int
    amount: int
    payment_method: str
    mpesa_receipt: Optional[str] = None
    status: str
    paid_at: datetime
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    user: Optional[UserOut] = None
    period: Optional[ContributionPeriodOut] = None
    class Config:
        from_attributes = True

# ==================== SETTINGS & TERMS SCHEMAS ====================

class UserSettingsBase(BaseModel):
    department: Optional[str] = None
    year_of_study: Optional[int] = 1
    semester: Optional[int] = 1
    notifications_enabled: Optional[bool] = True
    email_notifications: Optional[bool] = True
    push_notifications: Optional[bool] = True
    event_reminders: Optional[bool] = True
    election_alerts: Optional[bool] = True
    announcement_digest: Optional[bool] = False
    privacy_mode: Optional[str] = "public"
    show_online_status: Optional[bool] = True
    allow_messages_from: Optional[str] = "everyone"
    theme: Optional[str] = "light"
    language: Optional[str] = "en"
    font_size: Optional[str] = "normal"
    reduced_motion: Optional[bool] = False
    high_contrast: Optional[bool] = False

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsOut(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class PlatformSettingsBase(BaseModel):
    site_name: Optional[str] = "LOTSA CONNECT"
    allow_registration: Optional[bool] = True
    require_membership_for_voting: Optional[bool] = True
    require_membership_for_events: Optional[bool] = False
    max_file_upload_size: Optional[int] = 10
    allow_anonymous_complaints: Optional[bool] = True
    maintenance_mode: Optional[bool] = False
    default_language: Optional[str] = "en"
    email_notifications_enabled: Optional[bool] = True
    push_notifications_enabled: Optional[bool] = True
    theme_default: Optional[str] = "light"
    academic_year: Optional[str] = "2023-2024"
    semester_current: Optional[int] = 1
    registration_deadline: Optional[datetime] = None

class PlatformSettingsUpdate(PlatformSettingsBase):
    pass

class PlatformSettingsOut(PlatformSettingsBase):
    id: int
    updated_at: datetime
    updated_by: Optional[int] = None
    class Config:
        from_attributes = True

class TermsDocumentCreate(BaseModel):
    title: str
    slug: str
    content: str
    category: Optional[str] = "general"
    is_required: Optional[bool] = True

class TermsDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    version: Optional[str] = None
    is_active: Optional[bool] = None
    is_required: Optional[bool] = None

class TermsDocumentOut(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    version: str
    is_active: bool
    is_required: bool
    category: str
    created_by: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class TermsAcceptanceCreate(BaseModel):
    terms_id: int
    version_accepted: str

class TermsAcceptanceOut(BaseModel):
    id: int
    user_id: int
    terms_id: int
    version_accepted: str
    accepted_at: datetime
    class Config:
        from_attributes = True