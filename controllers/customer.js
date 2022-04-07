const express = require('express')
const router = express.Router()

router.get('/addCart',(req,res)=>{
    const id = req.query.id
    //lay bien cart trong session co the chua co gia tri hoac co gia tri
    let myCart = req.session["Cart"]
})

//global scope
var products = []
router.get('/buy',(req,res)=>{
    products.push({'id':1, 'name':'laptop'})
    products.push({'id':2, 'name':'book'})
    products.push({'id':3, 'name':'phone'})
    res.render('buy',{'products':products})
})

module.exports = router;