// express 모듈 셋팅
const express = require('express')
const router = express.Router() // 해당 파일을 express 라우터로 사용 가능
// const conn = require('../mariadb')  // db 모듈 가져오기
const {body, param, validationResult} = require('express-validator') // 유효성검사 모듈(body: 내가만든 변수, validationResult : 에러 시 결과값)

// jwt 모듈
const jwt = require('jsonwebtoken')

// dotenv 모듈
const dotenv = require('dotenv')
dotenv.config();

router.use(express.json()) // http 외 모듈 'json'

// 주문하기
router.post('/', (req, res)=>{
    res.json('주문하기');
});

// 주문목록 조회
router.get('/', (req, res)=>{
    res.json('주문목록 조회');
});

// 주문 상세 상품 조회
router.get('/:id', (req, res)=>{
    res.json('주문 상세 상품 조회');
});


module.exports = router;