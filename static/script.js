//Clear local storage ----------------------------------------------------------------------------
var clearLocalStorage = document.getElementById('clear-storage');
clearLocalStorage.addEventListener('click', function(event) {
  localStorage.clear();
  console.log("cleared");
}); 

//Splash screen ----------------------------------------------------------------------------------
function splash() {
  setTimeout(showPage, 500);
}

function showPage() {
  document.getElementById("loader").style.display = "none";
}

//Check location whenever there is a pushState and check location upon first load ----------------
var pushState = history.pushState;  
history.pushState = function(state) {  
    if (typeof history.onpushstate == "function") {  
        history.onpushstate({state: state});  
    }  
    pushState.apply(history, arguments);  
    $( document ).ready(function() {
      checkLocation();
    });
}  
$( document ).ready(function() {
  checkLocation();
});

var x = window.matchMedia("(max-width: 700px)")

//Checking where the user is and display parts of page accordingly --------------------------------
function checkLocation() {
  splash();
  console.log("check location");
  var path = window.location.href;
  var chatContainer = document.getElementById("chat-container"); //chat box
  var createContainer = document.getElementById("create-chat-container");
  $('#reply-container').hide();
  console.log(localStorage);
  if (path == "http://127.0.0.1:5000/") {
    $('#create-chat-container').show(200);
    $('#chat-container').hide();
    if (localStorage.getItem('user_token') == null) { //if there is no session token, redirect to home page
      $('#modalRegisterForm').modal('show');
    } else {
      document.getElementById('welcome-username').innerHTML = "<i>Hi</i> "+localStorage.getItem('username');
      document.getElementById('welcome-email').innerHTML = "<i>Email</i> "+localStorage.getItem('email');
      window.startChannelInterval = setInterval(function(){ getChannels() }, 1000);
    }
  } else if (path.match(/\/reset/)) { //if url contains a magic link
    var magic_key = /magic_key=(.*)/.exec(path)[1];
    $('#modalPasswordResetFormFinal').modal('show');
    resetPassword(magic_key);
  } else if (path.match(/\/chat\/[A-Za-z0-9\_]+/)) { //if url contains "/chat/<channel_name>"
    document.getElementById('welcome-username').innerHTML = "<i>Hi</i> "+localStorage.getItem('username');
    document.getElementById('welcome-email').innerHTML = "<i>Email</i> "+localStorage.getItem('email');
    var channel_name = /chat\/([A-Za-z0-9\_]+)/.exec(path)[1];
    $('#chat-container').show(400);
    if (localStorage.getItem('user_token') == null) { //if there is no session token, redirect to home page
      alert("Not logged in...redirecting to home page.")
      window.history.pushState({}, {}, "http://127.0.0.1:5000/");
    } else { //if there is a session token
      console.log("getting messages")
      var delete_str = '<a class="delete-now" id="'+channel_name+'" href="#">delete chat</a>';
      document.getElementById("delete-chat").innerHTML = ""; //empty div
      $( '.delete-chat' ).append(delete_str);
      var user_token = localStorage.getItem('user_token');

      if (window.startChannelInterval === undefined) { //if channel not loading already
        window.startChannelInterval = setInterval(function(){ getChannels() }, 1000);
      } else {
        clearInterval(window.startChannelInterval);
        window.startChannelInterval = setInterval(function(){ getChannels() }, 1000);
      }

      if (window.startChatInterval === undefined) { //if messages not loading already
        window.startChatInterval = setInterval(function(){ getMessages(channel_name) }, 1000);
      } else {
        clearInterval(window.startChatInterval);
        window.startChatInterval = setInterval(function(){ getMessages(channel_name) }, 1000);
      }
    }
  }
}

document.getElementById('login-button').addEventListener('click', function(event) {
  $('#modalRegisterForm').modal('show');
  event.preventDefault();
});

//Create a new user -------------------------------------------------------------------------------
var signUp = document.getElementById('signup');
var signUpForm = document.getElementById('signup_form');

