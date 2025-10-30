// const conn = require('../mariadb')  // db 모듈 가져오기
const mysql = require('mysql2/promise');  // 쿼리를 promise로 감싸기
const {StatusCodes} = require('http-status-codes');     // status code 모듈
const ensureAuth = require('../auth');  // 인증 모듈
const jwt = require('jsonwebtoken');

// 주문하기
const order = async (req, res)=>{
    const conn = await mysql.createConnection({
        host: '127.0.0.1',
        port: '3307',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dateStrings: true,    // 날짜 형식대로 표기
      });

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
        const {items, delivery, totalQuantity, totalPrice, repBookTitle} = req.body;

        // 배송 정보
        let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
        // const delivery_id = SELECT max(id) FROM delivery;
        let values = [delivery.address, delivery.receiver, delivery.contact];
        // INSERT 쿼리문
        let [results] = await conn.execute(sql, values
            // function (err, results) {
            //     if(err){
            //         console.log(err)
            //         return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
            //     }

            //     delivery_id = results.insertId; // 생성 PK id

            //     // return res.status(StatusCodes.CREATED).json(results);  // 201
            // }
        );

        console.log(results);

        let delivery_id = results.insertId;
        
        // 주문 정보
        sql = `INSERT INTO orders (rep_book_title, total_quantity, total_price, user_id, delivery_id) 
                    VALUES (?, ?, ?, ?, ?);`;
        values = [repBookTitle, totalQuantity, totalPrice, authorization.id, delivery_id];
        [results] = await conn.execute(sql, values
            // function (err, results) {
            //     if(err){
            //         console.log(err)
            //         return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
            //     }

            //     order_id = results.insertId; // 생성 PK id

            //     // return res.status(StatusCodes.CREATED).json(results);  // 201
            // }
        );

        let order_id = results.insertId;

        // items를 가지고, 장바구니에서 book_id, quantity 조회
        sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`;
        // let orderItems = await conn.query(sql, [items]);
        let [orderItems, fields] = await conn.query(sql, [items]);

        // 주문한 책
        sql = `INSERT INTO orderedBook (order_id, book_id, quantity)
                VALUES ?`;
                
        // items.. 배열 : 요소들을 하나씩 꺼내서 (foreach문 돌려서)
        values = [];    // 초기화
        // items.forEach((item) => {
        //     values.push([order_id, item.book_id, item.quantity]);
        // });
        orderItems.forEach((item) => {
            values.push([order_id, item.book_id, item.quantity]);
        });
        
        results = await conn.query(sql, [values]
            // function (err, results) {
            //     if(err){
            //         console.log(err)
            //         return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
            //     }

                // return res.status(StatusCodes.CREATED).json(results);  // 201
            // }
        );

        // 결제한 장바구니 삭제
        let result = await delCartItems(conn, items);
        return res.status(StatusCodes.CREATED).json(results[0]);  // 201
    } 
}

// 결제한 장바구니 삭제
const delCartItems = async (conn, items) => {
    let sql = `DELETE FROM cartItems WHERE id IN (?)`;

    let result = await conn.query(sql, [items]);
    return result;
}

// 주문내역 조회
const getOrders = async (req, res)=>{
    // DB connection 생성
    const conn = await mysql.createConnection({
        host: '127.0.0.1',
        port: '3307',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dateStrings: true,    // 날짜 형식대로 표기
      });

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
        // 주문내역 페이지에서 보여줄 컬럼 셋팅 위해 orders와 delivery 조인
        let sql = `SELECT orders.id, created_at, address, receiver, contact, 
                        rep_book_title, total_quantity, total_price
                    FROM orders LEFT JOIN delivery 
                    ON orders.delivery_id = delivery.id
                   WHERE user_id = ?`;

        let [rows, fields] = await conn.query(sql, authorization.id);
        return res.status(StatusCodes.OK).json(rows);
    }
}

// 주문상세 조회
const getOrderDetail = async (req, res)=>{
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
        // 상세 조회할 주문id url로 받아오기
        let order_id = req.params.id;

        // DB connection 생성
        const conn = await mysql.createConnection({
            host: '127.0.0.1',
            port: '3307',
            user: 'root',
            password: 'root',
            database: 'Bookshop',
            dateStrings: true,    // 날짜 형식대로 표기
        });

        // orderedBook과 books 조인
        let sql = `SELECT book_id, title, author, price, quantity
                    FROM orderedBook LEFT JOIN books 
                    ON orderedBook.book_id = books.id
                    WHERE order_id = ?`;

        let [rows, fields] = await conn.query(sql, order_id);
        return res.status(StatusCodes.OK).json(rows);
    }
}

module.exports = {
    order,
    getOrders,
    getOrderDetail
}