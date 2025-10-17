const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈
// const jwt = require('jsonwebtoken');    // jwt 모듈
// const crypto = require('crypto');       // crypto 모듈 : 암호화 (node.js 기본모듈)
// const dotenv = require('dotenv');       // dotenv 모듈
// dotenv.config();


const allBooks = (req, res)=>{
    // req.query.categryId
    let {category_id} = req.query;

    if(category_id){
        // 카테고리별 도서 목록 조회
        let sql = `SELECT * FROM books WHERE category_id = ?`;
        // SELECT 쿼리문
        conn.query(sql, category_id,
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
    }else{
        // (요약된) 전체 도서 리스트
        let sql = `SELECT * FROM books`;
        // SELECT 쿼리문
        conn.query(sql,
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

const bookDetail = (req, res)=>{
    let {id} = req.params;
    id = parseInt(id);

    let sql = `SELECT * FROM books WHERE id = ?`;
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

// const booksByCategory = (req, res)=>{
//     // req.query.categryId
//     let {category_id} = req.query;

//     let sql = `SELECT * FROM books WHERE category_id = ?`;
//     // SELECT 쿼리문
//     conn.query(sql, category_id,
//         (err, results) => {
//             if(err){
//                 console.log(err)
//                 return res.status(StatusCodes.BAD_REQUEST).end()
//             }

//             if(results.length > 0)
//                 return res.status(StatusCodes.OK).json(results);
//             else
//                 return res.status(StatusCodes.NOT_FOUND).end();
//         }
//     )
// }

module.exports = {
    allBooks,
    bookDetail,
    // booksByCategory
}