signUp.addEventListener('click', function(event) {
  var headers = new Headers();
  headers.set('Accept', 'application/json');

  var createFormData = new FormData();
  for (var i = 0; i < signUpForm.length; ++i) {
    if (signUpForm[i].value == "") {
      document.getElementById('emptyfield').style.visibility = "visible";  
      return false;
    }
    createFormData.append(signUpForm[i].name, signUpForm[i].value);
  }
  if ('user_token' in localStorage) {
    createFormData.append('user_token', localStorage.getItem('user_token'));
  } 

  fetch('http://127.0.0.1:5000/api/update_user', {
    method: 'POST',
    headers: headers,
    body: createFormData
  }).then(function(response) {
      if(response.status === 200) {
        response.json().then(function(data) {
          var username = data.username;
          var email = data.email;
          var user_token = data.user_token;
          localStorage.setItem('username', username); 
          localStorage.setItem('email', email); 
          localStorage.setItem('user_token', user_token); 
          console.log(username);
          console.log(email);
          console.log(user_token);
          $('#modalRegisterForm').modal('hide');
          document.getElementById('welcome-username').innerHTML = "<i>Hi</i> "+localStorage.getItem('username');
          document.getElementById('welcome-email').innerHTML = "<i>Email</i> "+localStorage.getItem('email');
          window.startChannelInterval = setInterval(function(){ getChannels() }, 1000);
        });
      } else {
        response.json().then(function(data) {
          console.log(data.message);
          alert(data.message);
        });
      } 
  });
  signUpForm.reset();
  event.preventDefault();
});

//Change user info -------------------------------------------------------------------------------
var changeUsername = document.getElementById('change-username');
var changeEmail = document.getElementById('change-email');

changeUsername.addEventListener('click', function(event) {
  document.getElementById('change-variable').innerHTML = "Username change";
  document.getElementById('change-variable-label').innerHTML = "Enter a new username";
  $('#modalVariableChangeForm').modal('show');

  document.getElementById('changeVariableSubmit').addEventListener('click', function(event) {
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var changeForm = document.getElementById('variableChangeForm');
    var changeFormData = new FormData();
    for (var i = 0; i < changeForm.length; ++i) {
      if (changeForm[i].value == "") {
        alert("Fill in all form fields.");  
        return false;
      }
      changeFormData.append(changeForm[i].name, changeForm[i].value);
    }
    changeFormData.append('user_token', localStorage.getItem('user_token'));
    changeFormData.append('update_username', 'yes'); 

    fetch('http://127.0.0.1:5000/api/update_user', {
      method: 'POST',
      headers: headers,
      body: changeFormData
    }).then(function(response) {
        if(response.status === 200) {
          response.json().then(function(data) {
            var username = data.username;
            localStorage.setItem('username', username);
            document.getElementById('welcome-username').innerHTML = "<i>Hi</i> "+localStorage.getItem('username');
            console.log("new username: "+username);
            changeForm.reset();
            $('#modalVariableChangeForm').modal('hide');
          });
        } else {
          response.json().then(function(data) {
            console.log(data.message);
            alert(data.message);
            changeForm.reset();
          });
        } 
    });
  });
  event.preventDefault();
});

changeEmail.addEventListener('click', function(event) {
  document.getElementById('change-variable').innerHTML = "Email change";
  document.getElementById('change-variable-label').innerHTML = "Enter a new email";
  $('#modalVariableChangeForm').modal('show');

  document.getElementById('changeVariableSubmit').addEventListener('click', function(event) {
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var changeForm = document.getElementById('variableChangeForm');
    var changeFormData = new FormData();
    for (var i = 0; i < changeForm.length; ++i) {
      if (changeForm[i].value == "") {
        alert("Fill in all form fields.");  
        return false;
      }
      changeFormData.append(changeForm[i].name, changeForm[i].value);
    }
    changeFormData.append('user_token', localStorage.getItem('user_token'));
    changeFormData.append('update_email', 'yes'); 

    fetch('http://127.0.0.1:5000/api/update_user', {
      method: 'POST',
      headers: headers,
      body: changeFormData
    }).then(function(response) {
        if(response.status === 200) {
          response.json().then(function(data) {
            var email = data.email;
            localStorage.setItem('email', email);
            document.getElementById('welcome-email').innerHTML = "<i>Email</i> "+localStorage.getItem('email');
            console.log("new email: "+email);
            changeForm.reset();
            $('#modalVariableChangeForm').modal('hide');
          });
        } else {
          response.json().then(function(data) {
            console.log(data.message);
            alert(data.message);
            changeForm.reset();
          });
        } 
    });
  });
  event.preventDefault();
});

