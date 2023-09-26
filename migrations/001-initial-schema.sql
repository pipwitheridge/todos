-- Up

CREATE TABLE Message (
    id INTEGER PRIMARY KEY,
    title STRING,
    description STRING,
    status STRING,
    daily STRING,
    duedate STRING,
    activeafter STRING
);

-- Down
DROP TABLE Message;


