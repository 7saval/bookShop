const ensureAuth = require('../auth');  // 인증 모듈
const jwt = require('jsonwebtoken');
const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈

const addLike = (req, res)=>{
    let book_id = req.params.id;

    // 인증 복호화
    let authorization = ensureAuth(req, res);

    // instanceof : 객체가 어떤 클래스의 인스턴스인지 알아내기 위해 사용
    if(authorization instanceof jwt.TokenExpiredError){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인하세요."
        });
    }else if(authorization instanceof jwt.JsonWebTokenError){
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    }     
    else{
        // 좋아요 추가
        let sql = `INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)`;
        let values = [authorization.id, book_id];
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
};

const removeLike = (req, res)=>{
    let book_id = req.params.id;

    // 인증 복호화
    let authorization = ensureAuth(req, res);

    // instanceof : 객체가 어떤 클래스의 인스턴스인지 알아내기 위해 사용
    if(authorization instanceof jwt.TokenExpiredError){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인하세요."
        });
    }else if(authorization instanceof jwt.JsonWebTokenError){
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    }     
    else{
        let sql = `DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?`;
        let values = [authorization.id, book_id];
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
}

// // 인증 복호화
// function ensureAuth(req, res){
//     try {
//         let receivedJwt= req.headers["authorization"];
//         console.log("received jwt: ", receivedJwt);

//         let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
//         console.log(decodedJwt);
//         return decodedJwt;
//     } catch (err) {
//         console.log(err.name);
//         console.log(err.message);

//         return err;
//     }
// }

module.exports = {
    addLike,
    removeLike
}