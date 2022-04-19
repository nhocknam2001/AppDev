const express = require('express')
const adminStoreOwner = require('./StoreOwner/admin')

const app = express()

app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

//cac request co chua /admin se di den controller admin
app.use('/admin', adminStoreOwner)

const customer = require('./Customer/customer')
app.use('/user', customer)

const { ObjectId } = require('mongodb')

const { getDatabase, deleteProduct, getAllDocumentsFromCollection,
    getDocumentById, insertObjectToCollection, updateCollection } = require('./databaseHandler')


const cookieParser = require('cookie-parser')
app.use(cookieParser())

const path = require('path');
const hbs = require('hbs');
const async = require('hbs/lib/async')
const { redirect } = require('express/lib/response')
const console = require('console')

const partialsPath = path.join(__dirname, "/views/partials");
hbs.registerPartials(partialsPath);

app.set('view engine', 'hbs')
app.set('views', './views');

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
// app.use(bodyParser.urlencoded({
//     extended: true
// }))

const session = require('express-session')
app.use(session({ secret: '124447yd@@$%%#', cookie: { maxAge: 60000 }, saveUninitialized: false, resave: false }))

app.get('/', async (req, res) => {

    var d = new Date();
    var dformat = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/') + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');

    console.log(dformat)

    const category = await categories()
    await res.clearCookie('userId');

    const collectionName = 'Book';

    const searchInput = req.query.txtSearch;

    const feedbacks = await getAllDocumentsFromCollection('Feedback')

    if (searchInput) {
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



        res.render('index', { category: category, books: book })


    }

    else {
        // const books = await getAllDocumentsFromCollection(collectionName)
        const dbo = await getDatabase();
        const books = await dbo.collection(collectionName).find({ hot: 'true' }).toArray();
        res.render('index', { category: category, books: books, totalProduct: totalProduct, feedbacks: feedbacks })

    }


})

app.get('/login', async (req, res) => {


    const category = await categories()

    res.render('login', { category: category, totalProduct: totalProduct })

})

app.post('/login', async (req, res) => {
    const email = req.body.txtEmail

    const password = req.body.password

    const dbo = await getDatabase();
    const user = await dbo.collection('Customer').findOne({ $and: [{ email: email }, { password: password }] });
    const admin = await dbo.collection('Admin').findOne({ $and: [{ email: email }, { password: password }] });

    
    if (!user) {
        res.render('login', { err: "User dose not exist or wrong password." })
        return
    }
    else {

        await res.cookie('userId', user.email)

        res.redirect('/user')
    }
    // if (admin != -1)
    // {
    //     await res.cookie('userId', user.email)

    //     res.redirect('/user')
    // }



})


// app.get('/search', async (req, res) => {

//     const searchInput = req.query.txtSearch;
//     const searchPrice = Number.parseFloat(searchInput);


//     const collectionName = 'Book'
//     const dbo = await getDatabase();
//     // const result = await dbo.collection(collectionName).find({$or:[{_id:ObjectId(searchInput)},{name: searchInput}, {category: }]});

//     const books = await dbo.collection(collectionName).find(
//         {
//             $or: [
//                 { _id: { $regex: searchInput, $options: "$i" } },
//                 { name: { $regex: searchInput, $options: "$i" } },
//                 { price: { $regex: searchInput, $options: "$i" } },
//                 { price: searchPrice },

//             ]
//         }

//     ).toArray();
//     // await changeIdToCategoryName(products, dbo);
//     res.render('index', { books: books })

// })

// async function requiresLogin(req,res,next){
//     console.log(req.cookies)
//     if(req.cookies.userId){
//         return next()
//     }else{
//         res.redirect('/login')
//     }

//     var dbo = await getDatabase();
//     const user = await dbo.collection('Customer').findOne({_id: ObjectId(req.cookies.userId)});

//     if(!user){

//         res.redirect('/login')
//         return;
//     }

