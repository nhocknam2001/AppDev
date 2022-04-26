const express = require('express')

const { insertObject } = require('../databaseHandler')
const router = express.Router()
const { ObjectId } = require('mongodb')
router.use(express.static('public'))
const {getDatabase, deleteProduct, getAllDocumentsFromCollection,
    getDocumentById, insertObjectToCollection, updateCollection} = require('../databaseHandler')

const cookieParser = require('cookie-parser')
router.use(cookieParser())


const session = require('express-session')
const async = require('hbs/lib/async')
router.use(session({ secret: '124447yd@@$%%#', cookie: { maxAge: 60000 }, saveUninitialized: false, resave: false }))
// var requireAuth = require('../middlewares/auth_middleware')

var totalProduct = 0;

router.get('/', requireAuth, async (req, res) => {
    const email = req.cookies.userId
    var d = new Date();
    var dformat = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/') + ' ' + [d.getHours(),d.getMinutes(),d.getSeconds()].join(':');
    
    console.log(dformat)
    
    const category = await categories()
    const collectionName = 'Book'
    const searchInput = req.query.txtSearch;

    const feedbacks = await getAllDocumentsFromCollection('Feedback')
    
    if (searchInput){
        const searchPrice = Number.parseFloat(searchInput);
        const dbo = await getDatabase();
        // const result = await dbo.collection(collectionName).find({$or:[{_id:ObjectId(searchInput)},{name: searchInput}, {category: }]});

        const book = await dbo.collection(collectionName).find(
            {
                $or: [
                    { _id: { $regex: searchInput, $options: "$i" } },
                    { name: { $regex: searchInput, $options: "$i" } },
                    { price: { $regex: searchInput, $options: "$i" } },
                    { price: searchPrice },

                ]
            }

        ).toArray();

        console.log(book)
        // await changeIdToCategoryName(products, dbo);
        
        
        
        res.render('user', { category: category, books:book, totalProduct:totalProduct, email: email, feedbacks: feedbacks})
        

    }

    else{
        const dbo = await getDatabase();
        const books = await dbo.collection(collectionName).find({hot: 'true'}).toArray();
        res.render('user', { category: category, books:books, totalProduct:totalProduct, email:email, feedbacks: feedbacks })

    }
    console.log(totalProduct)
    // res.render('user', { category: category, books:books, totalProduct:totalProduct, email: email })

})

router.get('/purchaseHistory', requireAuth, async (req, res) => {
    const email = req.cookies.userId
    
    const collectionName = 'Order'
    const orders = await getAllDocumentsFromCollection(collectionName)
    
    res.render('purchaseHistory', { orders:orders, totalProduct:totalProduct })

})


router.get('/proDetail', async (req, res) => {
    const id = req.query.id

    const dbo = await getDatabase();
    const product = await dbo.collection('Book').findOne({_id: ObjectId(id)});
    
    
    const categoryProduct = await CategoryProduct(product.categoryId);
    
    const category = await categories()
    
    res.render('userProDetail', {category: category, product:product, categoryProduct: categoryProduct, totalProduct:totalProduct})

})

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
        idOrder: id,
    }
    await insertObjectToCollection(collectionName, newOrder)

    // const category = await categories()
    var status = 'Feedback/Cancel order successful'
    res.redirect('/user/purchaseHistory?email='+email)

})


router.get('/cancel', async (req, res) => {
        const id = req.query.id
        const dbo = await getDatabase();
        const collectionName = 'Order'
        await deleteProduct(collectionName,id)
        res.redirect('/user/purchaseHistory')
})



var totalBillAll = 0;
router.get('/shoppingCart', requireAuth, async (req, res) => {
    const category = await categories();
    console.log(category)
    const cart = req.session["cart"]
    console.log(cart)
    
    const dbo = await getDatabase();
    const collectionName = 'Book'
    let totalBill = 0
    //Mot array chua cac san pham trong gio hang
    let purchasedProduct = []
    //neu khach hang da mua it nhat 1 sp
    if(cart){
        const dict = req.session["cart"]

        let totalPro
        
        
        for(var key in dict) {
            let book = await dbo.collection(collectionName).findOne({_id: ObjectId(key)});
            console.log(book)
            
            totalPro= book.price * dict[key]
            totalBill += totalPro

            totalBillAll = totalBill + 30000

            purchasedProduct.push({name: book.name,  img: book.imgURL, price: book.price, quantity: dict[key], totalProduct: totalPro})
         }
    
    }
    console.log(totalBill)
    res.render('shoppingCart', {category: category, totalProduct:totalProduct, purchasedProduct: purchasedProduct, totalBill: totalBillAll})
    

})


