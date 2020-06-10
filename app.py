# Materials consulted:
# - https://docs.sqlalchemy.org/en/13/orm/session_api.html#sqlalchemy.orm.session.Session.execute
# - https://stackoverflow.com/questions/27135779/cannot-catch-mysql-integrityerror-in-python
# - https://gomakethings.com/listening-for-click-events-with-vanilla-javascript/
# - https://getbootstrap.com/docs/4.0/components/buttons/
# - https://stackoverflow.com/questions/4825295/javascript-onclick-to-get-the-id-of-the-clicked-button
# - https://getbootstrap.com/docs/4.0/components/collapse/
# - https://stackoverflow.com/questions/7182342/how-to-detect-when-the-user-has-scrolled-to-a-certain-area-on-the-page-using-jqu/7182403
# - https://stackoverflow.com/questions/487073/how-to-check-if-element-is-visible-after-scrolling
# - https://www.w3schools.com/howto/howto_js_media_queries.asp
# - https://flaviocopes.com/how-to-add-event-listener-multiple-elements-javascript/
# - https://stackoverflow.com/questions/31851922/get-the-id-of-elements-with-same-class
# - https://stackoverflow.com/questions/47724299/how-to-run-once-function-on-scroll-up-and-scroll-down-event
# - https://stackoverflow.com/questions/3898130/check-if-a-user-has-scrolled-to-the-bottom
# - https://stackoverflow.com/questions/27835619/urllib-and-ssl-certificate-verify-failed-error/42334357#42334357
# - https://stackoverflow.com/questions/2914936/mysql-foreign-key-constraints-cascade-delete
# - https://stackoverflow.com/questions/12984379/how-to-determine-if-you-have-scrolled-to-the-bottom-of-an-element
# - https://stackoverflow.com/questions/56985932/prevent-modal-close-on-asptextbox-enter
  
from uuid import uuid1
from flask import Flask, render_template, request
from functools import wraps
import os, json, uuid, sys
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import errorcode
from flask_bcrypt import Bcrypt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

app = Flask(__name__)
bcrypt = Bcrypt(app)
os.environ['SENDGRID_API_KEY'] = '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'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
DB_USERNAME = 'isabella'
DB_PASS = 'isabellapass'
DB_HOST = 'localhost'
DB_NAME = 'isabellaleehs'

@app.route('/')
@app.route('/chat/<channel_name>')
@app.route('/chat/<channel_name>/thread/<int:thread_id>')
@app.route('/reset')
def index(channel_name=None, thread_id=None):
    return app.send_static_file('index.html')

# -------------------------------- API ROUTES ----------------------------------

