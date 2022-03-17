const express = require('express')
const app = express()

//su dung HBS: =>res.render('....')
app.set('view engine', 'hbs')
//lay du lieu tu cac Form: textbox, combobox...
app.use(express.urlencoded({ extended: true }))

app.get('/',(req,res)=>{
    res.render('home')
})

const adminController = require('./controllers/admin')
//tat ca cac dia chi co chua admin: localhost:5000/admin/... => goi controller admin
app.use('/admin', adminController)


const PORT = process.env.PORT || 5000
app.listen(PORT)
console.log("Server is running! " + PORT)