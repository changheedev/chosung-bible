const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = require("./router/index");

//bodyParser 사용설정
app.use(bodyParser.json()); //json 포맷의 데이터를 사용
app.use(bodyParser.urlencoded({ extended: true })); //인코딩 된 데이터 사용

//router 설정
app.use(router);

module.exports = app;
