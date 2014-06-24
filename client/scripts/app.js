// YOUR CODE HERE:
// var message = {
// //   username: results.username,
// //   text: results.text,
// //   roomname: results.roomname,
// //   createdAt: results.createdAt
// // };
//
//
//Additional lines for merge
var xssAttack = function(str) {
  var a = /([.?*+^$[\]'"\\(){}<>|-])/g;
  return a.test(str);
};

var app = {
  server: 'http://127.0.0.1:3000/classes/messages',
  currentRoom: 'hr',
  rooms: [],
  friends: [],
  init: function(){
    $('button').on('click', function() {
      var userText = $('.submitText').val();
      if(userText !== '') {
        app.handleSubmit(userText);
      }
    });
    app.fetch();
    setInterval(function(){
      app.fetch();
    }, 1000);
  },
  send: function(message) {
    $.ajax({
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      //createdAt:
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  },
  fetch: function() {
    $.ajax({
      url: this.server,
      type: 'GET',
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Messages received');
        var newData = JSON.parse(data);
        var results = newData.results;
        app.clearMessages();
        app.rooms = _.filter(_.uniq(_.pluck(results, 'roomname')), function(room){
          if (room !== undefined){
            return room;
          }
        });
        if (app.currentRoom) {
          results = _.where(results, {roomname: app.currentRoom});
        }
        for ( var i = 0; i < results.length; i++) {
          if (!xssAttack(results[i].text)){
            app.addMessage(results[i]);
          }
        }
      },
      error: function (data) {
        console.log('error on send');
        console.error('chatterbox: Failed to send message');
      },
      complete: function() {
          app.manageFriend();
          app.makeRooms();
          app.renderRoom();
          app.checkFriendClass();
        }
    });
  },
  clearMessages: function() {
    $('#chats').empty();
    $('#roomSelect').empty();
  },
  addMessage: function(message) {
    var $msg = $('<div></div>').addClass('chat').data('username', message.username);
    $('<h3>' + message.username + '</h3>').addClass('username').prependTo($msg);
    $('<p>' + message.text + ' in ' + message.roomname + '</p>').appendTo($msg);
    $msg.appendTo('#chats');
  },
  makeRooms: function() {
   _.each(app.rooms, function(room){
     $('<li>' + room + '</li>').addClass('room').appendTo($('#roomSelect'));
   });
  },
  renderRoom: function() {
    $('.room').on('click', function() {
      app.currentRoom = ($(this).text());
      app.fetch();
    });
  },
  addRoom: function(roomName) {
    var $room = $('<div>'+ roomName + '</div>').addClass('room');
    $room.appendTo('#roomSelect');
    app.rooms.push(roomName);
  },
  checkFriendClass: function(){
    $('#chats').find('div').each(function(int, el) {
      var $el = $(el);
      for (var i = 0; i < app.friends.length; i++) {
        if (app.friends[i] === $el.data('username')) {
          $el.addClass('friend');
        }
      }
    });
  },
  manageFriend: function() {
    $('.username').on('click', function(){
          var user = ($(this).parent().data('username'));
          $(this).parent().addClass('friend');
         // console.log($('.friend'));
          app.friends.push(user);
        });
  },
  handleSubmit: function(text){
    //XSS DEFENSE NEEDED
    var submission = {};
    submission.username = window.location.search.slice(10);
    submission.text = text;
    submission.roomname = app.currentRoom;
    app.send(submission);
  }
};
$(document).on('ready', function() {
  app.init();
});
