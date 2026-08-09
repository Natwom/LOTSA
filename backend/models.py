from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum
from .database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"
    LEADER = "leader"
    PATRON = "patron"
    DEPUTY_PATRON = "deputy_patron"
    COMMITTEE_MEMBER = "committee_member"

class ComplaintStatus(str, enum.Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"

class EventCategory(str, enum.Enum):
    MEETING = "meeting"
    SPORTS = "sports"
    CULTURAL = "cultural"
    ACADEMIC = "academic"
    ELECTION = "election"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class DocumentType(str, enum.Enum):
    CONSTITUTION = "constitution"
    STUDENT_DATABASE = "student_database"
    GENERAL = "general"

# ===================================================================
# FIX: Accept BOTH legacy uppercase names and new lowercase values
# This lets SQLAlchemy read old "ADMIN" rows AND new "admin" rows
# ===================================================================
_UserRole_values = list(dict.fromkeys(
    [e.value for e in UserRole] + [e.name for e in UserRole]
))

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole, values_callable=lambda x: _UserRole_values), default=UserRole.STUDENT)
    full_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    profile = relationship("StudentProfile", back_populates="user", uselist=False)
    complaints = relationship("Complaint", back_populates="student")
    notifications = relationship("Notification", back_populates="user")
    sent_messages = relationship("Message", back_populates="sender")
    membership = relationship("MembershipCard", back_populates="user", uselist=False)
    payments = relationship("Payment", back_populates="user")
    contribution_payments = relationship("ContributionPayment", back_populates="user", foreign_keys="ContributionPayment.user_id")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String, nullable=False)
    admission_number = Column(String, unique=True, index=True)
    course = Column(String)
    year_of_study = Column(Integer)
    phone_number = Column(String)
    profile_picture_url = Column(String, nullable=True)

    user = relationship("User", back_populates="profile")
    event_registrations = relationship("EventRegistration", back_populates="student")
    votes = relationship("Vote", back_populates="student")
    candidates = relationship("Candidate", back_populates="student")

class MembershipCard(Base):
    __tablename__ = "membership_cards"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    card_number = Column(String, unique=True, index=True, nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=False)
    payment_status = Column(Enum(PaymentStatus, values_callable=lambda x: [e.value for e in x]), default=PaymentStatus.PENDING)
    amount_paid = Column(Integer, default=0)
    mpesa_receipt = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="membership")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer, nullable=False)
    payment_method = Column(String, default="mpesa")
    mpesa_receipt = Column(String, nullable=True)
    status = Column(Enum(PaymentStatus, values_callable=lambda x: [e.value for e in x]), default=PaymentStatus.PENDING)
    description = Column(String, default="Membership Card")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="payments")

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, default="general")
    is_pinned = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    author = relationship("User")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    banner_url = Column(String)
    location = Column(String)
    event_date = Column(DateTime)
    category = Column(Enum(EventCategory, values_callable=lambda x: [e.value for e in x]))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    registrations = relationship("EventRegistration", back_populates="event")
    author = relationship("User")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    registered_at = Column(DateTime, default=datetime.utcnow)
    attended = Column(Boolean, default=False)
    event = relationship("Event", back_populates="registrations")
    student = relationship("StudentProfile", back_populates="event_registrations")

class Election(Base):
    __tablename__ = "elections"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    position = Column(String, nullable=False)
    description = Column(Text)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    is_active = Column(Boolean, default=True)
    require_membership = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    candidates = relationship("Candidate", back_populates="election")
    votes = relationship("Vote", back_populates="election")

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True)
    election_id = Column(Integer, ForeignKey("elections.id"))
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    manifesto = Column(Text)
    photo_url = Column(String)
    photo_public_id = Column(String, nullable=True)
    election = relationship("Election", back_populates="candidates")
    student = relationship("StudentProfile", back_populates="candidates")
    votes = relationship("Vote", back_populates="candidate")

class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True)
    election_id = Column(Integer, ForeignKey("elections.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    voted_at = Column(DateTime, default=datetime.utcnow)
    election = relationship("Election", back_populates="votes")
    candidate = relationship("Candidate", back_populates="votes")
    student = relationship("StudentProfile", back_populates="votes")
    __table_args__ = (UniqueConstraint('election_id', 'student_id', name='_election_student_uc'),)

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="general")
    is_anonymous = Column(Boolean, default=False)
    status = Column(Enum(ComplaintStatus, values_callable=lambda x: [e.value for e in x]), default=ComplaintStatus.PENDING)
    admin_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    student = relationship("User", back_populates="complaints")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(Text)
    type = Column(String, default="general")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="notifications")

