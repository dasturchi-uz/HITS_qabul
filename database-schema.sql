-- Hackathon IT School CRM Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table for admin authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'operator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Applications table for student registrations
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female')),
    address TEXT,
    previous_school TEXT,
    grade_level INTEGER,
    preferred_it_track VARCHAR(100),
    accommodation_type VARCHAR(50) CHECK (accommodation_type IN ('day', 'transport', 'dormitory')),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interview_scheduled', 'interviewed', 'approved', 'rejected', 'enrolled', 'waitlist')),
    source VARCHAR(100) DEFAULT 'website',
    notes TEXT,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication log table
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('call', 'sms', 'email', 'whatsapp', 'meeting', 'note')),
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    subject VARCHAR(255),
    content TEXT,
    duration_minutes INTEGER,
    outcome VARCHAR(100),
    next_follow_up DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100) CHECK (document_type IN ('birth_certificate', 'photo', 'previous_school_report', 'parent_id', 'other')),
    file_url TEXT,
    file_name VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'UZS',
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'click', 'payme')),
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    description TEXT,
    receipt_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks/Reminders table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_assigned_to ON applications(assigned_to);
CREATE INDEX idx_applications_created_at ON applications(created_at);
CREATE INDEX idx_communications_application_id ON communications(application_id);
CREATE INDEX idx_communications_created_at ON communications(created_at);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Insert default admin user (password: admin123 - change this immediately!)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('admin@hackathon.uz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bTqY8F4Zm', 'Super Admin', 'admin');

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('school_name', 'Hackathon IT School', 'Maktab nomi'),
('school_address', 'Fargʻona shahri, Mustaqillik shoh koʻchasi, 341-uy', 'Maktab manzili'),
('school_phone', '+998 50 045 60 10', 'Aloqa telefon raqami'),
('current_year', '2026', 'Joriy oʻquv yili'),
('max_students', '100', 'Maksimal oʻquvchi soni');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for applications table
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for application statistics
CREATE OR REPLACE VIEW application_stats AS
SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'new') as new_applications,
    COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
    COUNT(*) FILTER (WHERE status = 'interview_scheduled') as interview_scheduled,
    COUNT(*) FILTER (WHERE status = 'interviewed') as interviewed,
    COUNT(*) FILTER (WHERE status = 'approved') as approved,
    COUNT(*) FILTER (WHERE status = 'enrolled') as enrolled,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
    COUNT(*) FILTER (WHERE status = 'waitlist') as waitlist,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_applications,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as this_month_applications
FROM applications;

-- Create Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
CREATE POLICY "Admins can view all users" ON users FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can insert users" ON users FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update users" ON users FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS policies for applications table
CREATE POLICY "All authenticated users can view applications" ON applications FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert applications" ON applications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update applications" ON applications FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete applications" ON applications FOR DELETE
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Similar policies for other tables
CREATE POLICY "All authenticated users can view communications" ON communications FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert communications" ON communications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update communications" ON communications FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view documents" ON documents FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert documents" ON documents FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view payments" ON payments FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert payments" ON payments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update payments" ON payments FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view tasks" ON tasks FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can insert tasks" ON tasks FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update tasks" ON tasks FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view settings" ON settings FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update settings" ON settings FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
