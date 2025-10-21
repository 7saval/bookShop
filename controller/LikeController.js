const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈


const addLike = (req, res)=>{
    const {user_id} = req.body;
    let {id} = req.params;
    id = parseInt(id);

    // 좋아요 추가
    let sql = `INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)`;
    let values = [user_id, id];
    // INSERT 쿼리문
    conn.query(sql, values,
        function (err, results) {
            if(err){
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
            }

            return res.status(StatusCodes.CREATED).json(results);  // 201
        }
    );
}


const removeLike = (req, res)=>{
    const {user_id} = req.body;
    let {id} = req.params;
    id = parseInt(id);

    let sql = `DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?`;
    let values = [user_id, id];
    // DELETE 쿼리문
    conn.query(sql, values,
        function (err, results) {
            if(err){
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
            }

            return res.status(StatusCodes.OK).json(results);  // 200
        }
    );
}

module.exports = {
    addLike,
    removeLike
}