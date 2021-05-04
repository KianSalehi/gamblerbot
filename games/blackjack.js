const updateMoney = require('../helpers/updateMoney');
const Discord = require('discord.js');

//function for blackjack
async function blackjack(msg, amount, balance, dig, client){
    let holder = true;
    let discordID = msg.author.id;
    let discordUsername = msg.author.username;
    let hasHit= false;
    if (amount === "all"){
        amount = balance;
    }
    amount = parseInt(amount);
    let profit = 2*amount;
    if((amount===undefined) || isNaN(amount)){
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
            if ((msg.content.toLowerCase() === "-hit") && (msg.author.id === discordID) && (holder === true)) {
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
                    updateMoney.updateMoney(discordID, discordUsername, (balance - amount), dig);
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
                    updateMoney.updateMoney(discordID, discordUsername, (balance + profit), dig);
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
            } else if ((msg.content.toLowerCase() === "-stand") && (msg.author.id === discordID) && (holder === true)) {
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
                        updateMoney.updateMoney(discordID, discordUsername, (balance + profit), dig);
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
                        updateMoney.updateMoney(discordID, discordUsername, (balance - amount), dig);
                        secondCondition = false;
                        holder = false;
                    } else if (botSum > userSum && botSum >= 17) {
                        replyEmbed = new Discord.MessageEmbed()
                            .setColor('RED')
                            .setTitle("BlackJack")
                            .setDescription(`<@${discordID}> you have lost $${amount}`)
                            .addFields(
                                {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                            ).addField("Balance", `$${balance-amount}`);
                        embedMessage.edit(replyEmbed);
                        updateMoney.updateMoney(discordID, discordUsername, (balance - amount), dig);
                        secondCondition = false;
                        holder = false;
                    }
                }
            }
            else if ((msg.content.toLowerCase() === "-double") && (msg.author.id === discordID) && (holder === true)) {
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
                        updateMoney.updateMoney(discordID, discordUsername, (balance - amount), dig);
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
                        updateMoney.updateMoney(discordID, discordUsername, (balance + profit), dig);
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
                            updateMoney.updateMoney(discordID, discordUsername, (balance + profit), dig);
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
                            updateMoney.updateMoney(discordID, discordUsername, (balance - amount), dig);
                            secondCondition = false;
                            holder = false;
                        } else if (botSum > userSum && botSum >=17) {
                            replyEmbed = new Discord.MessageEmbed()
                                .setColor('RED')
                                .setTitle("BlackJack")
                                .setDescription(`<@${discordID}> you have lost $${amount}`)
                                .addFields(
                                    {inline: true, name: 'Your hand: ', value: `${userHand} \n sum = ${userSum}`},
                                    {inline: true, name: "Dealer's hand: ", value: `${botHand}\n sum = ${botSum}`}
                                ).addField("Balance", `$${balance - amount}`);
                            embedMessage.edit(replyEmbed);
                            updateMoney.updateMoney(discordID, discordUsername, (balance - amount), dig);
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

module.exports = {blackjack}