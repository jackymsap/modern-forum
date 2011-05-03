/*global $ document */

$(function() {
	var app, refreshThreads, $db = $.couch.db("modern-forum");
	
	refreshThreads = function () {
		$("#threads ul").empty();
		$db.view("modern-forum/threads", {
			success: function(data) {
				var i, id, title, html;
				for (i = 0; i < data.rows.length; i++) {
					id = data.rows[i].id;
					title = data.rows[i].value;
					html = '<li id="' + id + '"><a href="#/thread/' + id + '"><div class="spacer">' + title + '</div></a></li>';
					$("#threads ul").append(html);
				}
			}
		});
	}
	
	app = $.sammy('#content', function () {
		var currentThread = '';
		refreshThreads();	// later, get and pass in the forum for the threads
		
		this.get('#/', function (context) {
			$("#content").empty();
		});
		
		this.get('#/settings', function (context) {
			$("#content").empty();
		});
		
		this.get('#/user/:name', function (context) {
			$("#content").empty();
			//$("#content").append(this.params['name']);
		});
		
		this.get('#/thread/:id', function (context) {
			var that = this;
			currentThread = this.params['id'];
			$("#content").empty();
			
			// Display all the posts in the thread. Kinda hacky, as it returns ALL the 
			// posts in the database and we have to filter here.
			$db.view("modern-forum/posts", {
				success: function(data) {
					var i, id, thread_id, title, html, reply;
					reply = '<div class="reply"><form action="#/post/reply" method="put"><textarea placeholder="Type your reply here." id="replyBox" name="postContent"></textarea><br><input type="submit" value="Reply"></form></div>';
					
					for (i = 0; i < data.rows.length; i++) {
						id = data.rows[i].key;
						thread_id = data.rows[i].value.thread_id;
						user_id = data.rows[i].value.user_id;
						content = data.rows[i].value.content;
						$('#' + thread_id + " li").addClass('selectedThread');		// fix so clicking on multiple threads doesn't make them all selected...
						if (that.params['id'] == thread_id) {
							html = '<div class="post"><a href="#/user/' + user_id + '" class="user"><img src="http://i.imgur.com/arExL.png" width="120" height="120" alt="" />' + user_id + '</a><div>' + content + '</div><div class="signature"></div>';
							$("#content").append(html);
						}
					}
					$("#content").append(reply);	// later, make sure thread is not locked.
				}
			});
		});
		
		this.put('#/post/reply', function (context) {
			var postContent = this.params['postContent'], doc = {
				type: "post",
				content: postContent,
				thread_id: currentThread,
				user_id: 'Andrex',
				datetime: null
			};
			
			$db.saveDoc(doc, {
				success: function () {
					var html;
					
					$('#replyBox').val('');
					html = '<div class="post"><a href="#/user/' + 'Andrex' + '" class="user"><img src="http://i.imgur.com/arExL.png" width="120" height="120" alt="" />' + 'Andrex' + '</a><div>' + postContent + '</div><div class="signature"></div>';
					$('.post').last().after(html);
					$('input').blur();
					// Later, check if new posts were added in the meantime and add them first.
				},
				error: function () {
					alert( "Cannot save new document." );
				}
			});
		});
	});
	
	app.run('#/');
});