// express 모듈 셋팅
const express = require('express')
const router = express.Router() // 해당 파일을 express 라우터로 사용 가능
const conn = require('../mariadb')  // db 모듈 가져오기
const {StatusCodes} = require('http-status-codes');     // status code 모듈
const {body, param, validationResult} = require('express-validator') // 유효성검사 모듈(body: 내가만든 변수, validationResult : 에러 시 결과값)
const {
    join, 
    login, 
    passwordResetRequest, 
    passwordReset} = require('../controller/UserController');

router.use(express.json()) // http 외 모듈 'json'

// 회원가입
router.post('/join', join);

// 로그인
router.post('/login', login);

// 비밀번호 초기화 요청
router.post('/reset', passwordResetRequest);

// 비밀번호 초기화
router.put('/reset', passwordReset);

module.exports = router;