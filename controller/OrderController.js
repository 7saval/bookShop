const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈

// 주문하기
const order = (req, res)=>{
    const {items, delivery, totalQuantity, totalPrice, userId, repBookTitle} = req.body;

    let delivery_id = 2;
    let order_id = 2;
    // 배송 정보
    let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
    // const delivery_id = SELECT max(id) FROM delivery;
    let values = [delivery.address, delivery.receiver, delivery.contact];
    // INSERT 쿼리문
    // conn.query(sql, values,
    //     function (err, results) {
    //         if(err){
    //             console.log(err)
    //             return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
    //         }

    //         delivery_id = results.insertId; // 생성 PK id

    //         return res.status(StatusCodes.CREATED).json(results);  // 201
    //     }
    // );

    // 주문 정보
    sql = `INSERT INTO orders (rep_book_title, total_quantity, total_price, user_id, delivery_id) 
                VALUES (?, ?, ?, ?, ?);`;
    values = [repBookTitle, totalQuantity, totalPrice, userId, delivery_id];
    // conn.query(sql, values,
    //     function (err, results) {
    //         if(err){
    //             console.log(err)
    //             return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
    //         }

    //         order_id = results.insertId; // 생성 PK id

    //         return res.status(StatusCodes.CREATED).json(results);  // 201
    //     }
    // );

    // 주문한 책
    sql = `INSERT INTO orderedBook (order_id, book_id, quantity)
            VALUES ?`;
            
    // items.. 배열 : 요소들을 하나씩 꺼내서 (foreach문 돌려서)
    values = [];    // 초기화
    items.forEach((item) => {
        values.push([order_id, item.book_id, item.quantity]);
    });
    
    conn.query(sql, [values],
        function (err, results) {
            if(err){
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
            }

            return res.status(StatusCodes.CREATED).json(results);  // 201
        }
    );
    
}

const getOrders = (req, res)=>{
    res.json('주문목록 조회');
}

const getOrderDetail = (req, res)=>{
    res.json('주문 상세 상품 조회');
}

module.exports = {
    order,
    getOrders,
    getOrderDetail
}