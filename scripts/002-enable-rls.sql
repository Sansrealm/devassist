-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for emails
CREATE POLICY "Users can view own emails" ON emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emails" ON emails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emails" ON emails FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emails" ON emails FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tools
CREATE POLICY "Users can view own tools" ON tools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tools" ON tools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tools" ON tools FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tools" ON tools FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tool_accounts
CREATE POLICY "Users can view own tool accounts" ON tool_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tool accounts" ON tool_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tool accounts" ON tool_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tool accounts" ON tool_accounts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for project_tools
CREATE POLICY "Users can view own project tools" ON project_tools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project tools" ON project_tools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project tools" ON project_tools FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own project tools" ON project_tools FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for activity
CREATE POLICY "Users can view own activity" ON activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
