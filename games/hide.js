const updateMoney = require('../helpers/updateMoney');
const Discord = require('discord.js');
const setInGame = require('../helpers/setInGame');

// Four houses, user picks a house
async function hide(msg, hide, amount, balance, dig, inGame){
    let discordID = msg.author.id;
    let discordName = msg.author.username;

    if (amount === "all"){
        amount = balance;
    }
    amount = parseInt(amount);
    hide = parseInt(hide);
    if((hide===undefined) || (isNaN(hide)) || (hide>3) || (hide<1)){
        msg.reply("Please enter a valid house to hide between 1-3");
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
    let houses = [1,2,3];
    await setInGame.setInGame(discordID, discordName, balance, dig, true);

    if(hide === 1){
        let replyEmbed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("Hide")
            .setDescription(`<@!${discordID}>, You have chosen to hide in house number ${hide}`)
            .addFields(
                {inline:true,name:"House 1:", value:":house:\n:pig:"},
                {inline:true,name:"House 2:", value:":house:"},
                {inline:true,name:"House 3:", value:":house:"}
            ).addField("How it works:", "If the wolf finds you on the first try, then you lose all your money\nIf the wolf finds you on the second try, then you get half back\nIf the wolf finds you on the last try, then you win 3x your money");
        msg.reply(replyEmbed);

    }
    if(hide === 2){
        let replyEmbed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("Hide")
            .setDescription(`<@!${discordID}>, You have chosen to hide in house number ${hide}`)
            .addFields(
                {inline:true,name:"House 1:", value:":house:"},
                {inline:true,name:"House 2:", value:":house:\n:pig:"},
                {inline:true,name:"House 3:", value:":house:"}
            ).addField("How it works:", "If the wolf finds you on the first try, then you lose all your money\nIf the wolf finds you on the second try, then you get half back\nIf the wolf finds you on the last try, then you win 3x your money");
        msg.reply(replyEmbed);

    }
    if(hide === 3){
        let replyEmbed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setTitle("Hide")
            .setDescription(`<@!${discordID}>, You have chosen to hide in house number ${hide}`)
            .addFields(
                {inline:true,name:"House 1:", value:":house:"},
                {inline:true,name:"House 2:", value:":house:"},
                {inline:true,name:"House 3:", value:":house:\n:pig:"}
            ).addField("How it works:", "If the wolf finds you on the first try, then you lose all your money\nIf the wolf finds you on the second try, then you get half back\nIf the wolf finds you on the last try, then you win 3x your money");
        msg.reply(replyEmbed);

    }

    let wait = setInterval(()=>{
        let wolf = (Math.random()*2.4).toFixed(0);
        let index = parseInt(wolf);
        wolf = houses[index];
        if (wolf === 1){
            if ((wolf=== hide)){
                let multiplier = 0;
                let color = "GREEN";
                if (houses.length===3){
                    multiplier = -1
                    color = "RED";
                }
                else if (houses.length === 2){
                    multiplier = -0.5
                    color = "RED";
                }
                else if (houses.length === 1){
                    multiplier = 3
                    color = "GREEN"
                }
                amount = multiplier * amount;
                let replyEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle("Hide")
                    .setDescription(`<@!${discordID}>, You have chosen to hide in house number ${hide}`)
                    .addFields(
                    {inline:true,name:"House 1:", value:":pig:\n:house:\n:wolf:"},
                    {inline:true,name:"House 2:", value:":house:"},
                    {inline:true,name:"House 3:", value:":house:"},
                    )
                    .addField("Balance:", `$${balance+amount}`);
                msg.reply(replyEmbed);
                updateMoney.updateMoney(discordID, discordName, (balance+amount), dig, false)
                clearInterval(wait);
            }
            else if (!(wolf===hide)){
                let replyEmbed = new Discord.MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Hide")
                    .setDescription(`<@!${discordID}>, You have chosen to hide in house number ${hide}`)
                    .addFields(
                        {inline:true,name:"House 1:", value:":house_abandoned:\n:wolf:"},
                        {inline:true,name:"House 2:", value:":house:"},
                        {inline:true,name:"House 3:", value:":house:"},
                    );
                msg.reply(replyEmbed);
                houses.splice(index,1);
            }
        }
        else if (wolf === 2){
            if ((wolf=== hide)){
                let multiplier = 0;
                let color = "GREEN";
                if (houses.length===3){
                    multiplier = -1
                    color = "RED";
                }
                else if (houses.length === 2){
                    multiplier = -0.5
                    color = "RED";
                }
                else if (houses.length === 1){
                    multiplier = 3
                    color = "GREEN"
                }
                amount = multiplier * amount;
                let replyEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle("Hide")
                    .setDescription(`<@!${discordID}>, You have chosen to hide in house number ${hide}`)
                    .addFields(
                        {inline:true,name:"House 1:", value:":house:"},
                        {inline:true,name:"House 2:", value:":pig:\n:house:\n:wolf:"},
                        {inline:true,name:"House 3:", value:":house:"},
                    )
                    .addField("Balance:", `$${balance+amount}`);

                msg.reply(replyEmbed);
                updateMoney.updateMoney(discordID, discordName, (balance+amount), dig, false)
                clearInterval(wait);
            }
            else if (!(wolf===hide)){
                let replyEmbed = new Discord.MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Hide")
                    .setDescription(`<@!${discordID}>, You have chosen to hide in house number ${hide}`)
                    .addFields(
                        {inline:true,name:"House 1:", value:":house:"},
                        {inline:true,name:"House 2:", value:":house_abandoned:\n:wolf:"},
                        {inline:true,name:"House 3:", value:":house:"},
                    );
                msg.reply(replyEmbed);
                houses.splice(index,1);
            }
        }
        else if (wolf === 3){
            if ((wolf=== hide)){
                let multiplier = 0;
                let color = "GREEN";
                if (houses.length===3){
                    multiplier = -1
                    color = "RED";
                }
                else if (houses.length === 2){
                    multiplier = -0.5
                    color = "RED";
                }
                else if (houses.length === 1){
                    multiplier = 3
                    color = "GREEN"
                }

                amount = multiplier * amount;
                let replyEmbed = new Discord.MessageEmbed()
                    .setColor(`${color}`)
                    .setTitle("Hide")
                    .setDescription(`<@!${discordID}>, You have chosen to hide in house number ${hide}`)
                    .addFields(
                        {inline:true,name:"House 1:", value:":house:"},
                        {inline:true,name:"House 2:", value:":house:"},
                        {inline:true,name:"House 3:", value:":pig:\n:house:\n:wolf:"},
                    )
                    .addField("Balance:", `$${balance+amount}`);

                msg.reply(replyEmbed);
                updateMoney.updateMoney(discordID, discordName, (balance+amount), dig, false)
                clearInterval(wait);
            }
            else if (!(wolf===hide)){
                let replyEmbed = new Discord.MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("Hide")
                    .setDescription(`<@!${discordID}>, You have chosen to hide in house number ${hide}`)
                    .addFields(
                        {inline:true,name:"House 1:", value:":house:"},
                        {inline:true,name:"House 2:", value:":house:"},
                        {inline:true,name:"House 3:", value:":house_abandoned:\n:wolf:"},
                    );
                msg.reply(replyEmbed);
                houses.splice(index,1);
            }
        }


    },1500);
}

module.exports={hide}