// mysql 모듈 소환
const mysql = require('mysql2');  // 쿼리를 promise로 감싸기

// DB와 연결 통로 생성
// const connection = async () => {
//   const conn = await mysql.createConnection({
//     host: '127.0.0.1',
//     port: '3307',
//     user: 'root',
//     password: 'root',
//     database: 'Bookshop',
//     dateStrings: true,    // 날짜 형식대로 표기
//   });

//   return conn;
// }

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: '3307',
  user: 'root',
  password: 'root',
  database: 'Bookshop',
  dateStrings: true,    // 날짜 형식대로 표기
});

// // A simple SELECT query
// connection.query(
//   'SELECT * FROM `users`',
//   function (err, results, fields) {
//     var {id, email, name, created_at} = results[0];

//     console.log(id);
//     console.log(email);
//     console.log(name);
//     console.log(created_at);
//   }
// );

// db 모듈화
module.exports = connection;