//Create a new chat -------------------------------------------------------------------------------
var createForm = document.getElementById('create_chat_form');

createForm.addEventListener('submit', function(event) {
  var headers = new Headers();
  headers.set('Accept', 'application/json');

  var channel_name = prompt("Please enter a channel name (only numbers, letters, and underscores allowed).", "");
  while (channel_name == "" || !/[^0-9A-Za-z_]/.test(channel_name) == false ) {
    var channel_name = prompt("Invalid. Please enter a valid channel name (only numbers, letters, and underscores allowed).", "");
  }

  if (channel_name != null) {
    var createFormData = new FormData();
    createFormData.append('user_token', localStorage.getItem('user_token')); //owner
    createFormData.append('channel_name', channel_name);

    fetch('http://127.0.0.1:5000/api/channels', {
      method: 'POST',
      headers: headers,
      body: createFormData
    }).then(function(response) {
        if(response.status === 200) {
          response.json().then(function(data) {
            var channel_name = data.channel_name;
            document.getElementById('channel_name').innerHTML = 'Channel Name: '+ channel_name;
            window.history.pushState({}, {}, "http://127.0.0.1:5000/chat/"+channel_name);
          });
        } else {
          response.json().then(function(data) {
            console.log(data.message);
            alert(data.message);
          });
        } 
    });
  }
  createForm.reset();
  event.preventDefault();
});

//Forgot password ---------------------------------------------------------------------------
var forgotPassword = document.getElementById('forgot_password');

forgotPassword.addEventListener('click', function(event) {
  $('#modalRegisterForm').modal('hide');
  $('#modalPasswordResetForm').modal('show');

  document.getElementById('passwordResetSubmit').addEventListener('click', function(event) {
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var changePasswordForm = document.getElementById('passwordResetForm');

    var changePasswordFormData = new FormData();
    for (var i = 0; i < changePasswordForm.length; ++i) {
      if (changePasswordForm[i].value == "") {
        alert("Fill in all form fields.");   
        return false;
      }
      changePasswordFormData.append(changePasswordForm[i].name, changePasswordForm[i].value);
    }

    fetch('http://127.0.0.1:5000/api/send_email', {
      method: 'POST',
      headers: headers,
      body: changePasswordFormData
    }).then(function(response) {
        if(response.status === 200) {
          response.json().then(function(data) {
            console.log(data.message)
            changePasswordForm.reset();
            $('#modalPasswordResetForm').modal('hide');
          });
        } else {
          response.json().then(function(data) {
            console.log(data.message);
            alert(data.message);
            changePasswordForm.reset();
          });
        } 
    });
  });
  event.preventDefault();
});

$('#passwordResetForm input').keypress(function (e) {
  return e.keyCode !== 13;
});

//Reset password ---------------------------------------------------------------------------
var resetPasswordSubmit = document.getElementById('passwordResetSubmitFinal');

function resetPassword(magic_key) {
  resetPasswordSubmit.addEventListener('click', function(event) {
    var headers = new Headers();
    headers.set('Accept', 'application/json');
    var resetPasswordForm = document.getElementById('passwordResetFormFinal');

    var resetPasswordFormData = new FormData();
    for (var i = 0; i < resetPasswordForm.length; ++i) {
      if (resetPasswordForm[i].value == "") {
        alert("Fill in all form fields.");  
        return false;
      }
      resetPasswordFormData.append(resetPasswordForm[i].name, resetPasswordForm[i].value);
    }
    resetPasswordFormData.append('magic_key', magic_key);
    resetPasswordFormData.append('update_password', 'yes');

    fetch('http://127.0.0.1:5000/api/update_user', {
      method: 'POST',
      headers: headers,
      body: resetPasswordFormData
    }).then(function(response) {
        if(response.status === 200) {
          response.json().then(function(data) {
            console.log(data.message)
            window.history.pushState({}, {}, "http://127.0.0.1:5000/") 
          });
        } else {
          response.json().then(function(data) {
            console.log(data.message);
            alert(data.message);
            window.history.pushState({}, {}, "http://127.0.0.1:5000/") 
          });
        } 
    });
    resetPasswordForm.reset();
    $('#modalPasswordResetFormFinal').modal('hide');
    event.preventDefault();
  });
}
  
