// express 모듈 셋팅
const express = require('express')
const router = express.Router() // 해당 파일을 express 라우터로 사용 가능
const {body, param, validationResult} = require('express-validator') // 유효성검사 모듈(body: 내가만든 변수, validationResult : 에러 시 결과값)
const {allBooks, bookDetail} = require('../controller/BookController')

// jwt 모듈
const jwt = require('jsonwebtoken')

// dotenv 모듈
const dotenv = require('dotenv')
dotenv.config();

router.use(express.json()) // http 외 모듈 'json'

// 전체 도서 조회 & 카테고리별 도서 목록 조회
router.get('/', allBooks);

// 개별 도서 조회
router.get('/:id', bookDetail);


module.exports = router;