const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈
const jwt = require('jsonwebtoken');    // jwt 모듈
const crypto = require('crypto');       // crypto 모듈 : 암호화 (node.js 기본모듈)
const dotenv = require('dotenv');       // dotenv 모듈
dotenv.config();


const join = (req, res)=>{
    const userInfo = req.body;
        
        const {email, password} = userInfo;

        let sql = `INSERT INTO users (email, password, salt)
            VALUES (?, ?, ?)`;

        // 비밀번호 암호화
        // randomBytes(64) : 64만큼의 길이로 숫자를 랜덤바이트로 만들어줌
        // toString('base64') : base64 방식으로 문자열화
        const salt = crypto.randomBytes(64).toString('base64');
        // pbkdf2Sync(해싱할 값, 해싱에 사용되는 무작위 문자열, 해시함수 반복횟수, 암호길이, 암호화알고리즘)
        const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');  // 해싱

        // 회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와 salt 값을 같이 저장
        let values = [email, hashPassword, salt];
        // INSERT 쿼리문
        conn.query(sql, values,
            function (err, results) {
                if(err){
                    console.log(err)
                    return res.status(StatusCodes.BAD_REQUEST).end();   // Bad Request(400)
                }

                if(results.affectedRows)
                    return res.status(StatusCodes.CREATED).json(results);  // 201
                else
                    return res.status(StatusCodes.BAD_REQUEST).end();
            }
        );
};

const login = (req,res)=>{
    const {email, password} = req.body

    let sql = `SELECT * FROM users WHERE email= ?`
    // SELECT 쿼리문
    conn.query(sql, email,
        function (err, results) {
            if(err){
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }

            var loginUser = results[0];

            // salt값 꺼내서 날 것 비밀번호 암호화
            const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');  // 해싱

            // 해시된 디비 비밀번호랑 비교
            if(loginUser && loginUser.password === hashPassword){
                // token 발급 / 유효기간 설정
                const token = jwt.sign({
                    id : loginUser.id,
                    email : loginUser.email
                }, process.env.PRIVATE_KEY, {
                    expiresIn : '30m',  // 유효시간
                    issuer : 'yj'       // 발행인
                });

                // 쿠키에 토큰 담기 - 토큰 변수에 토큰 담기
                res.cookie("token", token, {
                    httpOnly : true
                });
                console.log(token);

                // res.status(StatusCodes.OK).json(results);
                res.status(StatusCodes.OK).json({...results[0], token: token});
            }
            else{
                res.status(StatusCodes.UNAUTHORIZED).json({  // 401 : Unauthorized(비인증) 403 : Forbidden(접근 권리 없음)
                    message : "아이디 또는 비밀번호가 일치하지 않습니다."
                })
            }
        }
    )
};

const passwordResetRequest = (req, res)=>{
    const {email} = req.body;
    let sql = `SELECT * FROM users WHERE email= ?`
    // SELECT 쿼리문
    conn.query(sql, email,
        function (err, results) {
            if(err){
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }

            // 이메일로 유저가 있는지 검색
            var loginUser = results[0];

            if(loginUser){
                // 확인
                res.status(StatusCodes.OK).json({
                    email : email
                });
            }
            else{
                res.status(StatusCodes.UNAUTHORIZED).end();
            }
        }
    )
};

const passwordReset = (req, res)=>{
    let {password, email} = req.body;

    let sql = `UPDATE users SET password = ?, salt = ? WHERE email = ?`

    // 암호화된 비밀번호 salt 값을 같이 DB에 저장
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');  // 해싱

    let values = [hashPassword, salt, email];
    // UPDATE 쿼리문
    conn.query(sql, values,
        function (err, results) {
            if(err){
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }

            // 업데이트 잘 되었는지 유효성 검사
            if(results.affectedRows == 0){
                return res.status(StatusCodes.BAD_REQUEST).end()
            }else{
                res.status(StatusCodes.OK).json(results);
            }
        }
    ); 
};

module.exports = {
    join, 
    login, 
    passwordResetRequest, 
    passwordReset
};