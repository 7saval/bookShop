// express 모듈 셋팅
const express = require('express')
const router = express.Router() // 해당 파일을 express 라우터로 사용 가능
// const conn = require('../mariadb')  // db 모듈 가져오기
const {body, param, validationResult} = require('express-validator') // 유효성검사 모듈(body: 내가만든 변수, validationResult : 에러 시 결과값)
const {addToCart, getCartItems, removeCartItem} = require('../controller/CartController');

router.use(express.json()) // http 외 모듈 'json'

// 장바구니 담기
router.post('/', addToCart);

// 장바구니 조회 / 장바구니에서 선택한 주문 예상 상품 조회
router.get('/', getCartItems);

// 장바구니 도서 삭제
router.delete('/:id', removeCartItem);

// // 장바구니에서 선택한 주문 예상 상품 조회
// router.get('/', (req, res)=>{
//     res.json('장바구니 조회');
// });

module.exports = router;