CREATE DATABASE zstart;
CREATE DATABASE zstart_cvr;
CREATE DATABASE zstart_cdb;

\c zstart;

CREATE TABLE "user" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "partner" BOOLEAN NOT NULL
);

CREATE TABLE "chat" (
  "id" VARCHAR PRIMARY KEY,
  "userID" VARCHAR REFERENCES "user"(id),
  "title" VARCHAR NOT NULL,
  "systemPrompt" VARCHAR NOT NULL,
  "temperature" NUMERIC NOT NULL,
  "createdAt" TIMESTAMP NOT NULL
);

CREATE TABLE "message" (
  "id" VARCHAR PRIMARY KEY,
  "chatID" VARCHAR REFERENCES "chat"(id) ON DELETE CASCADE,
  "role" VARCHAR NOT NULL,
  "content" VARCHAR NOT NULL,
  "timestamp" TIMESTAMP NOT NULL
);

INSERT INTO "user" (id, name, partner) VALUES ('ycD76wW4R2', 'Aaron', true);
INSERT INTO "user" (id, name, partner) VALUES ('IoQSaxeVO5', 'Matt', true);
INSERT INTO "user" (id, name, partner) VALUES ('WndZWmGkO4', 'Cesar', true);
INSERT INTO "user" (id, name, partner) VALUES ('ENzoNm7g4E', 'Erik', true);
INSERT INTO "user" (id, name, partner) VALUES ('dLKecN3ntd', 'Greg', true);
INSERT INTO "user" (id, name, partner) VALUES ('enVvyDlBul', 'Darick', true);
INSERT INTO "user" (id, name, partner) VALUES ('9ogaDuDNFx', 'Alex', true);
INSERT INTO "user" (id, name, partner) VALUES ('6z7dkeVLNm', 'Dax', false);
INSERT INTO "user" (id, name, partner) VALUES ('7VoEoJWEwn', 'Nate', false);

-- INSERT INTO "chat" (id, userid, title, systemPrompt, temperature, createdAt) VALUES 
-- ('chat1', 'ycD76wW4R2', 'First Chat', 'You are a helpful assistant', 0.7, '2024-03-15 10:00:00'),
-- ('chat2', 'IoQSaxeVO5', 'Technical Discussion', 'You are a technical expert', 0.5, '2024-03-15 10:05:00');

-- INSERT INTO "message" (id, chatid, role, content, timestamp) VALUES 
-- ('msg1', 'chat1', 'user', 'Hello, can you help me with something?', '2024-03-15 10:00:00'),
-- ('msg2', 'chat1', 'assistant', 'Of course! What can I help you with?', '2024-03-15 10:00:10'),
-- ('msg3', 'chat2', 'user', 'How do I implement a binary search?', '2024-03-15 10:05:00'),
-- ('msg4', 'chat2', 'assistant', 'Let me explain binary search step by step...', '2024-03-15 10:05:10');
