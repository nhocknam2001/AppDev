// const express = require('express')
// const app = express()
// // const { ObjectId } = require('mongodb')
// const {getDatabase, deleteProduct, getAllDocumentsFromCollection,
//     getDocumentById, insertObjectToCollection, updateCollection} = require('../databaseHandler')

// const cookieParser = require('cookie-parser')

// async function requireAuth(req,res,next) {
//     var id = req.cookies.userId
//     console.log(id)
//     if(!req.cookies.userId) {
//         res.redirect('/login');
//         return;
//     }
//     const dbo = await getDatabase();

//     var user = await dbo.collection('Customer').findOne({id});

//     if(!user){
//         res.redirect('/login');
//         return;
//     }

//     next();

// }

// module.exports = requireAuth()