const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈

// 장바구니 담기
const addToCart = (req, res)=>{
    const {book_id, quantity, user_id} = req.body;

    let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?, ?, ?)`;
    let values = [book_id, quantity, user_id];
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

// 장바구니 아이템 목록 조회 / 장바구니에서 선택한 주문 예상 상품 조회
const getCartItems = (req, res)=>{
    const {user_id, selected} = req.body;   // selected = [1, 3]
    let sql = `SELECT cartItems.id, book_id, title, summary, quantity, price 
                 FROM cartItems 
            LEFT JOIN books ON books.id = cartItems.book_id 
            WHERE user_id = ?
              AND cartItems.id IN (?)`;
    let values = [user_id, selected];
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

// 장바구니 삭제
const removeCartItem = (req, res)=>{
    // const {user_id} = req.body;
    let {id} = req.params;  // cartItems.Id
    id = parseInt(id);

    let sql = `DELETE FROM cartItems WHERE id = ?`;
    // let values = [id, user_id];
    // DELETE 쿼리문
    conn.query(sql, id,
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
    addToCart,
    getCartItems,
    removeCartItem
}