@app.route('/api/update_user', methods=['POST'])
def update_user ():
    '''
    Creates new user or updates user info (username, email or password). 
    '''
    if request.method == 'POST':
        print(request.form)
        if 'update_username' in request.form: #updating username 
            print("updating username")
            username = request.form['variable']
            password = request.form['password']
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            user_id = request.form['user_token']
            cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
            cursor = cnx.cursor()
            try:
                cursor.execute("SELECT * from users WHERE id = %s", [user_id])
                return_vars = cursor.fetchone()
                print(return_vars)
                if return_vars != None: 
                    if bcrypt.check_password_hash(return_vars[3], password.encode('utf-8')) == True:
                        print("password matches")
                        cursor.execute("UPDATE users SET \
                        display_name = %s, last_login = %s \
                        WHERE id = %s", (username, datetime.now(), user_id))
                        cnx.commit()
                        return {
                            "username": username, #display
                        }, 200
                return {
                    "message": "User unknown or password incorrect."
                }, 400  
            except mysql.connector.Error as err:
                return {
                    "message": ("Password may be incorrect. {}".format(err))
                }, 400        
            finally:
                cursor.close()
                cnx.close()

        elif 'update_email' in request.form:
            print("updating email")
            email = request.form['variable']
            password = request.form['password']
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            user_id = request.form['user_token']
            cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
            cursor = cnx.cursor()
            try:
                cursor.execute("SELECT * from users WHERE id = %s", [user_id])
                return_vars = cursor.fetchone()
                print(return_vars)
                if return_vars != None: 
                    if bcrypt.check_password_hash(return_vars[3], password.encode('utf-8')) == True:
                        print("password matches")
                        cursor.execute("UPDATE users SET \
                        email = %s, last_login = %s \
                        WHERE id = %s", (email, datetime.now(), user_id))
                        cnx.commit()
                        return {
                            "email": email, #display
                        }, 200
                return {
                    "message": "User unknown or password incorrect."
                }, 400   
            except mysql.connector.Error as err:
                return {
                    "message": ("Password may be incorrect. {}".format(err))
                }, 400         
            finally:
                cursor.close()
                cnx.close()

        elif 'update_password' in request.form:
            print("updating password")
            magic_key = request.form['magic_key']
            print(magic_key)
            password = request.form['password']
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
            cursor = cnx.cursor()

            cursor.execute("SELECT id from users WHERE reset_token = %s", [magic_key])
            result = cursor.fetchone()
            if result != None: 
                cursor.execute("UPDATE users SET \
                    password = %s WHERE reset_token = %s", (password_hash, magic_key))
                cnx.commit()
                return {
                    "message": "Password updated", 
                }, 200
            else:
                return {
                    "message": "No user found.", 
                }, 400
            cursor.close()
            cnx.close()

        else:
            username = request.form['username']
            email = request.form['email']
            password = request.form['password']
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
            cursor = cnx.cursor()
            try:
                cursor.execute("INSERT into users (display_name, email, password, last_login) \
                    VALUES (%s, %s, %s, %s)", (username, email, password_hash, datetime.now()))
                cnx.commit()
                cursor.execute("SELECT id from users WHERE email = %s", [email])
                user_id = cursor.fetchall()[0]
                return {
                    "username": username, #display
                    "email": email, #display
                    "user_token": user_id, #save to local storage
                }, 200

            except mysql.connector.Error as err:
                if err.errno == 1062: #if duplicate email entry
                    cursor.execute("SELECT * from users WHERE email = %s", [email])
                    return_vars = cursor.fetchall()[0]
                    if username == return_vars[1] and bcrypt.check_password_hash(return_vars[3], password.encode('utf-8')) == True:
                        #successful login
                        cursor.execute("SELECT id from users WHERE email = %s", [email])
                        user_id = cursor.fetchall()[0]

                        return {
                            "username": username, #display
                            "email": email, #display
                            "user_token": user_id, #save to local storage
                        }, 200
                    else:
                        return {
                            "message": "Either your username or password doesn't match the email address. "
                            "Please try again. To reset username or password, click the forgot password link."
                        }, 400  
                else:
                    return {
                        "message": ("{}".format(err))
                    }, 400    
            finally:
                cursor.close()
                cnx.close()

@app.route('/api/send_email', methods=['POST'])
def send_email ():
    '''
    For when user forgets password - uses SENDGRID API to send a magic link. 
    '''
    if request.method == 'POST':
        email = request.form['email']
        cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
        cursor = cnx.cursor()
        cursor.execute("SELECT id, display_name from users WHERE email = %s", [email])
        result = cursor.fetchone()

        if result != None: #if there is an account associated with this email address
            user_id = result[0]
            display_name = result[1]
            magic_key = str(uuid.uuid1()) #generate special token for this user
            cursor.execute("UPDATE users SET \
                reset_token = %s WHERE id = %s", (magic_key, user_id))
            cnx.commit()
            magic_link = "http://127.0.0.1:5000/reset?magic_key="+magic_key
            body_val = "Hi "+display_name+", <br>Use this link to reset your password: <a href='"+magic_link+\
            "'> magic link </a>"
            message = Mail(
                from_email='belay@belay.com',
                to_emails=email,
                subject='Belay password reset',
                html_content=body_val)
            print(message)
            try:
                sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
                response = sg.send(message)
                print(response.status_code, response.body, response.headers)
                return {
                    "message": "Email sent"
                }, 200  
            except Exception as e:
                return {
                    "message": ("{}".format(e))
                }, 400 
            finally:
                cursor.close()
                cnx.close()
        else:
            return {
                "message": "Email not sent, no account."
            }, 200  

