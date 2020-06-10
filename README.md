# Messaging App 

Isabella Lee

### Running the app 

Run sql files in migrations folder in lexical order. This should create the database, user and tables (in this order). Start up the app from the final_proj directory with a ```flask run``` command from the command line. Refer to the following if using a virtual environment:

```. venv/bin/activate```

```export FLASK_ENV=development```

```export FLASK_APP=app.py```

```flask run```

If getting an SSL error on your machine, run the following as well:

```export LDFLAGS="-L/usr/local/opt/openssl/lib $LDFLAGS"``` 

```export CPPFLAGS="-I/usr/local/opt/openssl/include $CPPFLAGS"```

### Notes on implementation
- **Login**: The browser remembers a user in local storage so that the user does not have to login everytime the web page is visited. To simulate starting afresh, click clear local storage in the navbar. To login as a different user, click the Login/Sign Up button.

- **Login/Signup**: Both logins and signups use the same form. New users fill in all fields (username, email, password) to signup. Existing users must fill in the username and password associated with their email address during signup, or be denied entry. Without login, the user cannot access any of the channels. 

- **Password reset**: When a user forgets a password, he/she is prompted to enter the email associate with the account. If the email is found to be in the database, a reset password link is sent to the email account (otherwise, no email is sent, and for security reasons the user is not notified that the email is not valid). A magic key is generated for the email entered associated with the user's account and stored in the database. This is used for the magic link. When accessing the magic link in the email sent, if the magic key matches that in the database, the user's password is updated. This helps prevent unrequested or incorrect password resets by a user. NOTE: The program uses the centralized API key for the class, and because of this SendGrid has a weird lag time when at its limit for the day. I've tested this feature over multiple days and the email is sometimes sent immediately, sometimes anywhere from 5 minutes to 8 hours after the web api sent the email.

- **Last read messages and counts**: The last read message per channel per user is stored in the lastread database table. When a user scrolls to the bottom of the message div in a given channel, the id of the last message is recorded, and if this is larger than the existing id in the database, the id is updated in the database accordingly. If there are few messages and no scrollbar is visible, then all the messages are marked as read. Whenever messages are being pulled from the database for a given open channel, the program also counts the number of unread messages thus far in the same single query (that is, the number of messages in that channel with an id larger than the user's last read id in that channel). If the number of unread messages is greater than zero, the user is notified in the top right corner. 
At the same time, whenever channel information is being pulled from the database, the program likewise counts the number of unread messages across all channels in the same single query. If the number of unread messages is greater than zero, a small bubble with the number of unread messages appears next to the channel name.

