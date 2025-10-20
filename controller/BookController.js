const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈
// const jwt = require('jsonwebtoken');    // jwt 모듈
// const crypto = require('crypto');       // crypto 모듈 : 암호화 (node.js 기본모듈)
// const dotenv = require('dotenv');       // dotenv 모듈
// dotenv.config();

// (카테고리별, 신간 여부) 전체 도서 목록 조회
const allBooks = (req, res)=>{
    let {category_id, news, limit, currentPage } = req.query;

    // limit : page당 도서 수   ex. 3
    // currentPage : 현재 몇 페이지 ex. 1, 2, 3 ...
    // offset : limit*(currentPage-1)  ex. 0, 3, 6, 9, 12 ...

    let offset = limit * (currentPage - 1);

    let sql = `SELECT * FROM books`;
    let values = [];
    // 순서 중요
    if(category_id && news){
        sql += ` WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
        values = [category_id];
    } else if(category_id){
        sql += ` WHERE category_id = ?`;
        values = [category_id];
    } else if(news){
        sql += ` WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
    }

    // limit문은 where절 뒤에 붙어야 한다.
    sql += ` LIMIT ? OFFSET ?`;
    values = [...values, parseInt(limit), offset];
 
    // SELECT 쿼리문
    conn.query(sql, values,
        (err, results) => {
            if(err){
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }

            if(results.length > 0)
                return res.status(StatusCodes.OK).json(results);
            else
                return res.status(StatusCodes.NOT_FOUND).end();
        }
    )
}

// 개별 도서 상세 조회
const bookDetail = (req, res)=>{
    let {id} = req.params;
    id = parseInt(id);

    let sql = `SELECT * FROM books LEFT JOIN category 
                    ON books.category_id = category.id WHERE books.id = ?`;
    // SELECT 쿼리문
    conn.query(sql, id,
        (err, results) => {
            if(err){
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }

            if(results[0])
                return res.status(StatusCodes.OK).json(results[0]);
            else
                return res.status(StatusCodes.NOT_FOUND).end();
        }
    )
}

module.exports = {
    allBooks,
    bookDetail
}