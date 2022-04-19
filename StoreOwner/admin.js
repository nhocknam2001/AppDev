const express = require('express')
const { insertObject } = require('../databaseHandler')
const router = express.Router()
const { ObjectId } = require('mongodb')

const { getDatabase, deleteProduct, getAllDocumentsFromCollection,
    getDocumentById, insertObjectToCollection, updateCollection } = require('../databaseHandler')
const async = require('hbs/lib/async')

router.get('/', (req, res) => {
    res.render('admin/adminIndex')
})
router.get('/infor', (req, res) => {
    res.render('admin/infor')
})

router.get('/deleteOrder', async(req,res)=>{
    const id = req.query.id
    const dbo = await getDatabase();
    const collectionName = 'Order'
    await deleteProduct(collectionName,id)
    res.redirect('/admin/managerCustomer')
})

router.get('/editOrder', async(req,res)=>{
    const id = req.query.id
    console.log(id)
    const dbo = await getDatabase();
    const collectionName = 'Order'
    
    res.render('admin/editOrder', {id: id})
})

router.post('/editOrder', async(req,res)=>{
    const id = req.body.idStatus
    console.log(id)
    const status = req.body.statusOrder
    const dbo = await getDatabase();
    const collectionName = 'Order'
    const myquery = {_id: ObjectId(id)}
    const newvalues = {
        $set: { statusOrder:  status}

    }
    
    await dbo.collection(collectionName).updateOne(myquery, newvalues)
    res.redirect('/admin/managerCustomer')
})


router.get('/addUser', (req, res) => {
    res.render('admin/addUser')
})
router.get('/managerCustomer', async (req, res) => {
    const orders = await getAllDocumentsFromCollection('Order')
    res.render("admin/managerCustomer", { orders: orders })
})

router.get('/orderDetail', async (req, res) => {
    const idOrder = req.query.id
    const dbo = await getDatabase();
    const collectionName = 'Order'
    const order = await dbo.collection(collectionName).findOne({ _id: ObjectId(idOrder) });

    const books = order.books
    const books2 = order.books

    var arrBook = new Array(books.length)
    var book
    for (var i = 0; i < books.length; i++) {
        book = await dbo.collection('Book').findOne({ _id: ObjectId(books[i].productId) });
        books[i].productId = book;
        books[i].statusOrder = order.statusOrder
        books[i].price = books[i].quantity * books[i].price
        books[i].date = order.date
    }
    console.log(books)
    var totalBill =  order.totalBill
    res.render("admin/orderDetail", { books: books, totalBill: totalBill })
})
router.get('/editOrder', (req, res) => {
    res.render('admin/editOrder')
})
router.get('/allOrder', async (req, res) => {
    const email = req.query.email
    const dbo = await getDatabase();
    const orders = await dbo.collection('Order').find({ email: email }).toArray();
    res.render("admin/allOrder", { orders: orders })
})
router.get('/allOrder2', async (req, res) => {
    const email = req.query.email
    console.log(email)
    const dbo = await getDatabase();
    const allorders = await dbo.collection('Order').find({ email: email }).toArray();
    console.log(allorders)
    res.render("admin/allOrder2", { allorders: allorders })
})

router.get('/idOrder', async (req, res) => {
    const idOrder = req.query.id
    const dbo = await getDatabase();
    const collectionName = 'Order'
    const order = await dbo.collection(collectionName).findOne({ _id: ObjectId(idOrder) });

    const books = order.books
    const books2 = order.books

    var arrBook = new Array(books.length)
    var book
    for (var i = 0; i < books.length; i++) {
        book = await dbo.collection('Book').findOne({ _id: ObjectId(books[i].productId) });
        books[i].productId = book;
        books[i].statusOrder = order.statusOrder
        books[i].price = books[i].quantity * books[i].price
        books[i].date = order.date
    }
    console.log(books)
    res.render("admin/idOrder", { books: books, totalBill: order.totalBill, order: order })
})
router.get('/idOrder2', async (req, res) => {
    const idOrder = req.query.id
    const dbo = await getDatabase();
    const collectionName = 'Order'
    const order = await dbo.collection(collectionName).findOne({ _id: ObjectId(idOrder) });

    const books = order.books
    const books2 = order.books

    var arrBook = new Array(books.length)
    var book
    for (var i = 0; i < books.length; i++) {
        book = await dbo.collection('Book').findOne({ _id: ObjectId(books[i].productId) });
        books[i].productId = book;
        books[i].statusOrder = order.statusOrder
        books[i].price = books[i].quantity * books[i].price
        books[i].date = order.date
    }
    console.log(books)
    res.render("admin/idOrder2", { books: books, totalBill: order.totalBill, order: order })
})
router.get('/feedbacks', async (req, res) => {
    const email = req.query.email
    const dbo = await getDatabase();
    const feedbacks = await dbo.collection('Feedback').find({ email: email }).toArray();
    res.render('admin/feedbacks', { feedbacks: feedbacks })
})

