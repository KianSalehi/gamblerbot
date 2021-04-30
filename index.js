const Discord = require('discord.js');
const MongoClient = require('mongodb').MongoClient;
const secret = require('./secrets.json');
const client = new Discord.Client();
const MongoUri = `mongodb+srv://${secret.MongoDBUser}:${secret.MongoDBPass}@cluster0.7aovf.mongodb.net/GamblerBot?retryWrites=true&w=majority`
//Discord client login
client.login(secret["client-Secret"]);

client.once('ready',()=>{
    console.log(`Bot is ready as ${client.user.tag}!`);
});

client.on('message', async msg =>{
    if (msg.author.bot) return;
    if (!msg.content.toLowerCase().startsWith(';;'))return;
    let discordID = msg.author.id;
    let discordUsername = msg.author.username;

    if (msg.content.toLowerCase().startsWith(';;crash')){
        let registered = await checkRegistered(discordID, discordUsername);
        if (registered == true){
            let amount = msg.content.split(' ')[1];
            await crash(msg, amount);
        }

    }

    if (msg.content.toLowerCase().startsWith(';;blackjack')){
        let registered = await checkRegistered(discordID, discordUsername);
        if (registered == true){
            let amount = msg.content.split(' ')[1];
            await blackjack(msg, amount);
        }
    }

    if (msg.content.toLowerCase().startsWith(';;balance')){
        let registered = await checkRegistered(discordID, discordUsername);
        if (registered == true){
            await balance(msg);
        }
    }
});

async function crash (msg, amount){
    let discordID = msg.author.id;
    let discordUsername = msg.author.username;
    let balance = await getBalance(discordID);
    if ((balance < amount) || (parseInt(balance) == 0)){
        msg.reply('You do not have enough money!');
        return;
    }
    let stop = ((Math.random()*5)).toFixed(1);
    stop = parseFloat(stop);
    console.log(balance);
    console.log(stop);
    let profit = amount;
    let newProfit = 0;
    let loss = amount;
    let multiplier = 1;
    msg.reply(`Crash, User: ${msg.author.username} \n Multiplier:  \n ${multiplier}x \n profit:   \n $${newProfit}`)
        .then((crashMessage)=>{
            let refreshID=setInterval(()=>{
                multiplier = (multiplier + 0.2).toFixed(1);
                multiplier = parseFloat(multiplier);
                newProfit = (multiplier * profit).toFixed(0);
                newProfit = parseFloat(newProfit) - profit;
                crashMessage.edit(`Crash, User: ${msg.author.username} \n Multiplier: \n ${multiplier}x\n profit: \n $${newProfit}`);
                if (multiplier >= stop){
                    clearInterval(refreshID);
                    updateMoney(discordID, discordUsername, (balance-loss));
                    crashMessage.edit(`You've lost!\n Crash, User: ${msg.author.username}\n Balance:\n $${(balance-loss)}`)};
                },2000);
            client.on('message', (msg)=>{
               if (msg.content.toLowerCase()===";;stop" && !(multiplier>=stop) && msg.author.id == discordID){
                   clearInterval(refreshID);
                   updateMoney(discordID,discordUsername,(balance+newProfit));
                   crashMessage.edit(`You Won!\n Crash, User: ${msg.author.username} \n Multiplier: \n ${multiplier}x\n profit:   \n $${newProfit} \n Balance:\n $${(balance+newProfit)}`);

               }
            });
            }

        );

}

async function balance(msg){
    let discordID = msg.author.id;
    let balance = await getBalance(discordID);
    msg.reply(`You have $${balance} in balance.`);
}

async function horse(){}

async function scratch(){}

async function roulette(){}

async function blackjack(msg, amount){
    let discordID = msg.author.id;
    let discordUsername = msg.author.username;
    let balance = await getBalance(discordID);
    if ((balance <amount) || (parseInt(balance) ==0)){
        msg.reply("You do not have enough money!");
        return;
    }
    let clubs = ':clubs:';
    let hearts = ':hearts:';
    let diamonds = ':diamonds:';
    let spades = ':spades:';



}

//Check user and make a new account if it does not exist in the database
function checkRegistered(discordID, discordName){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    //Mongo client log in
    MClient.connect(async (err,client)=>{
        let query = await client.db("GamblerBot").collection("users").findOne({discordID:discordID});
        if (query == null){
            let newUser = {
                name:discordName,
                discordID:discordID,
                money:5000
            }
            await client.db("GamblerBot").collection("users").insertOne(newUser);
        }
        if (client){
            await client.close();
        }

    });
    return true;
}
async function updateMoney(discordID,discordName, newMoney){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let newUpdate = {
        name:discordName,
        discordID:discordID,
        money:newMoney
    }
    await MClient.connect(async (err, client)=>{
        await client.db("GamblerBot").collection("users").updateOne({discordID:discordID},{$set:newUpdate});
        if (client){await client.close();}

    });
}

async function getBalance(discordID){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let client = await MClient.connect();
        let query = await client.db("GamblerBot").collection("users").findOne({discordID:discordID});
        if (client){await client.close();}
        return query.money;

}