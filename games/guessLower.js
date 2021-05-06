const updateMoney = require('../helpers/updateMoney');
const Discord = require('discord.js');
const setInGame = require('../helpers/setInGame');

// function for guessLower
async function guessLower(msg, number, amount, balance, dig, inGame){
    let discordID = msg.author.id;
    let discordName = msg.author.username;

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
    if(inGame == true){
        msg.reply("You are already in a game");
        return;
    }
    await setInGame.setInGame(discordID,discordName, balance, dig, true);
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
        await updateMoney.updateMoney(discordID, discordName, (balance-amount), dig, false);
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
        await updateMoney.updateMoney(discordID, discordName, (balance+profit), dig, false);
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
        await updateMoney.updateMoney(discordID, discordName, (balance+profit), dig, false);
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
        await updateMoney.updateMoney(discordID, discordName, (balance+profit), dig, false);
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
        await updateMoney.updateMoney(discordID, discordName, (balance+profit), dig, false);
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
        await updateMoney.updateMoney(discordID, discordName, (balance+profit), dig, false);
        return;
    }
    else if (difference>50){
        let profit = amount *0.05
        await updateMoney.updateMoney(discordID, discordName, (balance+profit), dig, false);
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
module.exports = {guessLower};