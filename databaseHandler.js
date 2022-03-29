const async = require('hbs/lib/async');
const {MongoClient,ObjectId} = require('mongodb');

const URL = 'mongodb://tommy:123456789mu@cluster0-shard-00-00.lkrga.mongodb.net:27017,cluster0-shard-00-01.lkrga.mongodb.net:27017,cluster0-shard-00-02.lkrga.mongodb.net:27017/test?replicaSet=Cluster0-shard-0&ssl=true&authSource=admin';
const DATABASE_NAME = "GCH0902-ApplicationDev"

async function getDB() {
    const client = await MongoClient.connect(URL);
    const dbo = client.db(DATABASE_NAME);
    return dbo;
}

async function insertObject(collectionName,objectToInsert){
    const dbo = await getDB();
    const newObject = await dbo.collection(collectionName).insertOne(objectToInsert);
    console.log("Gia tri id moi duoc insert la: ", newObject.insertedId.toHexString());
}

async function  checkUserRole(nameI,passI){
    const dbo = await getDB();

    const user= await dbo.collection(USER_TABLE_NAME).findOne({userName:nameI,password:passI});
    //Neu khong trung user name va password
    if (user==null) {
        return "-1"
    }else{
        console.log(user)
        //tra lai: role cua user: admin hoac staff
        return user.role;
    }
}

const USER_TABLE_NAME = "Users"

module.exports = {insertObject,checkUserRole,USER_TABLE_NAME}
