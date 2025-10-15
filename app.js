// express 모듈 셋팅
const express = require('express');
const app = express();

// dotenv 모듈
const dotenv = require('dotenv');
dotenv.config();

let port = process.env.PORT;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});


const userRouter = require('./routes/users');
const bookRouter = require('./routes/books');
const cartRouter = require('./routes/carts');
const likeRouter = require('./routes/likes');
const orderRouter = require('./routes/orders');

app.use("/users", userRouter);
app.use("/books", bookRouter);
app.use("/carts", cartRouter);
app.use("/likes", likeRouter);
app.use("/orders", orderRouter);