const {MongoClient,ObjectId} = require('mongodb');

const URL = 'mongodb+srv://binhdq:abc@123@cluster0-lkrga.mongodb.net/test?retryWrites=true&w=majority';
const DATABASE_NAME = "GCH0902-ApplicationDev"

async function insertObject(collectionName,objectToInsert){
    const dbo = await getDB();
    const newObject = await dbo.collection(collectionName).insertOne(objectToInsert);
    console.log("Gia tri id moi duoc insert la: ", newObject.insertedId.toHexString());
}

module.exports = {insertObject}
