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
            await checkRegistered(discordID, discordUsername);
            let amount = msg.content.split(' ')[1];
            await crash(msg, amount);


    }

    if (msg.content.toLowerCase().startsWith(';;blackjack')){
            await checkRegistered(discordID, discordUsername);
            let amount = msg.content.split(' ')[1];
            await blackjack(msg, amount);

    }

    if (msg.content.toLowerCase()===';;balance'){
         await checkRegistered(discordID, discordUsername);
         await balance(msg);

    }
    if (msg.content.toLowerCase()===';;dig'){
        await checkRegistered(discordID, discordUsername);
        await dig(msg);

    }
});

async function crash (msg, amount){
    let discordID = msg.author.id;
    let discordUsername = msg.author.username;
    let balance = await getBalance(discordID);
    if ((balance < amount) || (parseInt(balance) === 0)){
        msg.reply('You do not have enough money!');
        return;
    }

    let stop = ((Math.random()*5)).toFixed(1);
    stop = parseFloat(stop);

    let profit = amount;
    let newProfit = 0;

    let loss = amount;
    let multiplier = 1;
    let replyEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle("Crash")
        .setDescription(`<@${discordID}> you have bet $${amount}`)
        .addFields(
            {inline: true, name:'Multiplier ', value: `${multiplier}x` },
            {inline: true, name:"Profit: ", value: `$${newProfit}`}

        )
        .addField("How to play", `;;stop: To stop before crash`);

    msg.reply(replyEmbed)
        .then((crashMessage)=>{
            let refreshID=setInterval(()=>{
                multiplier = (multiplier + 0.2).toFixed(1);
                multiplier = parseFloat(multiplier);
                newProfit = (multiplier * profit).toFixed(0);
                newProfit = parseFloat(newProfit) - profit;
                replyEmbed = new Discord.MessageEmbed()
                    .setColor('BLUE')
                    .setTitle("Crash")
                    .setDescription(`<@${discordID}> you have bet $${amount}`)
                    .addFields(
                        {inline: true, name:'Multiplier ', value: `${multiplier}x` },
                        {inline: true, name:"Profit: ", value: `$${newProfit}`}

                    )
                    .addField("How to play", `;;stop: To stop before crash`);
                crashMessage.edit(replyEmbed);

                if (multiplier >= stop){
                    clearInterval(refreshID);
                    updateMoney(discordID, discordUsername, (balance-loss));
                    replyEmbed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle("Crash")
                        .setDescription(`<@${discordID}> you have lost $${amount}`)
                        .addFields(
                            {inline: true, name:'Multiplier ', value: `${multiplier}x` },
                            {inline: true, name:"Profit: ", value: `$${newProfit}`}

                        )
                        .addField("Balance", `${balance-loss}`);
                    crashMessage.edit(replyEmbed);
                }
                },2000);

            client.on('message', (msg)=>{
               if (msg.content.toLowerCase()===";;stop" && !(multiplier>=stop) && msg.author.id === discordID){
                   clearInterval(refreshID);
                   updateMoney(discordID,discordUsername,(balance+newProfit));
                   replyEmbed = new Discord.MessageEmbed()
                       .setColor('GREEN')
                       .setTitle("Crash")
                       .setDescription(`<@${discordID}> you have lost $${amount}`)
                       .addFields(
                           {inline: true, name:'Multiplier ', value: `${multiplier}x` },
                           {inline: true, name:"Profit: ", value: `$${newProfit}`}

                       )
                       .addField("Balance", `${balance+newProfit}`);
                   crashMessage.edit(replyEmbed);
                   return;
               }
            });
            }

        );

}

