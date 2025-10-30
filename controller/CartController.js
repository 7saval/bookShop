const ensureAuth = require('../auth');  // 인증 모듈
const jwt = require('jsonwebtoken');
const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈

// 장바구니 담기
const addToCart = (req, res)=>{
    const {book_id, quantity} = req.body;

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
        let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?, ?, ?)`;
        let values = [book_id, quantity, authorization.id];
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
}

// 장바구니 아이템 목록 조회 / 장바구니에서 선택한 주문 예상 상품 조회
const getCartItems = (req, res)=>{
    // req.body 안보내주면 빈 객체 대체해서 구조분해 안전하게 작동하도록
    const {selected} = req.body || {};   // selected = [1, 3]
    
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

        // 장바구니 보기
        let sql = `SELECT cartItems.id, book_id, title, summary, quantity, price 
                    FROM cartItems 
                LEFT JOIN books ON books.id = cartItems.book_id 
                WHERE user_id = ?`;
        let values = [authorization.id];

        if(selected){   // 주문서 작성 시 선택한 장바구니 목록 조회
            sql += ` AND cartItems.id IN (?)`;
            values.push(selected);
        }
        
        // SELECT 쿼리문
        conn.query(sql, values,
            (err, results) => {
                if(err){
                    console.log(err)
                    return res.status(StatusCodes.BAD_REQUEST).end()
                }

                res.status(StatusCodes.OK).json(results);
            }
        )
    }
}

// 장바구니 삭제
const removeCartItem = (req, res)=>{
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
        let cartItemId = req.params.id;  // cartItems.Id

        let sql = `DELETE FROM cartItems WHERE id = ?`;
        // let values = [id, user_id];
        // DELETE 쿼리문
        conn.query(sql, cartItemId,
            function (err, results) {
                if(err){
                    console.log(err)
                    return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
                }

                return res.status(StatusCodes.OK).json(results);  // 200
            }
        );
    };
}

// 인증 복호화
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
    addToCart,
    getCartItems,
    removeCartItem
}