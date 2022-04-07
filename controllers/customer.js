const express = require('express')
const router = express.Router()

router.get('/addCart',(req,res)=>{
    const id = req.query.id
    //lay bien cart trong session co the chua co gia tri hoac co gia tri
    let myCart = req.session["Cart"]
    if(myCart == null){ //day la lan dau tien add sp vao Cart
        var dict = {}
        dict[id] = 1
        console.log('Ban da mua san pham dau tien:' + id)
        req.session["Cart"]=dict
    } else{//da mua it nhat 1 san pham
        var dict = req.session["Cart"]
        var oldProduct = dict[id]
        //kiem tra san pham dang mua torng cart chua
        if(oldProduct == null)
            dict[id] = 1 //chua co: cho so luong = 1
        else{
            const oldQuantity = parseInt(oldProduct) //lay so luong cu 
            dict[id] = oldProduct + 1 //da co: so luong tang them 1
        }
        //cap nhat gio hang bang tu dien
        req.session["cart"] = dict
    }

    let spDamua = []
    //neu khach hang da mua it nhat 1 san pham 
    const dict2 = req.session["cart"]
    for (var key in dict2) {
        spDamua.push({masp:key, soLuong: dict2[key]})
    }
    res.render('myCart',{'cart':spDamua})

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