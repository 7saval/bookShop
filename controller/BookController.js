const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈
const ensureAuth = require('../auth');  // 인증 모듈
const jwt = require('jsonwebtoken');
// const crypto = require('crypto');       // crypto 모듈 : 암호화 (node.js 기본모듈)
// const dotenv = require('dotenv');       // dotenv 모듈
// dotenv.config();

// (카테고리별, 신간 여부) 전체 도서 목록 조회
const allBooks = (req, res)=>{
    let allBooksRes = {};
    let {category_id, news, limit, currentPage } = req.query;

    // limit : page당 도서 수   ex. 3
    // currentPage : 현재 몇 페이지 ex. 1, 2, 3 ...
    // offset : limit*(currentPage-1)  ex. 0, 3, 6, 9, 12 ...

    let offset = limit * (currentPage - 1);

    // 좋아요 수 추가한 서브쿼리
    // SQL_CALC_FOUND_ROWS : 총 ROW 수 저장
    let sql = `SELECT SQL_CALC_FOUND_ROWS *, 
                    (SELECT count(1) 
                    FROM likes 
                    WHERE liked_book_id = books.id) AS likes 
                FROM books`;
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

            console.log(results);
            if(results.length){
                // pub_date => pubDate 변경
                results.map((result)=> {
                    result.pubDate = result.pub_date;
                    delete result.pub_date;
                });
                allBooksRes.books = results;
            } else{
                return res.status(StatusCodes.NOT_FOUND).end();
            }
        }
    )

    // SELECT found_rows() : 저장된 총 ROW수 조회
    sql = ` SELECT found_rows()`;
    // sql = ` SELECT found_rows() AS foundRows`;
    conn.query(sql,
        (err, results) => {
            if(err){
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }

            // pagination 객체 생성해 넣기
            let pagination = {};
            pagination.currentPage = parseInt(currentPage);
            pagination.totalCount = results[0]["found_rows()"];

            allBooksRes.pagination = pagination;

            return res.status(StatusCodes.OK).json(allBooksRes);
        }
    )

    
}

// 개별 도서 상세 조회
const bookDetail = (req, res)=>{

    // 로그인 상태가 아니면 => liked 빼고 보내줌
    // 로그인 상태면 => liked 추가해서

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
    else if(authorization instanceof ReferenceError){
        // 로그인 하지 않은 상태에서 liked 제외
        let book_id = req.params.id;

        let sql = `SELECT *,
                        (SELECT count(1) 
                            FROM likes 
                            WHERE liked_book_id = books.id
                        ) AS likes
                    FROM books 
                LEFT JOIN category 
                ON books.category_id = category.category_id 
                WHERE books.id = ?`;
        let values = [book_id];
        // SELECT 쿼리문
        conn.query(sql, values,
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
    else{
        let book_id = req.params.id;

        let sql = `SELECT *,
                        (SELECT count(1) 
                            FROM likes 
                            WHERE liked_book_id = books.id
                        ) AS likes,
                        (SELECT EXISTS
                            (SELECT *
                            FROM likes
                            WHERE user_id = ?
                            AND liked_book_id= ?)
                        ) AS liked 
                    FROM books 
                LEFT JOIN category ON books.category_id = category.category_id 
                WHERE books.id = ?`;
        let values = [authorization.id, book_id, book_id];
        // SELECT 쿼리문
        conn.query(sql, values,
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
}

module.exports = {
    allBooks,
    bookDetail
}