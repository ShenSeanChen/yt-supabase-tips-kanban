-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lists table
CREATE TABLE IF NOT EXISTS lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boards
CREATE POLICY "Users can view their own boards" ON boards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boards" ON boards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" ON boards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" ON boards
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for lists
CREATE POLICY "Users can view lists from their boards" ON lists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM boards 
            WHERE boards.id = lists.board_id 
            AND boards.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert lists to their boards" ON lists
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM boards 
            WHERE boards.id = lists.board_id 
            AND boards.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update lists from their boards" ON lists
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM boards 
            WHERE boards.id = lists.board_id 
            AND boards.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete lists from their boards" ON lists
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM boards 
            WHERE boards.id = lists.board_id 
            AND boards.user_id = auth.uid()
        )
    );

-- RLS Policies for cards
CREATE POLICY "Users can view cards from their lists" ON cards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lists 
            JOIN boards ON boards.id = lists.board_id
            WHERE lists.id = cards.list_id 
            AND boards.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert cards to their lists" ON cards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lists 
            JOIN boards ON boards.id = lists.board_id
            WHERE lists.id = cards.list_id 
            AND boards.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update cards from their lists" ON cards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM lists 
            JOIN boards ON boards.id = lists.board_id
            WHERE lists.id = cards.list_id 
            AND boards.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete cards from their lists" ON cards
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM lists 
            JOIN boards ON boards.id = lists.board_id
            WHERE lists.id = cards.list_id 
            AND boards.user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Sample data will be created automatically when you first log in
-- The app will create a default board with sample cards for new users 