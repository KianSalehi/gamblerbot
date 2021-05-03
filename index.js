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
//Listener function for the games
client.on('message', async msg =>{
    if (msg.author.bot) return;
    if (!msg.content.toLowerCase().startsWith('-'))return;
    let discordID = msg.author.id;
    let discordUsername = msg.author.username;

    if (msg.content.toLowerCase().startsWith('-crash')){
            await checkRegistered(discordID, discordUsername)
            let amount = msg.content.split(' ')[1];
            await crash(msg, amount);

    }

    else if (msg.content.toLowerCase().startsWith('-blackjack')){
            await checkRegistered(discordID, discordUsername);
            let amount = msg.content.split(' ')[1];
            await blackjack(msg, amount);

    }
    else if (msg.content.toLowerCase().startsWith('-guess')){
        await checkRegistered(discordID, discordUsername);
        let amount = msg.content.split(' ')[2];
        let number = msg.content.split(' ')[1];
        await guessLower(msg, number, amount);
    }

    else if (msg.content.toLowerCase()==='-balance'){
         await checkRegistered(discordID, discordUsername);
         await balance(msg);

    }
    else if (msg.content.toLowerCase()==='-dig'){
        await checkRegistered(discordID, discordUsername);
        await dig(msg);

    }
    else if (msg.content.toLowerCase()==='-help'){
        let url = "https://github.com/KianSalehi/gambler-bot";
        await msg.reply(":interrobang: To look over the commands, please visit the Github page!\n" + url)
    }
});

