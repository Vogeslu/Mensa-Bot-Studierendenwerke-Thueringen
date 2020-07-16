let TelegramBot = require("node-telegram-bot-api"),
    fs = require("fs"),
    canteenService = require("./canteenService"),
    bot = new TelegramBot("INSERT-TELEGRAM-BOT-CODE-HERE", {
        polling: true
    }),
    currentMenu = {},
    matchingCanteen = {};


try {
    var data = JSON.parse(fs.readFileSync("data.json"));
    matchingCanteen = data.matchingCanteen;
} catch (e) {}

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;
  let replyOptions = {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: []
    }
  };

  currentMenu[msg.from.id] = "setup";

  Object.keys(canteenService.canteens).forEach((short)=>replyOptions.reply_markup.keyboard.push([{text:canteenService.canteens[short].name}]));

  bot.sendMessage(chatId, "Hallo "+msg.from.first_name+"!\nDieser Bot zeigt den aktuellen Speiseplan verschiedener Mensen in Thüringen an. Es handelt sich hierbei um ein Freizeitprojekt. Bei Fragen oder Problemen mit bitte mir melden (@vogeslu).\n\nBitte wähle eine Mensa aus der Liste aus.",replyOptions);
});

bot.on("message", async msg => {
    if(typeof currentMenu[msg.from.id] === "undefined" || msg.text.startsWith("/")) return;

    switch(currentMenu[msg.from.id]) {
        case "setup": {
            var canteen = null;

            Object.keys(canteenService.canteens).forEach((short)=>{
                if(canteenService.canteens[short].name === msg.text)
                    canteen = short;
            });

            if(canteen === null) {
                let replyOptions = {
                    reply_markup: {
                        resize_keyboard: true,
                        one_time_keyboard: true,
                        keyboard: []
                    }
                };
            
                Object.keys(canteenService.canteens).forEach((short)=>replyOptions.reply_markup.keyboard.push([{text:canteenService.canteens[short].name}]));
            
                bot.sendMessage(msg.chat.id, "Unbekannte Mensa. Bitte wähle eine andere Mensa aus.",replyOptions);
            } else {
                matchingCanteen[msg.from.id] = canteen;
                delete currentMenu[msg.from.id];

                let data = await canteenService.getDetails(canteen);
                
                var message = "*"+data.name+"* wurde als deine Standard-Mensa eingestellt.\n\nFolgende Informationen sind verfügbar:";
                data.data.forEach((details)=>message+="\n\n*"+details.title+"*:\n"+details.details);
                message+="\n\n\nFolgende Befehle kannst du verwenden:\n\n/today - Heutigen Speiseplan abrufen\n/thisweek - Speiseplan der Woche abrufen\n/nextweek - Speiseplan der nächsten Woche abrufen\n/details - Informationen über Mensa abrufen\n/change - Mensa wechseln";

                fs.writeFileSync("data.json", JSON.stringify({ matchingCanteen: matchingCanteen }));

                bot.sendMessage(msg.chat.id, message, {parse_mode:"markdown"});
            }
        } break;
    }
});

bot.onText(/\/today/, async (msg, match) => {
    const chatId = msg.chat.id;

    if(typeof matchingCanteen[msg.from.id] === "undefined")
        return bot.sendMessage(chatId, "Du hast noch keine Mensa ausgewählt. Bitte wähle eine Mensa mit /start aus.");

    let today = await canteenService.getToday(matchingCanteen[msg.from.id]);

    bot.sendMessage(msg.chat.id, printPlan(today)+"(Alle Speisen ohne Preisaufschlag (weitere Informationen: /details))", {parse_mode:"markdown"});
});

function printPlan(data) {
    let message = "\nSpeiseplan für *"+data.currentDate.text+"*:\n\n";
    data.list.forEach((entry)=>{
        message+="*"+entry.food+"* (_"+entry.title+"_)"+"\n"+entry.price+"  ";
        entry.contents.detailed.forEach((item)=>{
            if(item.icon) message+=item.icon;
        });

        message+=" _"+entry.contents.list+"_\n\n";
    });

    return message;
}

bot.onText(/\/thisweek/, async (msg, match) => {
    const chatId = msg.chat.id;

    if(typeof matchingCanteen[msg.from.id] === "undefined")
        return bot.sendMessage(chatId, "Du hast noch keine Mensa ausgewählt. Bitte wähle eine Mensa mit /start aus.");

    let plan = await canteenService.getCurrentWeek(matchingCanteen[msg.from.id]),
        message = "";

    plan.forEach((day)=>message+=printPlan(day));

    bot.sendMessage(msg.chat.id, message+"(Alle Speisen ohne Preisaufschlag (weitere Informationen: /details))", {parse_mode:"markdown"});
});

bot.onText(/\/nextweek/, async (msg, match) => {
    const chatId = msg.chat.id;

    if(typeof matchingCanteen[msg.from.id] === "undefined")
        return bot.sendMessage(chatId, "Du hast noch keine Mensa ausgewählt. Bitte wähle eine Mensa mit /start aus.");

    let plan = await canteenService.getNextWeek(matchingCanteen[msg.from.id]),
        message = "";

    plan.forEach((day)=>message+=printPlan(day));

    bot.sendMessage(msg.chat.id, message+"(Alle Speisen ohne Preisaufschlag (weitere Informationen: /details))", {parse_mode:"markdown"});
});

bot.onText(/\/details/, async (msg, match) => {
    const chatId = msg.chat.id;

    if(typeof matchingCanteen[msg.from.id] === "undefined")
        return bot.sendMessage(chatId, "Du hast noch keine Mensa ausgewählt. Bitte wähle eine Mensa mit /start aus.");

    let data = await canteenService.getDetails(matchingCanteen[msg.from.id]);
            
    var message = "Folgende Informationen sind verfügbar:";
    data.data.forEach((details)=>message+="\n\n*"+details.title+"*:\n"+details.details);
   
    bot.sendMessage(msg.chat.id, message, {parse_mode:"markdown"});
});

bot.onText(/\/change/, async (msg, match) => {
    const chatId = msg.chat.id;
    let replyOptions = {
        reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: true,
        keyboard: []
        }
    };

    currentMenu[msg.from.id] = "setup";

    Object.keys(canteenService.canteens).forEach((short)=>replyOptions.reply_markup.keyboard.push([{text:canteenService.canteens[short].name}]));

    bot.sendMessage(chatId, "Bitte wähle eine Mensa aus der Liste aus.",replyOptions);
});