async function blackjack(msg, amount){
    let holder = true;
    let discordID = msg.author.id;
    let discordUsername = msg.author.username;
    let balance = await getBalance(discordID);
    amount = parseInt(amount);
    let profit = 2*amount;
    if(amount==undefined){
        msg.reply("Please enter a valid amount");
        return;
    }
    if ((balance < amount) || (parseInt(balance) === 0)){
        msg.reply("You do not have enough money!");
        return;
    }
    let userSum = 0;
    let userFirst = blackjackHelper();
    let userSecond = blackjackHelper();
    let userHand = userFirst.shape + userFirst.number + userSecond.shape +userSecond.number;
    userSum = blackjackSum(userSum,userFirst.number,userHand);
    userSum = blackjackSum(userSum, userSecond.number, userHand);

    let botFirst = blackjackHelper();
    let botHand = botFirst.shape+botFirst.number;
    let botSum = 0;
    botSum = blackjackSum(botSum, botFirst.number, botHand);

    let replyEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle("BlackJack")
        .setDescription(`<@${discordID}> you have bet $${amount}`)
        .addFields(
            {inline: true, name:'Your hand: ', value: `${userHand} \n sum = ${userSum}` },
            {inline: true, name:"Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}

        )
        .addField("How to play", `;;hit: Draw a card \n ;;stand: Dealer's turn \n ;;double: Double your bet and draw an additional card`);

    msg.channel.send(replyEmbed).then((embedMessage)=>{
            client.on('message', (msg) => {
                if ((msg.content.toLowerCase() === ";;hit") && (msg.author.id === discordID) && (holder == true)) {
                    let next = blackjackHelper();
                    userHand = userHand + next.shape + next.number;
                    userSum = blackjackSum(userSum, next.number, userHand);
                    if (userSum > 21) {
                        replyEmbed = new Discord.MessageEmbed()
                            .setColor('RED')
                            .setTitle("BlackJack")
                            .setDescription(`<@${discordID}> you lost $${amount}`)
                            .addFields(
                                {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                            )
                            .addField("Balance", `${balance-amount}`);
                        embedMessage.edit(replyEmbed);
                        updateMoney(discordID, discordUsername, (balance - amount));
                        holder = false;

                    } else if (userSum === 21) {
                        replyEmbed = new Discord.MessageEmbed()
                            .setColor('GREEN')
                            .setTitle("BlackJack")
                            .setDescription(`<@${discordID}> you have won $${profit}`)
                            .addFields(
                                {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                            )
                            .addField("Balance", `$${balance+profit}`);
                        embedMessage.edit(replyEmbed);
                        updateMoney(discordID, discordUsername, (balance + profit));
                        holder = false
                    } else {
                        replyEmbed = new Discord.MessageEmbed()
                            .setColor('BLUE')
                            .setTitle("BlackJack")
                            .setDescription(`<@${discordID}> you have bet $${amount}`)
                            .addFields(
                                {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                            )
                            .addField("How to play", `;;hit: Draw a card \n ;;stand: Dealer's turn \n ;;double: Double your bet and draw an additional card`);
                        embedMessage.edit(replyEmbed);
                    }
                } else if ((msg.content.toLowerCase() === ";;stand") && (msg.author.id === discordID) && (holder == true)) {
                    let secondCondition = true
                    while (secondCondition) {
                        let next = blackjackHelper();
                        botHand = botHand + next.shape + next.number;
                        botSum = blackjackSum(botSum, next.number, botHand);
                        if (botSum > 21) {
                            replyEmbed = new Discord.MessageEmbed()
                                .setColor('GREEN')
                                .setTitle("BlackJack")
                                .setDescription(`<@${discordID}> you have won $${profit}`)
                                .addFields(
                                    {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                    {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                                )
                                .addField("Balance", `$${balance+profit}`);
                            embedMessage.edit(replyEmbed);
                            updateMoney(discordID, discordUsername, (balance + profit));
                            secondCondition = false;
                            holder = false;
                        } else if (botSum === 21) {
                            replyEmbed = new Discord.MessageEmbed()
                                .setColor('RED')
                                .setTitle("BlackJack")
                                .setDescription(`<@${discordID}> you have lost $${amount}`)
                                .addFields(
                                    {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                    {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                                )
                                .addField("Balance", `$${balance-amount}`);
                            embedMessage.edit(replyEmbed);
                            updateMoney(discordID, discordUsername, (balance - amount));
                            secondCondition = false;
                            holder = false;
                        } else if (botSum > userSum) {
                            replyEmbed = new Discord.MessageEmbed()
                                .setColor('RED')
                                .setTitle("BlackJack")
                                .setDescription(`<@${discordID}> you have lost $${amount}`)
                                .addFields(
                                    {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                    {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                                ).addField("Balance", `$${balance-amount}`);
                            embedMessage.edit(replyEmbed);
                            updateMoney(discordID, discordUsername, (balance - amount));
                            secondCondition = false;
                            holder = false;
                        }
                    }
                }

        });
    });
}

//Blackjack helper function to get the sum of cards
function blackjackSum(sum, number, hand){
    if (hand.includes("A")){
        if ((number === "J") || (number === "Q") || (number === "K")){
            if ((sum+10>21)){
                return sum;
            }
            else{
                let sNumber = 10;
                return (sum+sNumber);
            }
        }
        else if (number === ("A")){
            if ((sum+10)>21){
                let sNumber = 1;
                return (sum+sNumber);
            }
            else{
                let sNumber = 11;
                return (sum+sNumber);
            }
        }
        else{
            if ((sum+10)>21){
                let sNumber = parseInt(number);
                return (sum+sNumber-10);
            }
            else{
                let sNumber = parseInt(number);
                return (sum+sNumber);
            }
        }
    }
    else{
        if ((number === "J") || (number === "Q") || (number === "K")){
            let sNumber = 10;
            return (sum+sNumber);
        }
        else if (number === ("A")){
            if ((sum+10)>21){
                let sNumber = 1;
                return (sum+sNumber);
            }
            else{
                let sNumber = 11;
                return (sum+sNumber);
            }
        }
        else{
            let sNumber = parseInt(number);
            return (sum+sNumber);
        }
    }

}

//blackjack helper function to get a random card
function blackjackHelper(){
    let shape= [':clubs:',':hearts:', ':diamonds:', ':spades:']
    let numbers = ["1","2","3","4","5","6","7","8","9","10","J","Q","K","A"];
    let guessNumber = (Math.random()*13).toFixed(0);
    let randomShape = (Math.random()*3).toFixed(0);
    let returnNumber = numbers[parseFloat(guessNumber)];
    let returnShape = shape[parseFloat(randomShape)];
    return {
        number:returnNumber,
        shape:returnShape
    }

}

//async function fight(){}

//async function horse(){}

//async function scratch(){}

//async function roulette(){}

//function to get some money
async function dig(msg){
    let discordID = msg.author.id;
    let discordName = msg.author.username;
    let balance = await getBalance(discordID);
    let dig = await getDig(discordID);
    if (dig === false){
        dig = true;
        await updateMoney(discordID, discordName, (balance+5000), dig);
        msg.reply("You found $5000!");
        let wait = setInterval(()=>{
            balance = getBalance(discordID);
            dig = false;
            updateMoney(discordID, discordName, balance, dig)
            clearInterval(wait);
        },43200000)
    }
    else{msg.reply("You have already claimed your free chance, please wait 12 hrs!")}

}

//function to show the balance
async function balance(msg){
    let discordID = msg.author.id;
    let balance = await getBalance(discordID);
    msg.reply(`You have $${balance} in balance.`);
}

//Check user and make a new account if it does not exist in the database
async function checkRegistered(discordID, discordName){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    //Mongo client log in
    await MClient.connect(async (err,client)=>{
        let query = await client.db("GamblerBot").collection("users").findOne({discordID:discordID});
        if (query == null) {
            let newUser = {
                name: discordName,
                discordID: discordID,
                money: 5000,
                dig: false
            }
            await client.db("GamblerBot").collection("users").insertOne(newUser);
            console.log("test2");
        }
        if (client){
            await client.close();
        }

    });
}
// function to update the balance of the user
async function updateMoney(discordID,discordName, newMoney, dig){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let newUpdate = {
        name:discordName,
        discordID:discordID,
        money:newMoney,
        dig: dig
    }
    await MClient.connect(async (err, client)=>{
        await client.db("GamblerBot").collection("users").updateOne({discordID:discordID},{$set:newUpdate});
        if (client){await client.close();}

    });
}
// function to get the balance of the user
async function getBalance(discordID){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let client = await MClient.connect();
        let query = await client.db("GamblerBot").collection("users").findOne({discordID:discordID});
        if (client){await client.close();}
        return query.money;

}
// function to check if the free money is received
async function getDig(discordID){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let client = await MClient.connect();
    let query = await client.db("GamblerBot").collection("users").findOne({discordID:discordID});
    if (client){await client.close();}
    return query.dig;
}