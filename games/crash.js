const updateMoney = require('../helpers/updateMoney');
const Discord = require('discord.js');
const setInGame = require('../helpers/setInGame');

//function for crash
async function crash(msg, amount, balance, dig, inGame, client) {
    let discordID = msg.author.id;
    let discordUsername = msg.author.username;
    let holder = true;
    if (amount === "all") {
        amount = balance;
    }
    amount = parseInt(amount);
    if ((amount == undefined) || isNaN(amount)) {
        msg.reply("Please enter a valid amount");
        return;
    }
    if ((balance < amount) || (parseInt(balance) === 0)) {
        msg.reply('You do not have enough money!');
        return;
    }
    if (inGame == true) {
        msg.reply("You are already in a game");
        return;
    }
    await setInGame.setInGame(discordID, discordUsername, balance, dig, true);
    let stop = ((Math.random() * 5)).toFixed(1);
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
            {inline: true, name: 'Multiplier ', value: `${multiplier}x`},
            {inline: true, name: "Profit: ", value: `$${newProfit}`}
        )
        .addField("How to play", `-stop: To stop before crash`);

    msg.reply(replyEmbed)
        .then((crashMessage) => {
                let refreshID = setInterval(() => {
                    multiplier = (multiplier + 0.2).toFixed(1);
                    multiplier = parseFloat(multiplier);
                    newProfit = (multiplier * profit).toFixed(0);
                    newProfit = parseFloat(newProfit) - profit;
                    replyEmbed = new Discord.MessageEmbed()
                        .setColor('BLUE')
                        .setTitle("Crash")
                        .setDescription(`<@${discordID}> you have bet $${amount}`)
                        .addFields(
                            {inline: true, name: 'Multiplier ', value: `${multiplier}x`},
                            {inline: true, name: "Profit: ", value: `$${newProfit}`}
                        )
                        .addField("How to play", `-stop: To stop before crash`);
                    crashMessage.edit(replyEmbed);

                    if (multiplier >= stop) {
                        clearInterval(refreshID);
                        replyEmbed = new Discord.MessageEmbed()
                            .setColor('RED')
                            .setTitle("Crash")
                            .setDescription(`<@${discordID}> you have lost $${amount}`)
                            .addFields(
                                {inline: true, name: 'Multiplier ', value: `${multiplier}x`},
                                {inline: true, name: "Profit: ", value: `$${newProfit}`}
                            )
                            .addField("Balance", `$${balance - loss}`);
                        crashMessage.edit(replyEmbed);
                        updateMoney.updateMoney(discordID, discordUsername, (balance - loss), dig, false);
                        holder = false;
                    }
                }, 2000);

                client.on('message', (msg) => {
                    if (msg.content.toLowerCase() === "-stop" && !(multiplier >= stop) && msg.author.id === discordID && holder === true) {
                        clearInterval(refreshID);
                        replyEmbed = new Discord.MessageEmbed()
                            .setColor('GREEN')
                            .setTitle("Crash")
                            .setDescription(`<@${discordID}> you have won $${newProfit}`)
                            .addFields(
                                {inline: true, name: 'Multiplier ', value: `${multiplier}x`},
                                {inline: true, name: "Profit: ", value: `$${newProfit}`}
                            )
                            .addField("Balance", `$${balance + newProfit}`);
                        crashMessage.edit(replyEmbed);
                        updateMoney.updateMoney(discordID, discordUsername, (balance + newProfit), dig, false);
                        holder = false
                        return;
                    }
                });
            }
        );

}

module.exports = {crash}