//     next();

// }

app.get('/register', async (req, res) => {
    const category = await categories()

    res.render('register', { category: category, totalProduct: totalProduct })
})

app.get('/product', async (req, res) => {

    const collectionName = 'Book'

    const books = await getAllDocumentsFromCollection(collectionName);

    // await changeIdToCategoryName(products, dbo);

    res.render('product', { books: books })
})

app.get('/category', async (_req, res) => {

    const collectionName = 'Category'

    const category = await getAllDocumentsFromCollection(collectionName);

    res.render('category', { category: category })
})

app.post('/register', async (req, res) => {
    const fullName = req.body.txtName
    const email = req.body.txtEmail
    const password = req.body.txtPassword
    const rePassword = req.body.txtRePassword
    const phone = req.body.txtPhone
    const address = req.body.txtAddress
    const date = req.body.txtDate.toString()

    const category = await categories()

    const dbo = await getDatabase();
    const collectionName = 'Customer'
    var checkEmail = await dbo.collection(collectionName).findOne({ email: email });

    if (checkEmail) {
        const err = 'Duplicate this email in the system. Please re-enter your email'
        res.render('register', { category: category, totalProduct: totalProduct, err: err })
        return;
    }

    const newUser = {
        fullName: fullName, email: email, password: password, phoneNumber: phone,
        dateOfBirth: date, address: address
    }


    await insertObjectToCollection(collectionName, newUser)

    res.redirect('/login')

})

app.get('/cart', async (req, res) => {
    const category = await categories()

    res.render('cart', { category: category })

})


app.get('/shoppingCart', requireAuth, async (req, res) => {
    const category = await categories();

    const products = req.session["cart"].toArray();

    res.render('shoppingCart', { category: category, totalProduct: totalProduct, products: products })


})