$('#passwordResetFormFinal input').keypress(function (e) {
  return e.keyCode !== 13;
});

//Get all existing channels -----------------------------------------------------------------
function getChannels() {
  var getUrl = 'http://127.0.0.1:5000/api/channels?user_id='+localStorage.getItem('user_token');
  var headers = new Headers();
  headers.set('Accept', 'application/json');
  
  fetch(getUrl, {
    method: 'GET',
    headers: headers
  }).then(function(response) {
      if(response.status === 200) {
        response.json().then(function(data) {
          var channels = data.channels;
          var length = channels.length;
          document.getElementById("menu-main-menu").innerHTML = ""; //empty div
          if (length > 0) {
            for (index = 0; index < length; index++) { 
              var channel_name = channels[index][1];
              var channel_count = channels[index][3];
              
              if (channel_count > 0) {
                var href = "http://127.0.0.1:5000/chat/"+channel_name
                var substring = '<li class="nav-item active"><a class="nav-link active channel_link" id="v-pills-'+channel_name+
                  '" data-toggle="pill" onClick="channel_click(this.id)" href='+href+' role="tab" aria-controls="v-pills-' + channel_name +
                  '" aria-selected="true">'+'<span class="badge badge-pill badge-light">'+
                  String(channel_count)+'</span>'+channel_name+'</a></li>'
                $( '.channel_list' ).append(substring);
              } else {
                var href = "http://127.0.0.1:5000/chat/"+channel_name
                var substring = '<li class="nav-item active"><a class="nav-link active channel_link" id="v-pills-'+channel_name+
                  '" data-toggle="pill" onClick="channel_click(this.id)" href='+href+' role="tab" aria-controls="v-pills-' + channel_name +
                  '" aria-selected="true">'+channel_name+'</a></li>'
                $( '.channel_list' ).append(substring);
              }
            } 
          };
        });
      } else {
        response.json().then(function(data) {
          clearInterval(window.startChannelInterval);
          console.log(data.message);
          alert(data.message);
          window.history.pushState({}, {}, "http://127.0.0.1:5000/");
        });
      } 
  });
}

function channel_click(clicked_id) {
  clearInterval(window.startChatInterval);
  clearInterval(window.startChannelInterval);
  var channel_link = document.getElementById(clicked_id);
  window.history.pushState({}, {}, channel_link.href);
}

//Delete chat --------------------------------------------------------------------------------------
$(document).on("click", ".delete-now", function(event) {
  event.preventDefault();
  console.log("deleting");
  console.log(this.id);
  delete_click(this.id);
});

function delete_click(clicked_id) { //clicked id here is the channel name
  var headers = new Headers();
  headers.set('Accept', 'application/json');
  var deleteData = new FormData();
  deleteData.append('channel_name', clicked_id); 
  deleteData.append('user_id', localStorage.getItem('user_token'))

  fetch('http://127.0.0.1:5000/api/delete_channel', {
    method: 'POST',
    headers: headers,
    body: deleteData
  }).then(function(response) {
      if(response.status === 200) {
        response.json().then(function(data) {
          console.log(data.message);
          alert("Chat successfully deleted!")
          window.history.pushState({}, {}, "http://127.0.0.1:5000/"); 
        });
      } else {
        response.json().then(function(data) {
          alert(data.message);
          console.log(data.message);
        });
      } 
  });
}

