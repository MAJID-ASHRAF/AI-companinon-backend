-- Session and Messages Schema
-- Supports the thinking-phase engine with conversation history

-- Sessions table: tracks a single thinking flow
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_phase VARCHAR(20) NOT NULL DEFAULT 'DUMP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constrain to valid phases
    CONSTRAINT valid_phase CHECK (current_phase IN ('DUMP', 'CLARITY', 'DECISION', 'PLANNING', 'EXECUTION'))
);

-- Session messages: conversation history within a session
CREATE TABLE IF NOT EXISTS session_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    phase VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constrain role to valid values
    CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system')),
    -- Constrain phase
    CONSTRAINT valid_message_phase CHECK (phase IN ('DUMP', 'CLARITY', 'DECISION', 'PLANNING', 'EXECUTION'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON session_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_created_at ON session_messages(created_at);