@app.route('/api/channels', methods=['GET','POST'])
def channels ():
    '''
    Either creates a new chat with current user as the owner, or
    gets channels and unread counts for every channel, for current user.
    User is already authenticated at this point.
    '''
    if request.method == 'POST':
        user_id = request.form['user_token']
        channel_name = request.form['channel_name']
        cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
        cursor = cnx.cursor()
        try:
            query = ("""INSERT into channels (channel_name, owner_id) \
                VALUES (%s, %s)""")
            cursor.execute(query, (channel_name, int(user_id)))
            cnx.commit()
            return {
                "channel_name": channel_name,
            }, 200
        except mysql.connector.Error as err:
            print(err)
            return {
                "message": ("{}".format(err))
            }, 400    
        finally:
            cursor.close()
            cnx.close()

    elif request.method == 'GET': 
        user_id = request.args.get('user_id')
        cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
        cursor = cnx.cursor()
        try: #update lastread table with any new users/channels
            query = ("""INSERT INTO lastread (user_id, channel_name) 
                SELECT u.id, c.channel_name FROM users AS u, channels AS c 
                WHERE NOT EXISTS 
                (SELECT * FROM lastread WHERE lastread.user_id=u.id AND 
                lastread.channel_name=c.channel_name LIMIT 1)""")
            cursor.execute(query)
            cnx.commit()
        except mysql.connector.Error as err:
            print(err)
            return {
                "message": ("{}".format(err))
            }, 400    

        try: #get channels and unread counts for every channel, for current user
            query = ("""SELECT c.id, c.channel_name, c.owner_id, u.unread_count
                        FROM channels AS c
                        LEFT JOIN 
                        (SELECT m.channel_name, count(*) AS unread_count 
                        FROM lastread AS l RIGHT JOIN messages AS m 
                        ON m.channel_name = l.channel_name 
                        WHERE l.user_id = %(user_id)s 
                        AND m.message_id > l.last_read_message_id 
                        AND m.replies_to IS NULL 
                        GROUP BY m.channel_name) AS u ON c.channel_name = u.channel_name""")
            cursor.execute(query, { 'user_id': user_id })
            channel_list = [row for row in cursor]
            return {
                "channels": channel_list 
            }, 200
        except mysql.connector.Error as err:
            print(err)
            return {
                "message": ("{}".format(err))
            }, 400    
        finally:
            cursor.close()
            cnx.close()

@app.route('/api/messages', methods=['GET', 'POST'])
def messages():
    '''
    Posts a message to a channel or reply thread or gets existing messages already saved in it.
    User is already authenticated at this point.
    '''
    if request.method == 'POST': #take chat_id, user token and message as inputs
        channel_name = request.form['channel_name'] 
        replies_to = request.form['replies_to']
        user_id = request.form['user_token'] 
        body = request.form['body'] 
        author = ""
        current_time = datetime.now()
        if replies_to == "":
            replies_to = None

        cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
        cursor = cnx.cursor()
        query = "SELECT display_name FROM users WHERE users.id = %(id_no)s"
        cursor.execute(query, { 'id_no': user_id })
        author = cursor.fetchone()[0]
        try:
            query = ("""INSERT into messages 
                        (channel_name, replies_to, sent_date, user_id, author, body) 
                        VALUES (%s, %s, %s, %s, %s, %s)""")
            cursor.execute(query, (channel_name, replies_to, current_time, int(user_id), author, body))
            emp_no = cursor.lastrowid
            cnx.commit()
        except mysql.connector.Error as err:
            print(err)
            return {
                "message": ("{}".format(err))
            }, 400   

        try: #update lastread with new message id
            query = ("""UPDATE lastread 
                        SET last_read_message_id = %s
                        WHERE user_id = %s AND channel_name = %s""")
            cursor.execute(query, (int(emp_no), int(user_id), channel_name))
            cnx.commit()
            return {}, 200
        except mysql.connector.Error as err:
            print(err)
            return {
                "message": ("{}".format(err))
            }, 400   
        finally:
            cursor.close()
            cnx.close()
        
    elif request.method == 'GET': #load and display page messages if authenticated
        channel_name = request.args.get('channel_name')
        user_id = request.args.get('user_id')
        cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
        cursor = cnx.cursor()
        try:
            query = ("""
                SELECT m.message_id, m.channel_name, m.replies_to, m.sent_date, m.user_id, 
                    m.author, m.body, c.count, u.unread_count
                FROM
                    messages AS m
                LEFT JOIN
                    (SELECT l.last_read_message_id, l.channel_name, count(*) AS unread_count 
                    FROM lastread AS l RIGHT JOIN messages AS m ON m.channel_name = l.channel_name
                    WHERE l.user_id = %(user_id)s 
                    AND l.channel_name = %(channel_name)s 
                    AND m.message_id > l.last_read_message_id 
                    AND m.replies_to IS NULL 
                    GROUP BY l.last_read_message_id) 
                    AS u ON m.channel_name = u.channel_name
                LEFT JOIN
                    (SELECT replies_to, count(*) AS count FROM messages WHERE channel_name = 
                    %(channel_name)s AND replies_to IS NOT NULL GROUP BY replies_to)
                    AS c ON m.message_id = c.replies_to WHERE m.channel_name = %(channel_name)s 
                    AND m.replies_to IS NULL""")

            cursor.execute(query, { 'user_id': user_id,'channel_name': channel_name })
            messages = [row for row in cursor]
            return {
                "channel_name": channel_name, #to display
                "messages": messages 
            }, 200
        except mysql.connector.Error as err:
            print(err)
            return {
                "message": ("{}".format(err))
            }, 400    
        finally:
            cursor.close()
            cnx.close()

