-- sudo mysql -u root < 20200309T050317-create_user.sql

DROP USER 'isabella'@'localhost';
CREATE USER 'isabella'@'localhost' IDENTIFIED BY 'isabellapass';
GRANT ALL PRIVILEGES ON * . * TO 'isabella'@'localhost';

