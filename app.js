const Discord = require("discord.js");
const config = require("./config.json");
const axios = require("axios");
const firebase = require('firebase')
const dotenv = require('dotenv');
dotenv.config();

firebase.initializeApp({
	"serviceAccount": config.firebaseServiceAccount.toString(),
	"databaseURL": "https://jess-bot-dc5e0.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("/memory");
const client = new Discord.Client();


const prefix = "jess ";

client.on("ready", async () => {
	console.log("I am ready!");
});

client.on("message", async (message) => {
	if (message.author.bot) return;
	
	if (!message.content.startsWith(prefix)) daemonMessages(message);
	const commandBody = message.content.slice(prefix.length);
	const args = commandBody.split(" ");
	const command = args.shift().toLowerCase();
	console.log(args)
	switch (command) {
		case "quote": quote(); break;
		case "help": help(); break;
		case "hi": message.reply(`Good day, ${message.author}! The lord greets you!`); break;
		case "hello": message.reply(`Wtf do you want? Oh- I mean- Greetings, son.`); break;
		case "remember": remember(message, args); break;
		case "recall": recall(message, args); break;
		case "forget": forget(message, args); break;
		case "insult": insult(message, args); break;
		case "arise": arise(message); break;
	}
});

const arise = async (message) => {
	channel = await client.channels.fetch(message.channel.id);
	console.log("channel", channel)
	channel.send(`3 days after my death already? Oh well, I'll wake up now`);
}

const daemonMessages = (message) => {
	msg = message.content.toLowerCase();
	if(msg.includes("google")) message.reply(`Did you mean gooGIRL?`)
	else if(msg.includes(" 69") || msg.includes(" 69 ") || msg==="69" || msg.startsWith("69 ")) channel.send('nice')
	else if (msg.includes("microsoft") || msg.includes(" ms ") || msg.startsWith("ms ") || msg.includes(" ms")) channel.send('haha M$ yasss')
	else if (msg.includes("lamba") || msg.includes("maza") || msg.includes("bada hai") || msg.includes("chhota")) channel.send('twss :eyes:')
}

const quote = () => {
	axios
		.get("https://labs.bible.org/api/?passage=random&type=json")
		.then((res) => {
			response = res.data[0];

			console.log(response);

			book = response.bookname;
			chap = response.chapter;
			verse = response.verse;
			text = response.text;
			 
			channel.send(book + " " + chap + ":" + verse + " says\n" + text);
		});
};

const help = () => {
	channel.send(
		"Don't worry my son, I'm here for you\n\n```Commands:\n\narise : initialize jess\nhelp : Print this message\nquote : Say a random quote from the Bible\nhi : Greet the user\n\n\nCall on me whenever, child.\nremember : save a value or a string as a key value pair\nrecall : fetch stored value\nforget : delete stored value\ninsult : roast someone```"
	);
};

const remember = async (message, args) => {
	key = "";
	for(i of args) {
		key += i.toString() + " "
	}
	message.reply(`What do you want me to remember as "${key}"?`)
	value = ""

	const filter = m => m.author.id ===  message.author.id;
	message.channel.awaitMessages(filter, {
		max: 1,
		time: 20000, 
	}).then(async(collected) => {
		value = collected.first().content
		console.log("value: ", value)
		
		const obj = {}
		obj[key] = value
		console.log(key, value)
		if(value !== "")
		ref.update(obj, (err) => {
			if(err){
				console.log(err);
				channel.send("Something went wrong :(, contact Arjun");
			}else{
				console.log("Saved");
				channel.send("I will remember everything you say, my child!");
			}
		})
	}).catch(() => {
		message.reply('You took too long! Goodbye!') 
	});	
} 

const recall = (message, args) => {
	key = "";
	for(i of args) {
		key += i.toString() + " "
	}
	
	ref.child(key).once('value', (snap)=>{
		console.log(snap.val());
		if(snap && snap.val() !== null && snap.val() !== undefined && snap.val() !== ""){
			channel.send(`From what I remember, ${key} is : \n\n${snap.val()}`);
		}else{
			message.reply("I don't remember anything like that");
		}
	});

}

const forget = (message, args) => {
	key = "";
	for(i of args) {
		key += i.toString() + " "
	}
	ref.child(key).remove(() => {
		channel.send(`${key}? What's that?`);
	});
	
}

const insult = (message, args) => {
	console.log(args[0].slice(3,-1))
	target = args[0].slice(3,-1);
	axios
		.get("https://evilinsult.com/generate_insult.php?lang=en&type=json")
		.then((res) => {
			response = res.data;

			console.log(response);
			if(target)
				channel.send(`Well, what can I say <@${target}>\n${response.insult}`);
			else message.reply(`Insult who? You're the idiot here :rolling_eyes:`)
		});
	
}

const token = (process.env.BOT_TOKEN || require('.env').BOT_TOKEN)
client.login(token);
