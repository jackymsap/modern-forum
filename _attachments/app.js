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
		refreshThreads();	// later, get and pass in the forum for the threads
		
		// When the index is loaded...
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
			$("#content").empty();
			
			// Display all the posts in the thread. Kinda hacky, as it returns ALL the 
			// posts in the database and we have to filter here.
			$db.view("modern-forum/posts", {
				success: function(data) {
					var i, id, thread_id, title, html;
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
				}
			});
		});
		
		this.put('#/post/reply', function (context) {
			// Post message?
		});
	});
	
	app.run('#/');
});