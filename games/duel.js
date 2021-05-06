const updateMoney = require('../helpers/updateMoney');
const Discord = require('discord.js');
const checkRegistered = require('../helpers/checkRegistered');
const setInGame = require('../helpers/setInGame');

//function for duel
async function duel(msg, enemy, amount, balance, dig, inGame, client){
    let discordID = msg.author.id;
    let discordName = msg.author.username;
    if((enemy===undefined) || (enemy===" ")){
        msg.reply("Please tag the person you want to duel");
        return;
    }
    let enemyID = enemy.id;
    let enemyName = enemy.username;
    let enemyValues = await checkRegistered.checkRegistered(enemyID, enemyName);
    let enemyBalance = enemyValues.balance;
    let enemyDig = enemyValues.dig;
    let holder = true;

    if (amount === "all"){
        amount = balance;
    }

    amount = parseInt(amount);

    if((amount===undefined) || (isNaN(amount))){
        msg.reply("Please enter a valid amount");
        return;
    }
    if ((balance < amount) || (parseInt(balance) === 0)){
        msg.reply("You do not have enough money!");
        return;
    }
    if ((enemyBalance < amount)||(balance === 0)){
        msg.reply(`${enemyName} does not have enough money!`);
        return;
    }
    if(inGame == true){
        msg.reply("You are already in a game");
        return;
    }
        let replyEmbed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setTitle("Duel")
            .setDescription(`<@${discordID}> you have dueled <@!${enemyID}> for $${amount}, to accept type -accept`)
            .addField("How to play", `-accept: To accept the challenge`);
            msg.reply(replyEmbed);
            client.on('message', async (msg)=>{
                if((msg.content.toLowerCase() === "-accept")&&(msg.author.id ===enemyID)&&(holder === true)){
                    await setInGame.setInGame(discordID,discordName, balance, dig, true);
                    await setInGame.setInGame(enemyID, enemyName, enemyBalance, enemyDig, true);
                    holder =false;
                    let userHealth=100;
                    let enemyHealth = 100;
                    let trueOrFalse = [true,false]
                    let randomized = (Math.random()*1).toFixed(0);
                    randomized = parseInt(randomized);
                    let userTurn = trueOrFalse[randomized];
                    let enemyTurn = !userTurn;
                    let refreshID = setInterval(()=>{
                        if ((userHealth <= 0)){
                            let replyEmbed = new Discord.MessageEmbed()
                                .setColor('GOLD')
                                .setTitle("Duel")
                                .setDescription(`<@${enemyID}> has killed <@!${discordID}> and won $${amount}`)
                                .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                    {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                            msg.reply(replyEmbed);
                            updateMoney.updateMoney(enemyID, enemyName, (enemyBalance+amount), enemyDig, false);
                            updateMoney.updateMoney(discordID, discordName, (balance-amount), dig, false);
                            clearInterval(refreshID);
                            holder =false;
                        }
                        else if ((enemyHealth<=0)){
                            let replyEmbed = new Discord.MessageEmbed()
                                .setColor('GOLD')
                                .setTitle("Duel")
                                .setDescription(`<@${discordID}> has killed <@!${enemyID}> and won $${amount}`)
                                .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                    {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                            msg.reply(replyEmbed);
                            updateMoney.updateMoney(enemyID, enemyName, (enemyBalance-amount), enemyDig, false);
                            updateMoney.updateMoney(discordID, discordName, (balance+amount), dig, false);
                            clearInterval(refreshID);
                            holder =false;

                        }
                        else if (userTurn === true){
                            let actionDetail =action();
                            let type = actionDetail.type;
                            let value = actionDetail.amount;
                            if (type === "Attack"){
                                if ((value === 10)||(value===20)){
                                    enemyHealth = enemyHealth - value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('GREEN')
                                        .setTitle("Duel")
                                        .setDescription(`<@${discordID}> punched :right_fist: <@!${enemyID}> and did ${value} damage`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = false;
                                    enemyTurn = true;
                                }
                                else if ((value === 50)||(value === 60)){
                                    enemyHealth = enemyHealth - value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('GREEN')
                                        .setTitle("Duel")
                                        .setDescription(`<@${discordID}> stabbed :knife: <@!${enemyID}> and did ${value} damage`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = false;
                                    enemyTurn = true;
                                }
                                else if ((value === 100)){
                                    enemyHealth = enemyHealth - value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('GREEN')
                                        .setTitle("Duel")
                                        .setDescription(`<@${discordID}> cleaved :axe: <@!${enemyID}> and did ${value} damage`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = false;
                                    enemyTurn = true;
                                }
                                else{
                                    enemyHealth = enemyHealth - value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('GREEN')
                                        .setTitle("Duel")
                                        .setDescription(`<@${discordID}> shot :gun: <@!${enemyID}> in the head, and did ${value} damage`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = false;
                                    enemyTurn = true;
                                }


                            }
                            else if (type === "Heal"){
                                if (value === 10){
                                    userHealth = userHealth + value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('GREEN')
                                        .setTitle("Duel")
                                        .setDescription(`<@${discordID}> ate an apple :apple: and healed for ${value}`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = false;
                                    enemyTurn = true;
                                }
                                else if (value === 20){
                                    userHealth = userHealth + value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('GREEN')
                                        .setTitle("Duel")
                                        .setDescription(`<@${discordID}> ate cheese :cheese: and healed for ${value}`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = false;
                                    enemyTurn = true;
                                }
                                else{
                                    userHealth = userHealth + value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('GREEN')
                                        .setTitle("Duel")
                                        .setDescription(`<@${discordID}> ate a drumstick :poultry_leg: and healed for ${value}`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = false;
                                    enemyTurn = true;
                                }


                            }
                        }
                        else if (enemyTurn === true){
                            let actionDetail =action();
                            let type = actionDetail.type;
                            let value = actionDetail.amount;
                            if (type === "Attack"){
                                if ((value === 10)||(value === 20)){
                                    userHealth = userHealth - value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('RED')
                                        .setTitle("Duel")
                                        .setDescription(`<@${enemyID}> punched :right_fist: <@!${discordID}> and did ${value} damage`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = true;
                                    enemyTurn = false;
                                }
                                else if ((value === 50)||(value === 60)){
                                        userHealth = userHealth - value;
                                        let replyEmbed = new Discord.MessageEmbed()
                                            .setColor('RED')
                                            .setTitle("Duel")
                                            .setDescription(`<@${enemyID}> stabbed :knife: <@!${discordID}> and did ${value} damage`)
                                            .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                                {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                        msg.reply(replyEmbed);
                                        userTurn = true;
                                        enemyTurn = false;
                                }
                                else if (value === 100){
                                            userHealth = userHealth - value;
                                            let replyEmbed = new Discord.MessageEmbed()
                                                .setColor('RED')
                                                .setTitle("Duel")
                                                .setDescription(`<@${enemyID}> cleaved :axe: <@!${discordID}> and did ${value} damage`)
                                                .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                                    {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                            msg.reply(replyEmbed);
                                            userTurn = true;
                                            enemyTurn = false;
                                }
                                else {
                                        userHealth = userHealth - value;
                                        let replyEmbed = new Discord.MessageEmbed()
                                            .setColor('RED')
                                            .setTitle("Duel")
                                            .setDescription(`<@${enemyID}> shot :gun: <@!${discordID}> in the head, and did ${value} damage`)
                                            .addFields({
                                                    inline: true,
                                                    name: `${discordName}: `,
                                                    value: `${userHealth}hp`
                                                },
                                                {inline: true, name: `${enemyName}`, value: `${enemyHealth}hp`});
                                        msg.reply(replyEmbed);
                                        userTurn = true;
                                        enemyTurn = false;


                                    }
                            }
                            else if (type === "Heal"){
                                if (value === 10){
                                    enemyHealth = enemyHealth + value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('RED')
                                        .setTitle("Duel")
                                        .setDescription(`<@${enemyID}> ate an apple :apple: and healed for ${value}`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = true;
                                    enemyTurn = false;
                                }
                                else if (value === 20){
                                    enemyHealth = enemyHealth + value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('RED')
                                        .setTitle("Duel")
                                        .setDescription(`<@${enemyID}> ate cheese :cheese: and healed for ${value}`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = true;
                                    enemyTurn = false;
                                }
                                else{
                                    enemyHealth = enemyHealth + value;
                                    let replyEmbed = new Discord.MessageEmbed()
                                        .setColor('RED')
                                        .setTitle("Duel")
                                        .setDescription(`<@${enemyID}> ate a drumstick :poultry_leg: and healed for ${value}`)
                                        .addFields({inline: true, name:`${discordName}: `, value: `${userHealth}hp` },
                                            {inline: true, name:`${enemyName}`, value: `${enemyHealth}hp`});
                                    msg.reply(replyEmbed);
                                    userTurn = true;
                                    enemyTurn = false;
                                }

                            }
                        }
                    }, 3000);
                }
            });


}

function action(){
    let type = ["Attack", "Attack","Attack","Attack","Heal", "Heal", "Attack"];
    let pickType = (Math.random()*6).toFixed(0);
    pickType= parseInt(pickType);
    pickType = type[pickType];
    if (pickType === "Attack"){
        let damage = [10,20,50,60,100,999];
        let pickDamage = (Math.random()*5).toFixed(0);
        pickDamage = parseInt(pickDamage);
        pickDamage= damage[pickDamage];
        return {type:pickType, amount:pickDamage};
    }
    else if (pickType === "Heal"){
        let amount = [10, 20, 30];
        let pickAmount = (Math.random()*2).toFixed(0);
        pickAmount = parseInt(pickAmount);
        pickAmount = amount[pickAmount];
        return {type:pickType, amount: pickAmount};
    }
}
module.exports={duel}