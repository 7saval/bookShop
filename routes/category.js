// express 모듈 셋팅
const express = require('express')
const router = express.Router() // 해당 파일을 express 라우터로 사용 가능
const {allCategory} = require('../controller/CategoryController')

// 카테고리 전체 조회
router.get('/', allCategory);

module.exports = router;