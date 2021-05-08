const MongoClient = require('mongodb').MongoClient;
const secret = require('../secrets.json');
const MongoUri = `mongodb+srv://${secret.MongoDBUser}:${secret.MongoDBPass}@cluster0.7aovf.mongodb.net/GamblerBot?retryWrites=true&w=majority`

// function to update the balance of the user
async function updateMoney(discordID, discordName, newMoney, dig, inGame) {
    const MClient = new MongoClient(MongoUri, {useNewUrlParser: true, useUnifiedTopology: true});
    let newUpdate = {
        name: discordName,
        discordID: discordID,
        money: newMoney,
        dig: dig,
        inGame: inGame
    }
    await MClient.connect(async (err, client) => {
        await client.db("GamblerBot").collection("users").updateOne({discordID: discordID}, {$set: newUpdate});
        if (client) {
            client.close();
        }

    });
}

module.exports = {updateMoney}