router.post('/shoppingCart',requireAuth, async (req, res)=>{
    const product = req.body.idProduct.toString()
    var quantity = parseInt(req.body.quantity)
    totalProduct += quantity
    //lay gio hang trong session
    
    let cart = req.session["cart"]
    console.log(product)
    //chua co gio hang trong session, day se la sp dau tien
    if(!cart){
        let dict = {}
        dict[product] = quantity
        req.session["cart"] = dict
        console.log("Ban da mua:" + product + ", so luong: " + dict[product])
    }else{
        dict = req.session["cart"]
        //co lay product trong dict
        var oldProduct = dict[product]
        //kiem tra xem product da co trong Dict
        if(!oldProduct)
            dict[product] = quantity
        else{
            dict[product] = Number.parseInt(oldProduct) + quantity
        }
        req.session["cart"] = dict
        console.log("Ban da mua:" + product + ", so luong: " + dict[product])
    }
    const idProduct = req.body.idProduct
    
    // totalProduct = 0;
    
    // for (let key in (req.session["cart"])) {
    //     totalProduct += req.session["cart"][key]
    // }

    

    res.redirect('/user/proDetail?id='+idProduct);
})

router.post('/order', async (req,res)=>{
    const email = req.cookies.userId
    var d = new Date();
    const category = await categories()
    const date = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/') + ' ' + [d.getHours(),d.getMinutes(),d.getSeconds()].join(':');
    const phone = req.body.txtPhone
    var books = req.session["cart"]
    // books = books.toArray()
    const orderDetail = {
        address: req.body.txtAddress,
        phoneNumber: req.body.phone,
        discount: 0,
        transportFee: 30000,
        payment:  req.body.flexRadioDefault,
        note: req.body.txtNote

    }
    var array = []
    for(var key in books) {
        const dbo = await getDatabase();
        let book = await dbo.collection('Book').findOne({_id: ObjectId(key)});
        console.log(book)
        
        let price= book.price * books[key]

        array.push({productId: key, quantity: books[key], price})
     }

    const totalBill = totalBillAll 
    const statusOrder = 'Wait for confirmation'
    const collectionName = 'Order'
    const newOrder = {
        email: email, date: date, books: array, phone: phone, orderDetail: orderDetail, totalBill:totalBill, statusOrder:statusOrder}
    await insertObjectToCollection(collectionName, newOrder)
    req.session["cart"] = null;
    const status = 'Order successful'
    totalBillAll = 0
    totalProduct = 0
    console.log(status)
    res.render('shoppingCart', {category: category, totalProduct:totalProduct, status: status, totalBill: totalBillAll});
    
})


router.get('/product', async (req, res) => {

    const collectionName = 'Book'
    
    const books = await getAllDocumentsFromCollection(collectionName);
    
    // await changeIdToCategoryName(products, dbo);

    res.render('userAllProduct', { books: books, totalProduct:totalProduct })
})

async function categories() {
    const collectionName = 'Category'
    const category = await getAllDocumentsFromCollection(collectionName)
    return category
}


async function categories() {
    const collectionName = 'Category'
    const category = await getAllDocumentsFromCollection(collectionName)
    return category
}

async function CategoryProduct(category) {
    const collectionName = 'Category'
    const dbo = await getDatabase();
    
    const CategoryProduct = await dbo.collection(collectionName).findOne({_id: ObjectId(category)})
    
    return CategoryProduct
}

async function requireAuth(req,res,next) {
    var email = req.cookies.userId
    
    if(!req.cookies.userId) {
        res.redirect('/login');
        return;
    }
    const dbo = await getDatabase();

    var user = await dbo.collection('Customer').findOne({email: email});

    if(!user){
        res.redirect('/login');
        return;
    }

    next();

}
module.exports = router