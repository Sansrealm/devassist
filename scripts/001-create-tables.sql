-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial');
CREATE TYPE subscription_type AS ENUM ('monthly', 'yearly', 'one-time', 'usage-based');
CREATE TYPE project_status AS ENUM ('active', 'paused', 'completed', 'archived');
CREATE TYPE tool_category AS ENUM ('development', 'design', 'productivity', 'communication', 'analytics', 'marketing', 'other');
CREATE TYPE activity_type AS ENUM ('tool_added', 'tool_removed', 'subscription_created', 'subscription_cancelled', 'project_created', 'project_updated');
CREATE TYPE notification_type AS ENUM ('renewal_reminder', 'trial_expiring', 'unused_tool', 'cost_alert');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create emails table
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status project_status DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create tools table
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category tool_category DEFAULT 'other',
  logo_url TEXT,
  website_url TEXT,
  base_cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create tool_accounts table
CREATE TABLE tool_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tool_id UUID NOT NULL,
  email_id UUID NOT NULL,
  account_name TEXT,
  account_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tool_account_id UUID NOT NULL,
  name TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle subscription_type NOT NULL,
  status subscription_status DEFAULT 'active',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  renewal_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  is_auto_renew BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  FOREIGN KEY (tool_account_id) REFERENCES tool_accounts(id) ON DELETE CASCADE
);

-- Create project_tools table
CREATE TABLE project_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  tool_account_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (tool_account_id) REFERENCES tool_accounts(id) ON DELETE CASCADE
);

-- Create activity table
CREATE TABLE activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type activity_type NOT NULL,
  description TEXT NOT NULL,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  related_id UUID,
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_email ON emails(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tools_user_id ON tools(user_id);
CREATE INDEX idx_tool_accounts_user_id ON tool_accounts(user_id);
CREATE INDEX idx_tool_accounts_tool_id ON tool_accounts(tool_id);
CREATE INDEX idx_tool_accounts_email_id ON tool_accounts(email_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_tool_account_id ON subscriptions(tool_account_id);
CREATE INDEX idx_subscriptions_renewal_date ON subscriptions(renewal_date);
CREATE INDEX idx_subscriptions_trial_end_date ON subscriptions(trial_end_date);
CREATE INDEX idx_project_tools_user_id ON project_tools(user_id);
CREATE INDEX idx_project_tools_project_id ON project_tools(project_id);
CREATE INDEX idx_project_tools_tool_account_id ON project_tools(tool_account_id);
CREATE INDEX idx_activity_user_id ON activity(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