conversation_participants = Table(
    "conversation_participants",
    Base.metadata,
    Column("conversation_id", Integer, ForeignKey("conversations.id")),
    Column("user_id", Integer, ForeignKey("users.id"))
)

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True)
    is_group = Column(Boolean, default=False)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    participants = relationship("User", secondary=conversation_participants)
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    file_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    reply_to_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    edited_at = Column(DateTime, nullable=True)
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")
    reply_to = relationship("Message", remote_side=[id])
    read_by = relationship("MessageRead", back_populates="message")

class MessageRead(Base):
    __tablename__ = "message_reads"
    id = Column(Integer, primary_key=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    read_at = Column(DateTime, default=datetime.utcnow)
    message = relationship("Message", back_populates="read_by")

class Leader(Base):
    __tablename__ = "leaders"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    position = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    photo_public_id = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_type = Column(Enum(DocumentType, values_callable=lambda x: [e.value for e in x]), default=DocumentType.GENERAL)
    file_url = Column(String, nullable=False)
    file_public_id = Column(String, nullable=True)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    uploader = relationship("User")

class ContributionPeriod(Base):
    __tablename__ = "contribution_periods"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    amount = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    creator = relationship("User")
    payments = relationship("ContributionPayment", back_populates="period")

class ContributionPayment(Base):
    __tablename__ = "contribution_payments"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    period_id = Column(Integer, ForeignKey("contribution_periods.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    payment_method = Column(String, default="mpesa")
    mpesa_receipt = Column(String, nullable=True)
    status = Column(Enum(PaymentStatus, values_callable=lambda x: [e.value for e in x]), default=PaymentStatus.PENDING)
    paid_at = Column(DateTime, default=datetime.utcnow)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    user = relationship("User", foreign_keys=[user_id], back_populates="contribution_payments")
    period = relationship("ContributionPeriod", back_populates="payments")
    verifier = relationship("User", foreign_keys=[verified_by])
    
    __table_args__ = (UniqueConstraint('user_id', 'period_id', name='_user_period_payment_uc'),)

class UserSettings(Base):
    __tablename__ = "user_settings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    department = Column(String, nullable=True)
    year_of_study = Column(Integer, default=1)
    semester = Column(Integer, default=1)
    
    notifications_enabled = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    event_reminders = Column(Boolean, default=True)
    election_alerts = Column(Boolean, default=True)
    announcement_digest = Column(Boolean, default=False)
    
    privacy_mode = Column(String, default="public")
    show_online_status = Column(Boolean, default=True)
    allow_messages_from = Column(String, default="everyone")
    
    theme = Column(String, default="light")
    language = Column(String, default="en")
    font_size = Column(String, default="normal")
    reduced_motion = Column(Boolean, default=False)
    high_contrast = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User")

class PlatformSettings(Base):
    __tablename__ = "platform_settings"
    id = Column(Integer, primary_key=True)
    
    site_name = Column(String, default="LOTSA CONNECT")
    allow_registration = Column(Boolean, default=True)
    require_membership_for_voting = Column(Boolean, default=True)
    require_membership_for_events = Column(Boolean, default=False)
    max_file_upload_size = Column(Integer, default=10)
    allow_anonymous_complaints = Column(Boolean, default=True)
    maintenance_mode = Column(Boolean, default=False)
    default_language = Column(String, default="en")
    email_notifications_enabled = Column(Boolean, default=True)
    push_notifications_enabled = Column(Boolean, default=True)
    theme_default = Column(String, default="light")
    
    academic_year = Column(String, default="2023-2024")
    semester_current = Column(Integer, default=1)
    registration_deadline = Column(DateTime, nullable=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

class TermsDocument(Base):
    __tablename__ = "terms_documents"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)
    version = Column(String, default="1.0")
    is_active = Column(Boolean, default=True)
    is_required = Column(Boolean, default=True)
    category = Column(String, default="general")
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TermsAcceptance(Base):
    __tablename__ = "terms_acceptance"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    terms_id = Column(Integer, ForeignKey("terms_documents.id"), nullable=False)
    version_accepted = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    accepted_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (UniqueConstraint('user_id', 'terms_id', name='_user_terms_uc'),)