//Get all existing chat messages -----------------------------------------------------------------
function getMessages(channel_name) {
  var getUrl = 'http://127.0.0.1:5000/api/messages?channel_name='+channel_name+
  '&user_id='+localStorage.getItem('user_token');

  var headers = new Headers();
  headers.set('Accept', 'application/json');

  fetch(getUrl, {
    method: 'GET',
    headers: headers
  }).then(function(response) {
      if(response.status === 200) {
        response.json().then(function(data) {
          var messages = data.messages;
          var length = messages.length;
          document.getElementById('channel_name').innerHTML = 'Channel name: '+ channel_name;
          document.getElementById("message_holder").innerHTML = ""; //empty div
          
          if (length > 0) { //if not empty, get and display all messages
            var unread_count = messages[0][8];
            for (index = 0; index < length; index++) { 
              var reply_count = messages[index][7];
              if (reply_count != null) {
                $( 'div.message_holder' ).append( '<div class="message-div" id="message-'+messages[index][0]+
                  '"><button type="button" class="btn btn-secondary btn-sm reply-button" '+
                  'id="'+messages[index][0]+
                  '" onClick="reply_click(this.id)"'+
                  '>reply: '+reply_count+'</button><b style="color: #000">'+
                  messages[index][5]+'</b> '+messages[index][6]+'</div>')
              } else {
                $( 'div.message_holder' ).append( '<div class="message-div" id="message-'+messages[index][0]+
                  '"><button type="button" class="btn btn-secondary btn-sm reply-button" '+
                  'id="'+messages[index][0]+
                  '" onClick="reply_click(this.id)"'+
                  '>reply</button><b style="color: #000">'+
                  messages[index][5]+'</b> '+messages[index][6]+'</div>')
              }
            }
            if (unread_count > 0) {
              document.getElementById('toast-body-text').innerHTML = String(unread_count) + " new message(s), click to view."
              $('.toast').toast('show');
            }
            if (window.location.href.match(/\/thread/)) {
              if (x.matches) { // If responsive media query matches      
                $('#chat-container').hide();
                $('#return-to-chat').show(); //show return to chat button
              } else {
                $('#return-to-chat').hide();
              }
              console.log("getting replies")
              $('#reply-container').show();
              var clicked_id = /chat\/[A-Za-z0-9\_]+\/thread\/([0-9]+)/.exec(window.location.href)[1];
              var reply_message = document.getElementById('reply_message_holder_root');
              var message_body_id = document.getElementById("message-"+clicked_id);
              reply_message.innerHTML = message_body_id.innerHTML;
              $('#reply_message_holder_root .reply-button').hide();
              document.getElementById('reply_replies_to').value = clicked_id;
              getReplies(clicked_id);
            } else {
              $('#reply-container').hide();
            }
          };       
        });
      } else {
        response.json().then(function(data) {
          clearInterval(window.startChatInterval);
          console.log(data.message);
          alert(data.message);
          window.history.pushState({}, {}, "http://127.0.0.1:5000/");
        });
      } 
  });
  //Update last read message if no scroll bar
  var elem = $(".message_holder");
  var scroll = $(window).scrollTop() + $(window).height();
  var offset = elem.offset().top + elem.height();
  if ( scroll >= offset ) {
    $('.toast').toast('hide');
    var last_div_message_id = $('.message_holder').children().last().attr('id');
    if (last_div_message_id != null) { //if chat is not empty, we make a potential update
      const regex = /message-(\d+)/i;
      var last_message_id = last_div_message_id.match(regex)[1];
      var channel_name = /chat\/([A-Za-z0-9\_]+)/.exec(window.location.href)[1]; 
      var headers = new Headers();
      headers.set('Accept', 'application/json');

      var lastReadData = new FormData();
      lastReadData.append('user_id', localStorage.getItem('user_token')); 
      lastReadData.append('channel_name', channel_name); 
      lastReadData.append('last_message_id', last_message_id); 

      fetch('http://127.0.0.1:5000/api/update_lastread', {
        method: 'POST',
        headers: headers,
        body: lastReadData
      }).then(function(response) {
          if(response.status === 200) {
            response.json().then(function(data) {
              console.log("update sent");
            });
          } else {
            response.json().then(function(data) {
              console.log(data.message);
            });
          } 
      });
    }
  } 
}

