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

router.get('/deleteBook', async (req, res) => {
    const id = req.query.id
    const collectionName = 'Book'
    await deleteProduct(collectionName, id)
    res.redirect("/admin/viewProduct")

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

module.exports = router;