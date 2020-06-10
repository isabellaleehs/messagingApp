-- sudo mysql -u root < 20200310T213325-create_tables.sql

use isabellaleehs;

create table users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  display_name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(72) NOT NULL,
  last_login DATETIME NOT NULL,
  reset_token VARCHAR(50) DEFAULT NULL
);

create table channels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  channel_name VARCHAR(50) NOT NULL UNIQUE,
  owner_id INT NOT NULL,
  FOREIGN KEY(owner_id) REFERENCES users(id)
);

create table messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  channel_name VARCHAR(50) NOT NULL,
  replies_to INT DEFAULT NULL,
  sent_date DATETIME NOT NULL,
  user_id INT NOT NULL,
  author VARCHAR(50) NOT NULL,
  body TEXT NOT NULL,
  FOREIGN KEY(channel_name) REFERENCES channels(channel_name)
    ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

create table lastread (
  user_id INT NOT NULL,
  channel_name VARCHAR(50) NOT NULL,
  last_read_message_id INT DEFAULT 0,
  FOREIGN KEY(channel_name) REFERENCES channels(channel_name)
    ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