//Scroll to bottom of page ----------------------------------------------------------------------------
function viewNewMessages() {
  console.log("scrolling");
  window.scrollTo(0,document.body.scrollHeight); 
  $('.toast').toast('hide');
}

//Get all replies for a given message -----------------------------------------------------------------
function getReplies(root_id) {
  var current_id = /chat\/[A-Za-z0-9\_]+\/thread\/([0-9]+)/.exec(window.location.href)[1];
  var channel_name = /chat\/([A-Za-z0-9\_]+)/.exec(window.location.href)[1];
  var getUrl = 'http://127.0.0.1:5000/api/messages_replies?channel_name='+channel_name+'&root_id='+root_id;

  var headers = new Headers();
  headers.set('Accept', 'application/json');
  
  fetch(getUrl, {
    method: 'GET',
    headers: headers
  }).then(function(response) {
      if(response.status === 200) {
        response.json().then(function(data) {
          var messages = data.messages;
          var length = messages.length;
          document.getElementById('channel_name').innerHTML = 'Channel name: '+ channel_name;
          document.getElementById("reply_message_holder").innerHTML = ""; //empty div

          if (length > 0) { //if not empty, get and display all messages
            for (index = 0; index < length; index++) { 
              $( '#reply_message_holder' ).append( '<div id="message-'+messages[index][0]+
                '"><b style="color: #000">'+
                messages[index][5]+'</b> '+messages[index][6]+'</div>')
            } 
          };       
        });
        if (root_id == current_id) {
          getReplies(current_id);
        }
      } else {
        response.json().then(function(data) {
          console.log(data.message);
          alert(data.message);
          window.history.pushState({}, {}, "http://127.0.0.1:5000/");
        });
      } 
  });
}

//Post message in chat ---------------------------------------------------------------------------
var createMessage = document.getElementById('send_message');

createMessage.addEventListener('submit', function(event) {
  event.preventDefault();
  var headers = new Headers();
  headers.set('Accept', 'application/json');

  var channel_name = /chat\/([A-Za-z0-9\_]+)/.exec(window.location.href)[1];
  var createMessageData = new FormData();
  for (var i = 0; i < createMessage.length - 1; ++i) {
    createMessageData.append(createMessage[i].name, createMessage[i].value);
  }
  createMessageData.append('user_token', localStorage.getItem('user_token')); 
  createMessageData.append('channel_name', channel_name); 
  document.getElementById("message").value = ""; //empty input field

  //validate body and check for image urls
  var body = createMessageData.get('body');
  const regex = /(?:https?|ftp):\/\/.*(?:apng|bmp|gif|ico|cur|jpg|jpeg|jfif|pjpeg|pjp|png|svg|tif|tiff|webp|png)/i;
  var matches = body.match(regex);
  var newBody = body.replace(regex, '')
  if (matches != null && matches.length > 0) {
    for (index = 0; index < matches.length; index++) { 
      var input = ' <img style="height: 100%; width: 100%; object-fit: contain" src="'+
      matches[index]+'" alt="user image">'
      var newBody = newBody+input;
    } 
  }
  createMessageData.set('body', newBody);

  fetch('http://127.0.0.1:5000/api/messages', {
    method: 'POST',
    headers: headers,
    body: createMessageData
  }).then(function(response) {
      if(response.status === 200) {
        console.log("message submitted");
        viewNewMessages(); //scroll to bottom
      } else {
        response.json().then(function(data) {
          console.log(data.message);
        });
      } 
  });
});

//Post message in thread (reply) --------------------------------------------------------------------
var createReply = document.getElementById('send_reply');