async function crash (msg, amount){
    let discordID = msg.author.id;
    let discordUsername = msg.author.username;
    let balance = await getBalance(discordID);
    let dig = await getDig(discordID);
    if (amount === "all"){
        amount = balance;
    }
    amount = parseInt(amount);
    if((amount==undefined) || isNaN(amount)){
        msg.reply("Please enter a valid amount");
        return;
    }
    if ((balance < amount) || (parseInt(balance) === 0)){
        msg.reply('You do not have enough money!');
        return;
    }

    let stop = ((Math.random()*5)).toFixed(1);
    stop = parseFloat(stop);
    console.log(stop);
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
        .addField("How to play", `-stop: To stop before crash`);

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
                    .addField("How to play", `-stop: To stop before crash`);
                crashMessage.edit(replyEmbed);

                if (multiplier >= stop){
                    clearInterval(refreshID);
                    replyEmbed = new Discord.MessageEmbed()
                        .setColor('RED')
                        .setTitle("Crash")
                        .setDescription(`<@${discordID}> you have lost $${amount}`)
                        .addFields(
                            {inline: true, name:'Multiplier ', value: `${multiplier}x` },
                            {inline: true, name:"Profit: ", value: `$${newProfit}`}

                        )
                        .addField("Balance", `$${balance-loss}`);
                    crashMessage.edit(replyEmbed);
                    updateMoney(discordID, discordUsername, (balance-loss), dig);
                }
                },2000);

            client.on('message', (msg)=>{
               if (msg.content.toLowerCase()==="-stop" && !(multiplier>=stop) && msg.author.id === discordID){
                   clearInterval(refreshID);
                   replyEmbed = new Discord.MessageEmbed()
                       .setColor('GREEN')
                       .setTitle("Crash")
                       .setDescription(`<@${discordID}> you have won $${amount}`)
                       .addFields(
                           {inline: true, name:'Multiplier ', value: `${multiplier}x` },
                           {inline: true, name:"Profit: ", value: `$${newProfit}`}

                       )
                       .addField("Balance", `$${balance+newProfit}`);
                   crashMessage.edit(replyEmbed);
                   updateMoney(discordID,discordUsername,(balance+newProfit), dig);
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
    let dig = await  getDig(discordID);
    let hasHit= false;
    if (amount === "all"){
        amount = balance;
    }
    amount = parseInt(amount);
    let profit = 2*amount;
    if((amount==undefined) || isNaN(amount)){
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
    let userArray = [userSecond.number,userFirst.number];
    userSum = blackjackSum(userArray);

    let botFirst = blackjackHelper();
    let botHand = botFirst.shape+botFirst.number;
    let botSum = 0;
    let botArray=[botFirst.number];
    botSum = blackjackSum(botArray);

    let replyEmbed = new Discord.MessageEmbed()
        .setColor('BLUE')
        .setTitle("BlackJack")
        .setDescription(`<@${discordID}> you have bet $${amount}`)
        .addFields(
            {inline: true, name:'Your hand: ', value: `${userHand} \n sum = ${userSum}` },
            {inline: true, name:"Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}

        )
        .addField("How to play", `-hit: Draw a card \n -stand: Dealer's turn \n -double: Double your bet and draw an additional card`);

    msg.channel.send(replyEmbed).then((embedMessage)=>{
            client.on('message', (msg) => {
                if ((msg.content.toLowerCase() === "-hit") && (msg.author.id === discordID) && (holder == true)) {
                    hasHit = true;
                    let next = blackjackHelper();
                    userHand = userHand + next.shape + next.number;
                    userArray.push(next.number);
                    userSum = blackjackSum(userArray);
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
                        updateMoney(discordID, discordUsername, (balance - amount), dig);
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
                        updateMoney(discordID, discordUsername, (balance + profit), dig);
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
                            .addField("How to play", `-hit: Draw a card \n -stand: Dealer's turn \n -double: Double your bet and draw an additional card`);
                        embedMessage.edit(replyEmbed);
                    }
                } else if ((msg.content.toLowerCase() === "-stand") && (msg.author.id === discordID) && (holder == true)) {
                    let secondCondition = true
                    while (secondCondition) {
                        let next = blackjackHelper();
                        botHand = botHand + next.shape + next.number;
                        botArray.push(next.number);
                        botSum = blackjackSum(botArray);
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
                            updateMoney(discordID, discordUsername, (balance + profit), dig);
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
                            updateMoney(discordID, discordUsername, (balance - amount), dig);
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
                            updateMoney(discordID, discordUsername, (balance - amount), dig);
                            secondCondition = false;
                            holder = false;
                        }
                    }
                }
                else if ((msg.content.toLowerCase() === "-double") && (msg.author.id === discordID) && (holder == true)) {
                    if (hasHit === false) {
                        let secondCondition = true;
                        amount = 2 * amount;
                        profit = 2 * profit;
                        let next = blackjackHelper();
                        userHand = userHand + next.shape + next.number;
                        userArray.push(next.number);
                        userSum = blackjackSum(userArray);
                        if (userSum > 21) {
                            replyEmbed = new Discord.MessageEmbed()
                                .setColor('RED')
                                .setTitle("BlackJack")
                                .setDescription(`<@${discordID}> you lost $${amount}`)
                                .addFields(
                                    {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                    {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                                )
                                .addField("Balance", `${balance - amount}`);
                            embedMessage.edit(replyEmbed);
                            updateMoney(discordID, discordUsername, (balance - amount), dig);
                            holder = false;
                            secondCondition = false;
                        } else if (userSum === 21) {
                            replyEmbed = new Discord.MessageEmbed()
                                .setColor('GREEN')
                                .setTitle("BlackJack")
                                .setDescription(`<@${discordID}> you have won $${profit}`)
                                .addFields(
                                    {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                    {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                                )
                                .addField("Balance", `$${balance + profit}`);
                            embedMessage.edit(replyEmbed);
                            updateMoney(discordID, discordUsername, (balance + profit), dig);
                            holder = false;
                            secondCondition = false;
                        }
                        while (secondCondition) {
                            let next = blackjackHelper();
                            botHand = botHand + next.shape + next.number;
                            botArray.push(next.number);
                            botSum = blackjackSum(botArray);
                            if (botSum > 21) {
                                replyEmbed = new Discord.MessageEmbed()
                                    .setColor('GREEN')
                                    .setTitle("BlackJack")
                                    .setDescription(`<@${discordID}> you have won $${profit}`)
                                    .addFields(
                                        {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                        {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                                    )
                                    .addField("Balance", `$${balance + profit}`);
                                embedMessage.edit(replyEmbed);
                                updateMoney(discordID, discordUsername, (balance + profit), dig);
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
                                    .addField("Balance", `$${balance - amount}`);
                                embedMessage.edit(replyEmbed);
                                updateMoney(discordID, discordUsername, (balance - amount), dig);
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
                                    ).addField("Balance", `$${balance - amount}`);
                                embedMessage.edit(replyEmbed);
                                updateMoney(discordID, discordUsername, (balance - amount), dig);
                                secondCondition = false;
                                holder = false;
                            }
                        }
                    }
                }
        });
    });
}

//Blackjack helper function to get the sum of cards
function blackjackSum(hand) {
    let sum = 0;
    let counterA = 0;
    for (let i=0;i<hand.length;i++){
        if (hand[i]==="A"){
            sum = sum +1;
            counterA++;
        }
        else if ((hand[i]==="K")||(hand[i]==="Q")||(hand[i]==="J")){
            sum = sum + 10;
        }
        else{
            sum = sum + parseInt(hand[i]);
        }
    }
    if (counterA > 0){
        let condition = true
        while (condition){
            if (sum > 10){
                condition = false
            }
            else if(sum<=10){
                sum = sum + 10;
            }
        }
    }
    return sum;

}

//blackjack helper function to get a random card
function blackjackHelper(){
    let shape= [':clubs:',':hearts:', ':diamonds:', ':spades:']
    let numbers = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
    let guessNumber = (Math.random()*12).toFixed(0);
    let randomShape = (Math.random()*3).toFixed(0);
    let returnNumber = numbers[parseFloat(guessNumber)];
    let returnShape = shape[parseFloat(randomShape)];
    return {
        number:returnNumber,
        shape:returnShape
    }

}
async function guessLower(msg, number, amount){
    let discordID = msg.author.id;
    let discordName = msg.author.username;
    let balance = await getBalance(discordID);
    let dig = await  getDig(discordID);
    if (amount === "all"){
        amount = balance;
    }
    amount = parseInt(amount);
    number = parseInt(number);
    if((number===undefined) || (isNaN(number)) || (number>100) || (number<0)){
        msg.reply("Please enter a valid number between 0-100");
        return;
    }
    if((amount===undefined) || (isNaN(amount))){
        msg.reply("Please enter a valid amount");
        return;
    }
    if ((balance < amount) || (parseInt(balance) === 0)){
        msg.reply("You do not have enough money!");
        return;
    }

    let randomNumber = ((Math.random()*100)+1).toFixed(0);
    randomNumber = parseInt(randomNumber);
    let difference = number - randomNumber;
    if (difference<0){
        let replyEmblem = new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("Guess Lower!")
            .setDescription(`<@${discordID}>, You have lost $${amount}`)
            .addFields(
                {name:"Bot guessed:", value:`${randomNumber}`, inline:true},
                {name:"You guessed:", value:`${number}`, inline:true})
            .addField("Balance", `$${balance-amount}`);
        msg.reply(replyEmblem);
        await updateMoney(discordID, discordName, (balance-amount), dig);
        return;
    }
    else if ((difference>0) && (difference <= 10)){
        let profit = amount *1
        let replyEmblem = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle("Guess Lower!")
            .setDescription(`<@${discordID}>, You have Won $${profit}`)
            .addFields(
                {name:"Bot guessed:", value:`${randomNumber}`, inline:true},
                {name:"You guessed:", value:`${number}`, inline:true})
            .addField("Balance", `$${balance+profit}`);
        msg.reply(replyEmblem);
        await updateMoney(discordID, discordName, (balance+profit), dig);
        return;
    }
    else if ((difference>10) && (difference <= 20)){
        let profit = amount *0.7
        let replyEmblem = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle("Guess Lower!")
            .setDescription(`<@${discordID}>, You have Won $${profit}`)
            .addFields(
                {name:"Bot guessed:", value:`${randomNumber}`, inline:true},
                {name:"You guessed:", value:`${number}`, inline:true})
            .addField("Balance", `$${balance+profit}`);
        msg.reply(replyEmblem);
        await updateMoney(discordID, discordName, (balance+profit), dig);
        return;
    }
    else if ((difference>20) && (difference <= 30)){
        let profit = amount *0.5
        let replyEmblem = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle("Guess Lower!")
            .setDescription(`<@${discordID}>, You have Won $${profit}`)
            .addFields(
                {name:"Bot guessed:", value:`${randomNumber}`, inline:true},
                {name:"You guessed:", value:`${number}`, inline:true})
            .addField("Balance", `$${balance+profit}`);
        msg.reply(replyEmblem);
        await updateMoney(discordID, discordName, (balance+profit), dig);
        return;
    }
    else if ((difference>30) && (difference <= 40)){
        let profit = amount *0.25
        let replyEmblem = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle("Guess Lower!")
            .setDescription(`<@${discordID}>, You have Won $${profit}`)
            .addFields(
                {name:"Bot guessed:", value:`${randomNumber}`, inline:true},
                {name:"You guessed:", value:`${number}`, inline:true})
            .addField("Balance", `$${balance+profit}`);
        msg.reply(replyEmblem);
        await updateMoney(discordID, discordName, (balance+profit), dig);
        return;
    }
    else if ((difference>40) && (difference <= 50)){
        let profit = amount *0.15
        let replyEmblem = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle("Guess Lower!")
            .setDescription(`<@${discordID}>, You have Won $${profit}`)
            .addFields(
                {name:"Bot guessed:", value:`${randomNumber}`, inline:true},
                {name:"You guessed:", value:`${number}`, inline:true})
            .addField("Balance", `$${balance+profit}`);
        msg.reply(replyEmblem)
        await updateMoney(discordID, discordName, (balance+profit), dig);
        return;
    }
    else if (difference>50){
        let profit = amount *0.05
        await updateMoney(discordID, discordName, (balance+profit), dig);
        let replyEmblem = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle("Guess Lower!")
            .setDescription(`<@${discordID}>, You have Won $${profit}`)
            .addFields(
                {name:"Bot guessed:", value:`${randomNumber}`, inline:true},
                {name:"You guessed:", value:`${number}`, inline:true})
            .addField("Balance", `$${balance+profit}`);
        msg.reply(replyEmblem)
        return;
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
        let random=[2500,5000,3000,1000];
        let extraMoney = (Math.random()*3).toFixed(0);
        extraMoney = parseInt(extraMoney);
        extraMoney = random[extraMoney];
        msg.reply(`You found $${extraMoney}!`);
        await updateMoney(discordID, discordName, (balance+extraMoney), dig);
        let wait = setInterval(()=>{
            balance = getBalance(discordID);
            dig = false;
            updateMoney(discordID, discordName, balance, dig)
            clearInterval(wait);
        },43200000)
    }
    else{
        msg.reply("You have already claimed your free chance, please wait 12 hrs!");}

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
        }
        if (client){
            await client.close();
        }
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
        if (client){client.close();}

    });
}
// function to get the balance of the user
async function getBalance(discordID){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let client = await MClient.connect();
        let query = await client.db("GamblerBot").collection("users").findOne({discordID:discordID});
        if (client){ client.close();}
        return query.money;

}
// function to check if the free money is received
async function getDig(discordID){
    const MClient = new MongoClient(MongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let client = await MClient.connect();
    let query = await client.db("GamblerBot").collection("users").findOne({discordID:discordID});
    if (client){ client.close();}
    return query.dig;
}