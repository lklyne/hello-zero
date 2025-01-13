CREATE DATABASE zstart;
CREATE DATABASE zstart_cvr;
CREATE DATABASE zstart_cdb;

\c zstart;

CREATE TABLE "user" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "partner" BOOLEAN NOT NULL
);

CREATE TABLE "medium" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL
);

CREATE TABLE "message" (
  "id" VARCHAR PRIMARY KEY,
  "senderID" VARCHAR REFERENCES "user"(id),
  "mediumID" VARCHAR REFERENCES "medium"(id),
  "body" VARCHAR NOT NULL,
  "timestamp" TIMESTAMP not null,
  "roll" VARCHAR NOT NULL
);

CREATE TABLE "chat" (
  "id" VARCHAR PRIMARY KEY,
  "userID" VARCHAR REFERENCES "user"(id),
  "messageID" VARCHAR REFERENCES "message"(id),
  "timestamp" TIMESTAMP not null
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

INSERT INTO "medium" (id, name) VALUES ('G14bSFuNDq', 'Discord');
INSERT INTO "medium" (id, name) VALUES ('b7rqt_8w_H', 'Twitter DM');
INSERT INTO "medium" (id, name) VALUES ('0HzSMcee_H', 'Tweet reply to unrelated thread');
INSERT INTO "medium" (id, name) VALUES ('ttx7NCmyac', 'SMS');

INSERT INTO "message" (id, senderID, mediumID, body, timestamp, roll) VALUES 
('msg1', 'ycD76wW4R2', 'G14bSFuNDq', 'Hey, check this out!', '2024-03-15 10:00:00', '4'),
('msg2', 'IoQSaxeVO5', 'ttx7NCmyac', 'Interesting project', '2024-03-15 10:05:00', '6'),
('msg3', 'WndZWmGkO4', 'b7rqt_8w_H', 'When is the next meeting?', '2024-03-15 11:00:00', '3');

INSERT INTO "chat" (id, userID, messageID, timestamp) VALUES 
('chat1', 'ycD76wW4R2', 'msg1', '2024-03-15 10:00:00'),
('chat2', 'IoQSaxeVO5', 'msg2', '2024-03-15 10:05:00'),
('chat3', 'WndZWmGkO4', 'msg3', '2024-03-15 11:00:00');
