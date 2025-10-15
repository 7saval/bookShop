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

// 좋아요 추가
router.post('/:id', (req, res)=>{
    res.json('좋아요 추가');
});

// 좋아요 삭제
router.delete('/:id', (req, res)=>{
    res.json('좋아요 삭제');
});


module.exports = router;