router.get('/deleteBook', async (req, res) => {
    const id = req.query.id
    const collectionName = 'Book'
    await deleteProduct(collectionName, id)
    res.redirect("/admin/viewProduct")

})
router.get('/deleteCategory', async (req, res) => {
    const id = req.query.id
    const collectionName = 'Category'
    await deleteProduct(collectionName, id)

    res.redirect("/admin/viewCategories")

})
router.get('/listUser', async (req, res) => {
    const collectionName = 'Customer'
    const customer = await getAllDocumentsFromCollection(collectionName);
    res.render("admin/listUser", {customer:customer})
})


router.get('/updateProfile', async (req, res) => {
    const id = req.query.id
    const collectionName = 'Customer'
    const customer = await getDocumentById(collectionName, id)
    
    console.log(customer)

    res.render('admin/managerBook/updateProfile', {customer: customer})
})
router.get('/addCategories', (req, res) => {
    res.render('admin/managerBook/addCategories')
})

router.post('/updateProfile', async (req, res) => {
    const id = req.body.id
    console.log(id)
    const name = req.body.txtName
    const password = req.body.txtPassword
    const email = req.body.txtEmail
    const phone = req.body.txtPhone
    const collectionName = 'Customer'

    const newvalues = {
        $set: {
            fullName: name, password: password,
            email: email, phone: phone
        }

    }
    await updateCollection(id, collectionName, newvalues);

    res.redirect('/admin/listUser')
})

router.get('/deleteCustomer', async (req, res) => {
    const id = req.query.id
    const collectionName = 'Customer'
    await deleteProduct(collectionName, id)
    res.redirect("/admin/listUser")
})

router.post('/addCategory', async (req, res) => {
    const name = req.body.txtName
    const description = req.body.txtDescription
    const collectionName = 'Category'

    const newP = { name: name, description: description }

    await insertObjectToCollection(collectionName, newP);
    const notify = "Add category successful"

    res.render('admin/managerBook/addCategories', { notify: notify })
})


router.get('/insert', (req, res) => {
    res.render('newProduct');
})

router.get('/viewProduct', async (_req, res) => {

    const collectionName = 'Book'
    const dbo = await getDatabase();
    const products = await getAllDocumentsFromCollection(collectionName);
    // await changeIdToCategoryName(products, dbo);

    res.render('admin/managerBook/viewProduct', { products: products })
})

router.get('/addProduct', async (req, res) => {

    const categories = await getAllDocumentsFromCollection('Category');
    console.log(categories)
    res.render('admin/managerBook/addProduct', {categories: categories});
})
router.post('/addProduct', async (req, res) => {
    const name = req.body.txtName
    const price = req.body.txtPrice
    const picture = req.body.txtPicture
    const category = req.body.txtCategory
    const hot = req.body.txthot
    const author = req.body.txtAuthor
    const description = req.body.txtDescription
    const collectionName = 'Book'

    const newP = {
        name: name, price: Number.parseFloat(price), imgURL: picture, author: author, description: description, category: category, hot: hot
    }

    await insertObjectToCollection(collectionName, newP);
    const notify = "Add book successful"

    res.render('admin/managerBook/addProduct', { notify: notify })
})
router.get('/editProduct', async (req, res) => {
    const id = req.query.id
    const collectionName = 'Book'
    
    const books = await getDocumentById(collectionName, id)
    
    const categories = await getAllDocumentsFromCollection('Category');
    console.log(categories)

    res.render('admin/managerBook/editProduct', {books:books, categories: categories})
})

router.post('/editBook', async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName
    const price = req.body.txtPrice
    const picture = req.body.txtImage
    const category = req.body.txtCategory
    const author = req.body.txtAuthor
    const description = req.body.txtDescription
    const collectionName = 'Book'

    const newvalues = {
        $set: {
            name: name, category: category, price: Number.parseFloat(price),
            description: description, imgURL: picture, author: author, category: category, hot: 'false'
        }

    }
    await updateCollection(id, collectionName, newvalues);

    
    const notify = "Update book successful"

    res.redirect('/admin/viewProduct')
})



router.get('/viewCategories', async (_req, res) => {
    const collectionName = 'Category'

    const category = await getAllDocumentsFromCollection(collectionName);
    res.render('admin/managerBook/viewCategories', { category: category })
})



module.exports = router;