var totalProduct = 0;
app.post('/shoppingCart', requireAuth, async (req, res) => {
    const product = req.body.idProduct
    var quantity = parseInt(req.body.quantity)
    totalProduct += quantity
    //lay gio hang trong session

    let cart = req.session["cart"]

    //chua co gio hang trong session, day se la sp dau tien
    if (!cart) {
        let dict = {}
        dict[product] = quantity
        req.session["cart"] = dict
        console.log("Ban da mua:" + product + ", so luong: " + dict[product])
    } else {
        dict = req.session["cart"]
        //co lay product trong dict
        var oldProduct = dict[product]
        //kiem tra xem product da co trong Dict
        if (!oldProduct)
            dict[product] = quantity
        else {
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


    res.redirect('/proDetail?id=' + idProduct);
})



app.get('/proDetail', async (req, res) => {
    const id = req.query.id

    const dbo = await getDatabase();
    const product = await dbo.collection('Book').findOne({ _id: ObjectId(id) });

    const categoryProduct = await CategoryProduct(product.categoryId);

    const category = await categories()
    res.render('proDetail', { category: category, product: product, categoryProduct: categoryProduct, totalProduct: totalProduct })

})

// app.get('/search', async (req, res) => {

//     res.render('search')

// })

// app.get('/delete', async (req, res) => {
//     const id = req.query.id
//     const collectionName = 'Products'
//     const db = await getDatabase()
//     const result = await db.collection(collectionName).findOne({ _id: ObjectId(id) })

//     const products = await getAllDocumentsFromCollection(collectionName);
//     await changeIdToCategoryName(products, dbo);

//     console.log(result.price);
//     var err2 = "Product cannot be deleted when price is greater than 10"
//     if (result.price >= 10) {
//         console.log(result.price);
//         res.render("product", {err2: err2, products:products})
//         return
//     } else {
//         await deleteProduct(collectionName, id)
//         console.log("Id of Product to delete is:" + id)
//         res.redirect("/product")
//     }

// })

app.get('/deleteCategory', async (req, res) => {
    const id = req.query.id

    const collectionName = 'Category'
    await deleteProduct(collectionName, id)
    console.log("Id  of Category to delete is:" + id)
    res.redirect("/category")
})

app.post('/insertP', async (req, res) => {

    const productName = req.body.txtName
    const productCategory = req.body.category
    const productPrice = req.body.txtPrice
    const productDescription = req.body.txtDescription
    const productImg = req.body.txtImage

    const collectionName = 'Products'
    const categories = await getAllDocumentsFromCollection('Category')

    if (productName === "" || productCategory === "" || productPrice === "" || productImg === "") {
        const errorMessage = "Value cannot be empty! Please try again!"
        const oldValues = {
            name: productName, category: productCategory, price: productPrice,
            description: productDescription, image: productImg
        }
        res.render('insertP', { error: errorMessage, oldValues: oldValues, categories: categories })
        return;
    }

    if (isNaN(productPrice) == true) {

        const errorMessage = "Price must be number!"
        const oldValues = {
            name: productName, category: productCategory, price: productPrice,
            description: productDescription, image: productImg
        }
        res.render('insertP', { error2: errorMessage, oldValues: oldValues, categories: categories })
        return;
    }

    if (!productImg.startsWith("https://") && !productImg.startsWith("http://")) {
        const errorMessage = "URL image must start with: https://"
        const oldValues = {
            name: productName, category: productCategory, price: productPrice,
            description: productDescription, image: productImg
        }
        res.render('insertP', { error3: errorMessage, oldValues: oldValues, categories: categories })
        return;
    }
    var confirmInsert = "Insert product successfully "
    try {

        const newP = {
            name: productName, category: productCategory, price: Number.parseFloat(productPrice),
            description: productDescription, image: productImg
        }
        await insertObjectToCollection(collectionName, newP);
    } catch (error) {

        confirmInsert = "Product Insert failed";
    }
    res.render('insertP', { confirmInsert: confirmInsert, categories: categories })

})

app.post('/insertCategory', async (req, res) => {

    const categoryName = req.body.txtName
    const categoryImg = req.body.txtImage

    if (categoryName === "" || categoryImg === "") {
        const errorMessage = "Value cannot be empty! Please try again!"
        const oldValues = {
            name: categoryName, image: categoryImg
        }
        res.render('insertCat', { error: errorMessage, oldValues: oldValues })
        return;
    }

    if (!categoryImg.startsWith("https://") && !categoryImg.startsWith("http://")) {
        const errorMessage = "URL image must start with: https:// OR http://"
        const oldValues = {
            name: categoryName, image: categoryImg
        }
        res.render('insertCat', { error3: errorMessage, oldValues: oldValues })
        return;
    }
    const dbo = await getDatabase();
    const collectionName = 'Category'
    const query = await dbo.collection(collectionName).findOne({ name: categoryName })

    if (query != null) {
        const errorMessage = "Duplicate category name"
        const oldValues = {
            name: categoryName, image: categoryImg
        }
        res.render('insertCat', { duplicate: errorMessage, oldValues: oldValues })
        return;
    }
    var confirmInsert = "Insert category successfully"
    try {
        const newCat = {
            name: categoryName, image: categoryImg
        }
        const result = await dbo.collection(collectionName).insertOne(newCat)
        console.log("The newly category inserted id value is: ", result.insertedId.toHexString());
    } catch (error) {

        confirmInsert = "Category Insert failed";
    }

    res.render('insertCat', { confirmInsert: confirmInsert })

})

// SEARCH SAN PHAM
app.post('/search', async (req, res) => {

    const searchInput = req.body.txtSearch;
    const searchPrice = Number.parseFloat(searchInput);


    const collectionName = 'Products'
    const dbo = await getDatabase();
    // const result = await dbo.collection(collectionName).find({$or:[{_id:ObjectId(searchInput)},{name: searchInput}, {category: }]});

    const products = await dbo.collection(collectionName).find(
        {
            $or: [
                { _id: { $regex: searchInput, $options: "$i" } },
                { name: { $regex: searchInput, $options: "$i" } },
                { price: { $regex: searchInput, $options: "$i" } },
                { price: searchPrice },

            ]
        }

    ).toArray();
    await changeIdToCategoryName(products, dbo);
    res.render('search', { products: products })

})




app.post('/searchCat', async (req, res) => {

    const searchInput = req.body.txtSearch;

    const collectionName = 'Category'
    const dbo = await getDatabase();
    // const result = await dbo.collection(collectionName).find({$or:[{_id:ObjectId(searchInput)},{name: searchInput}, {category: }]});
    console.log(searchInput);
    const categories = await dbo.collection(collectionName).find(
        {
            $or: [

                { name: { $regex: searchInput, $options: "$i" } },
            ]
        }

    ).toArray();

    res.render('searchCat', { categories: categories })

})

app.get('/searchCat', async (_req, res) => {

    res.render('searchCat')
})

app.get('/insertP', async (_req, res) => {

    const collectionName = 'Category'
    const categories = await getAllDocumentsFromCollection(collectionName)
    res.render('insertP', { categories: categories })

})

app.get('/insertCategory', async (_req, res) => {


    res.render('insertCat')

})

app.post('/edit', async (req, res) => {
    const id = req.body.txtId;

    const productName = req.body.txtName
    const productCategory = req.body.category
    const productPrice = req.body.txtPrice
    const productDescription = req.body.txtDescription
    const productImg = req.body.txtImage

    const collectionName = 'Products'



    const newvalues = {
        $set: {
            name: productName, category: productCategory, price: Number.parseFloat(productPrice),
            description: productDescription, image: productImg
        }

    }
    await updateCollection(id, collectionName, newvalues);

    console.log("Update product successfully ");

    res.redirect('/product')

})

app.get('/edit', async (req, res) => {
    const id = req.query.id

    const collectionName = "Products";
    const productToEdit = await getDocumentById(collectionName, id);

    const dbo = await getDatabase();
    const categories = await dbo.collection('Category').find({}).toArray()
    res.render('edit', { product: productToEdit, categories: categories })

})

app.post('/editCat', async (req, res) => {
    const id = req.body.txtId;

    const productName = req.body.txtName
    const productImg = req.body.txtImage

    const myquery = { _id: ObjectId(id) }

    const newvalues = {
        $set: { name: productName, image: productImg }

    }
    const dbo = await getDatabase();
    await dbo.collection('Category').updateOne(myquery, newvalues)

    console.log("Update category successfully ");

    res.redirect('/category')

})

app.get('/editCategory', async (req, res) => {
    const id = req.query.id

    const collectionName = "Category";
    const categoryToEdit = await getDocumentById(collectionName, id);

    res.render('editCat', { category: categoryToEdit })

})


async function categories() {
    const collectionName = 'Category'
    const category = await getAllDocumentsFromCollection(collectionName)
    return category
}

async function CategoryProduct(category) {
    const collectionName = 'Category'
    const dbo = await getDatabase();

    const CategoryProduct = await dbo.collection(collectionName).findOne({ _id: ObjectId(category) })

    return CategoryProduct
}

async function changeIdToCategoryName(products, dbo) {
    const count = products.length;

    for (let i = 0; i < count; i++) {
        const category = await dbo.collection('Category').findOne({ _id: ObjectId(products[i].category) });
        products[i].category = category.name;
    }
}

async function requireAuth(req, res, next) {
    var id = req.cookies.userId
    console.log(id)
    if (!req.cookies.userId) {
        res.redirect('/login');
        return;
    }
    const dbo = await getDatabase();

    var user = await dbo.collection('Customer').findOne({ _id: ObjectId(id) });
    console.log(user)

    if (!user) {
        res.redirect('/login');
        return;
    }

    next();

}

const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)