createReply.addEventListener('submit', function(event) {
  var headers = new Headers();
  headers.set('Accept', 'application/json');

  var channel_name = /chat\/([A-Za-z0-9\_]+)/.exec(window.location.href)[1];
  var createMessageData = new FormData();
  for (var i = 0; i < createReply.length - 1; ++i) {
    createMessageData.append(createReply[i].name, createReply[i].value);
  }
  createMessageData.append('user_token', localStorage.getItem('user_token')); 
  createMessageData.append('channel_name', channel_name); 
  document.getElementById("message-replies").value = ""; //empty input field

  //validate body and check for image urls
  var body = createMessageData.get('body');
  const regex = /(?:https?|ftp):\/\/.*(?:apng|bmp|gif|ico|cur|jpg|jpeg|jfif|pjpeg|pjp|png|svg|tif|tiff|webp|png)/i;
  var matches = body.match(regex);
  var newBody = body.replace(regex, '')
  if (matches != null && matches.length > 0) {
    for (index = 0; index < matches.length; index++) { 
      var input = ' <img style="height: 100%; width: 100%; object-fit: contain" src="'+
      matches[index]+'" alt="user image">'
      var newBody = newBody+input;
    } 
  }
  createMessageData.set('body', newBody);

  fetch('http://127.0.0.1:5000/api/messages', {
    method: 'POST',
    headers: headers,
    body: createMessageData
  }).then(function(response) {
      if(response.status === 200) {
        response.json().then(function(data) {
          console.log("reply submitted");
        });
      } else {
        response.json().then(function(data) {
          console.log(data.message);
        });
      } 
  });
  event.preventDefault();
});

//Check if a message is in view --------------------------------------------------------------------
$(document).ready(function() {
  $(document).on("scroll", function() {
    var elem = $(".message_holder");
    var scroll = $(window).scrollTop() + $(window).height();
    var offset = elem.offset().top + elem.height();
    if (scroll > offset) {
      console.log("at bottom");
      $('.toast').toast('hide');
      var last_div_message_id = $('.message_holder').children().last().attr('id');
      if (last_div_message_id != null) { //if chat is not empty, we make a potential update
        const regex = /message-(\d+)/i;
        var last_message_id = last_div_message_id.match(regex)[1];
        var channel_name = /chat\/([A-Za-z0-9\_]+)/.exec(window.location.href)[1]; 
        var headers = new Headers();
        headers.set('Accept', 'application/json');

        var lastReadData = new FormData();
        lastReadData.append('user_id', localStorage.getItem('user_token')); 
        lastReadData.append('channel_name', channel_name); 
        lastReadData.append('last_message_id', last_message_id); 

        fetch('http://127.0.0.1:5000/api/update_lastread', {
          method: 'POST',
          headers: headers,
          body: lastReadData
        }).then(function(response) {
            if(response.status === 200) {
              response.json().then(function(data) {
                console.log("update sent");
              });
            } else {
              response.json().then(function(data) {
                console.log(data.message);
              });
            } 
        });
      }
    }
  });
});

//Display reply thread for a given message responsively ---------------------------------------------
function reply_click(clicked_id) {
  if (window.location.href.match(/\/thread/)) { //if reply box open
    var channel_name = /chat\/([A-Za-z0-9\_]+)\/thread\/.*/.exec(window.location.href)[1];
    window.history.pushState({}, {}, "http://127.0.0.1:5000/chat/"+channel_name);
  } else { //if reply box closed
    var channel_name = /chat\/([A-Za-z0-9\_]+)/.exec(window.location.href)[1];
    window.history.pushState({}, {}, "http://127.0.0.1:5000/chat/"+channel_name+"/thread/"+clicked_id); 
  }
}

function return_click() {
  var channel_name = /chat\/([A-Za-z0-9\_]+)\/thread\/.*/.exec(window.location.href)[1];
  console.log(channel_name);
  window.history.pushState({}, {}, "http://127.0.0.1:5000/chat/"+channel_name);
  $('#reply-container').hide(); 
  $('#chat-container').show();
  $('#return-to-chat').hide(); //hide return to chat button
}
 
jQuery(window).resize(function() { 
  if (jQuery(window).width() < 700 && $('#reply-container').is(":visible")) {
    $('#chat-container').hide();
    $('#return-to-chat').show(); //show return to chat button
  } else {
    $('#return-to-chat').hide(); //hide return to chat button
    $('#chat-container').show();
  }
});
