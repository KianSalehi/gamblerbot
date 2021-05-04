const MongoClient = require('mongodb').MongoClient;
const secret = require('../secrets.json');
const MongoUri = `mongodb+srv://${secret.MongoDBUser}:${secret.MongoDBPass}@cluster0.7aovf.mongodb.net/GamblerBot?retryWrites=true&w=majority`

//Check user and make a new account if it does not exist in the database
async function checkRegistered(discordID, discordName){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    //Mongo client log in
    let client= await MClient.connect();
    let query = await client.db("GamblerBot").collection("users").findOne({discordID:discordID});
    if (query == null) {
        let newUser = {
            name: discordName,
            discordID: discordID,
            money: 5000,
            dig: false
        }
        await client.db("GamblerBot").collection("users").insertOne(newUser);
        return {
            balance:5000,
            dig:false
        }
    }
    else{
        return {
            balance:query.money,
            dig:query.dig
        }
    }
    if (client){
        await client.close();
    }
}
module.exports={checkRegistered}