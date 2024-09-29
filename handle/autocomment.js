const cron = require('node-cron');

module.exports = function(api) {
  if (global.heru.autocomment === true) {
    cron.schedule(
      "0 */1 * * *",
      async function () {
        const pID = "1957572454705128"; // Post ID
        const rands = [
          "Hi",
          "Hello",
          "Hey",
          "Hey there",
          "Hi there",
          "You can view all available commands by typing " +
            global.heru.prefix +
            "help",
          "How are you?",
          "What's up?",
          "How's it going?",
          "How's life?",
          "How's your day going?",
          "Are you bored? Talk to me using ai command.",
          "In addition to formal forms of dog training (operant conditioning, reinforcement, or classical conditioning), dogs are able to learn merely from observation",
          "Like human babies, Chihuahuas are born with a soft spot in their skull which closes with age.",
          "Chihuahuas are born with soft spots in their skulls, just like human babies",
          "A Border Collie named Chaser has learned the names of 1,022 toys, and can retrieve each by name",
        ];
        const randomMessage = rands[Math.floor(Math.random() * rands.length)];
        console.log("commenting...");
        
        const dat = new Date();
        const timeNow = dat.toLocaleTimeString("en-US", { timeZone: "Asia/Manila" });
        const dateNow = dat.toLocaleDateString("en-US", { timeZone: "Asia/Manila" });
        
        api.sendComment(
          "Date: " + dateNow + "\nTime: " + timeNow + "\n\n" + randomMessage + "\n\n[ AUTOCOMMENT ]",
          pID
        );
        
        console.log("commented.");
      },
      {
        scheduled: true,
        timezone: "Asia/Manila",
      }
    );
  }
};