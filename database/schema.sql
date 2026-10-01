CREATE TABLE users (

    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(225) UNIQUE NOT NULL,
    password_hash VARCHAR(225) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('reviewer', 'submitter')),

    display_picure VARCHAR(225),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (

    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,
    description TEXT,

    created_by INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (

    id SERIAL PRIMARY KEY,
    
    project_id INTEGER NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    submitter_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title VARCHAR(200) NOT NULL,

    code TEXT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (

            status IN (

                'pending',
                'in_review',
                'approved',
                'changes_requested'
            )
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
);

CREATE TABLE comments (

    id SERIAL PRIMARY KEY,

    submission_id INTEGER NOT NULL
        REFERENCES submissions(id)
        ON DELETE CASCADE,

    reviewer_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    context TEXT NOT NULL,

    line_number INTEGER
        CHECK (line_number IS NULL OR line_number > 0),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_members (

    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(project_id, user_id)
);