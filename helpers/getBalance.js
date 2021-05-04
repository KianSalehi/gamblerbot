const MongoClient = require('mongodb').MongoClient;
const secret = require('../secrets.json');
const MongoUri = `mongodb+srv://${secret.MongoDBUser}:${secret.MongoDBPass}@cluster0.7aovf.mongodb.net/GamblerBot?retryWrites=true&w=majority`

// function to get the balance of the user
async function getBalance(discordID){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let client = await MClient.connect();
    let query = await client.db("GamblerBot").collection("users").findOne({discordID:discordID});
    if (client){ client.close();}
    return query.money;

}
module.exports={getBalance}