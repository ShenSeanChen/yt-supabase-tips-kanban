-- Sample Data Script for Supabase Kanban Board
-- Run this AFTER you've authenticated and want to add sample data
-- This should be run when you're logged in to your app

-- First, make sure you're authenticated (run this in your app's console or when logged in)
-- This will only work if auth.uid() returns a valid user ID

-- Create sample boards
INSERT INTO boards (title, description, user_id) VALUES 
    ('My First Board', 'A sample Kanban board to get you started', auth.uid()),
    ('Project Alpha', 'Development project board', auth.uid()),
    ('Marketing Campaign', 'Q1 marketing initiatives', auth.uid())
ON CONFLICT DO NOTHING;

-- Create sample lists for the first board
INSERT INTO lists (title, board_id, position) VALUES 
    ('To Do', (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1), 1),
    ('In Progress', (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1), 2),
    ('Review', (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1), 3),
    ('Done', (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1), 4)
ON CONFLICT DO NOTHING;

-- Create sample cards
INSERT INTO cards (title, description, list_id, position) VALUES 
    ('Welcome to your Kanban board!', 'This is your first card. You can edit or delete it.', 
     (SELECT id FROM lists WHERE title = 'To Do' AND board_id = (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 1),
    
    ('Drag and drop cards', 'Try dragging this card to different lists to see real-time updates.', 
     (SELECT id FROM lists WHERE title = 'To Do' AND board_id = (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 2),
     
    ('Add new cards', 'Click the input field below to add new cards to any list.', 
     (SELECT id FROM lists WHERE title = 'To Do' AND board_id = (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 3),
     
    ('Real-time collaboration', 'Open this app in multiple tabs to see real-time updates!', 
     (SELECT id FROM lists WHERE title = 'In Progress' AND board_id = (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 1),
     
    ('Row Level Security', 'Only you can see your boards - security built into the database.', 
     (SELECT id FROM lists WHERE title = 'In Progress' AND board_id = (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 2),
     
    ('Setup complete!', 'Your Kanban board is ready to use. Start organizing your tasks!', 
     (SELECT id FROM lists WHERE title = 'Done' AND board_id = (SELECT id FROM boards WHERE title = 'My First Board' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 1)
ON CONFLICT DO NOTHING;

-- Optional: Create lists for Project Alpha board
INSERT INTO lists (title, board_id, position) VALUES 
    ('Backlog', (SELECT id FROM boards WHERE title = 'Project Alpha' AND user_id = auth.uid() LIMIT 1), 1),
    ('Sprint', (SELECT id FROM boards WHERE title = 'Project Alpha' AND user_id = auth.uid() LIMIT 1), 2),
    ('Testing', (SELECT id FROM boards WHERE title = 'Project Alpha' AND user_id = auth.uid() LIMIT 1), 3),
    ('Deployed', (SELECT id FROM boards WHERE title = 'Project Alpha' AND user_id = auth.uid() LIMIT 1), 4)
ON CONFLICT DO NOTHING;

-- Optional: Add some cards to Project Alpha
INSERT INTO cards (title, description, list_id, position) VALUES 
    ('Setup project repository', 'Initialize Git repo and basic project structure', 
     (SELECT id FROM lists WHERE title = 'Backlog' AND board_id = (SELECT id FROM boards WHERE title = 'Project Alpha' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 1),
     
    ('Design database schema', 'Plan the database tables and relationships', 
     (SELECT id FROM lists WHERE title = 'Backlog' AND board_id = (SELECT id FROM boards WHERE title = 'Project Alpha' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 2),
     
    ('Build authentication', 'Implement user login and registration', 
     (SELECT id FROM lists WHERE title = 'Sprint' AND board_id = (SELECT id FROM boards WHERE title = 'Project Alpha' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 1),
     
    ('User dashboard', 'Create the main user interface', 
     (SELECT id FROM lists WHERE title = 'Testing' AND board_id = (SELECT id FROM boards WHERE title = 'Project Alpha' AND user_id = auth.uid() LIMIT 1) LIMIT 1), 1)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Sample data created successfully! 🎉' as message; 