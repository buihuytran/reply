var express = require("express");
/*var mysql = require("mysql");*/
var app = express();
// Tạo kết nối với Database
/*var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Qaz!@#123",
  database: "hoidap"
});*/
var date_post = Date.now();
app.use(express.static("./public"));
app.set("view engine","ejs");
app.set("views","./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(process.env.PORT ||3000);
var listuser=[];
io.on("connection",function(socket){
	///////////////////////
	socket.on("user_offline",function(){
		listuser.splice(
			listuser.indexOf(socket.username),1
		);
		socket.broadcast.emit("danhsach_username",listuser);
	});
	//console.log('co nguoi ket noi');
	socket.on("disconnect",function(){
		//console.log(socket.id+" ngat ket noi");
	});
	socket.on("check_status",function(){

	});
	setInterval(function(){
		io.sockets.emit("server_send_online",listuser);
		//console.log(listuser);
	},10000);
	////////////////////////
	socket.on("show_box_chat",function(data){
		socket.broadcast.emit("get_box_chat",data);
	});
	socket.on("user_send_chat",function(data){
		io.sockets.emit("server_send_chat",data);
	});
	socket.on("user_chating",function(data){
		io.sockets.emit("server_send_chating",data);
	});
	socket.on("user_stop_chat",function(data){
		io.sockets.emit("server_send_stop_chat",data);
	});
	socket.on("send_notice",function(data){
		io.sockets.emit("get_notice",data);
	});
	socket.on("user_online",function(data){
		info=JSON.parse(data);
		pool.getConnection(function(err, connection) {
			var sql_check = "SELECT count(*) as total FROM user_online WHERE user_id='"+info.user_online+"' AND token='"+info.token+"' ORDER BY id DESC LIMIT 1 ";
			connection.query(sql_check, function (error, ketqua, fields) {
				// And done with the connection.
				if(ketqua[0].total>0){
					socket.join(info.user_online);
					io.sockets.emit("get_user_online",data);
					io.sockets.emit("get_notice",data);
					//console.log(info.user_online);
					if(listuser.indexOf(info.user_online)>=0){
					}else{
						listuser.push(info.user_online);
						socket.username=info.user_online;
					}
					//console.log(socket.adapter.rooms);
				}else{

				}
				//console.log(ketqua[0].total);
				connection.release();
				// Handle error after the release.
				if (error) throw error;
					// Don't use the connection here, it has been returned to the pool.
			});
		});
	});
});
