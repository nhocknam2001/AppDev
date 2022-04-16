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

<<<<<<< HEAD
module.exports = router;
//
=======
router.get('/feedback', async (req, res) => {

    const id = req.query.fb
    console.log(id)
    const dbo = await getDatabase();
    
    const order = await dbo.collection('Order').findOne({_id: ObjectId(id)});
    const email = order.email
    res.render('feedbackUser', {totalProduct:totalProduct, email: email, idOrder: order.id})

})

router.post('/feedback', async (req, res) => {
    
    const fb = req.body.feedback
    var id = req.body.id
    const email = req.body.email
    console.log(id)
    var d = new Date();
    const date = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/') + ' ' + [d.getHours(),d.getMinutes(),d.getSeconds()].join(':');
    const dbo = await getDatabase();
    
    // const order = await dbo.collection('Order').findOne({_id: ObjectId(id)});
    // console.log(order)
    const user = await dbo.collection('Customer').findOne({email: email});
    
    
    const collectionName = 'Feedback' 
    const newOrder = {
        nameCustomer: user.fullName,
        date: date,
        feedback: fb,
        emailCustomer: email,
        idOrder: id.toHexString()
    }
    await insertObjectToCollection(collectionName, newOrder)

    // const category = await categories()
    var status = 'Feedback/Cancel order successful'
    res.redirect('/user/purchaseHistory?email='+email)

})

module.exports = router;
>>>>>>> 5c182a9c5d79e0aca692bf86835f55d79c9aecad
