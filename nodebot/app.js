var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var inMemoryStorage = new builder.MemoryBotStorage();

// This is a dinner reservation bot that uses a waterfall technique to prompt users for input.
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Welcome to the BotFrameworks");
        builder.Prompts.text(session, "may i know whom am i talking to ?");
    },
    function (session, results) {
//        session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        session.dialogData.name=results.response;
        builder.Prompts.text(session, "Hello "+results.response+"!! how are you ?");
    },
    function (session, results) {
        session.dialogData.mood = results.response;
        if(session.dialogData.mood=="good"){
           session.send("thats good.");
             
        }
        else if(session.dialogData.mood=="bad"){
            session.send( "thats sad,but it will get better.");
            
        }
        builder.Prompts.number(session, "And how old are you ?");
    },
    function (session, results) {
        session.dialogData.age=results.response;
        builder.Prompts.text(session, "Where do you live ?");
    },
    function (session, results) {
        session.dialogData.city=results.response;
        session.send( "Hey i know this place !! ");
        session.send("https://www.google.co.in/search?q="+results.response);
        builder.Prompts.text(session, "lets talk some more :) ? ");
    },
    function (session, results,next) {
        session.dialogData.answer=results.response;
         if(session.dialogData.answer=="sure"){
            session.send("i wish we could talk more i gotta go right now");
        }
        else if(session.dialogData.mood=="gotta go"){
            session.send( "sure we shall talk later.");
        }
        next();
        
    },
    function (session, results) {
        session.send("Bye");
        session.endConversation("nice talking");
    }
]).set('storage', inMemoryStorage); // Register in-memory storage