@app.route('/api/update_lastread', methods=['GET','POST'])
def last_read ():
    '''
    Updates lastread table in mysql with the last read message id if it is greater
    than what is already stored in the table.
    '''
    if request.method == 'POST':
        user_id = request.form['user_id'] 
        channel_name = request.form['channel_name'] 
        new_read_message_id = request.form['last_message_id']
        cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
        cursor = cnx.cursor()
        try:
            query = ("""UPDATE lastread 
                        SET last_read_message_id = GREATEST(last_read_message_id, %s) 
                        WHERE user_id = %s AND channel_name = %s""")
            cursor.execute(query, (int(new_read_message_id), int(user_id), channel_name))
            cnx.commit()
            return {
                "message": "updated", 
            }, 200
        except mysql.connector.Error as err:
            print(err)
            return {
                "message": ("{}".format(err))
            }, 400    
        finally:
            cursor.close()
            cnx.close()

@app.route('/api/messages_replies', methods=['GET'])
def messages_replies():
    '''
    Gets threaded replies to a given message.
    '''
    channel_name = request.args.get('channel_name')
    root_id = request.args.get('root_id')
    cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
    cursor = cnx.cursor()
    try:
        query = ("""SELECT * FROM messages WHERE channel_name = %(channel_name)s \
            AND replies_to = %(root_id)s ORDER BY message_id""")
        cursor.execute(query, { 'channel_name': channel_name, 'root_id': root_id })
        messages = [row for row in cursor]
        return {
            "messages": messages 
        }, 200
    except mysql.connector.Error as err:
        print(err)
        return {
            "message": ("{}".format(err))
        }, 400    
    finally:
        cursor.close()
        cnx.close()

@app.route('/api/delete_channel', methods=['POST'])
def delete_channel():
    '''
    Deletes channel and all messages in that channel.
    '''
    if request.method == 'POST':
        channel_name = request.form['channel_name'] 
        user_id = request.form['user_id'] 
        print(user_id)
        cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASS, host=DB_HOST, database=DB_NAME)
        cursor = cnx.cursor()

        cursor.execute("SELECT owner_id from channels WHERE channel_name = %s", [channel_name])
        return_vars = cursor.fetchone()[0]
        print(return_vars)

        if int(return_vars) == int(user_id): 
            try:
                query = ("""DELETE FROM channels
                            WHERE channel_name = %(channel_name)s""")
                cursor.execute(query, { 'channel_name': channel_name })
                cnx.commit()
                return {
                    "message": "deleted channel", 
                }, 200
            except mysql.connector.Error as err:
                print(err)
                return {
                    "message": ("{}".format(err))
                }, 400    
        else:
            return {
                "message": "Not channel owner, not authorized to delete channel.", 
            }, 400

        cursor.close()
        cnx.close()

