const lib = require('lib')({token: process.env['token']});
const mySecret = process.env['dtoken']
const {Client, GatewayIntentBits} = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

client.on('ready', () => {
  console.log(`logged in!`)
})
client.on('messageCreate', (message) => {
  if (message.content == 'ping') {
    console.log(message)
    return lib.discord.channels['@0.3.2'].messages.create({
  channel_id: `860512303233236995`,
  content: `pong!`,
   message_reference: {
     message_id: message.id
   }
}); 
  } else {
    return;
  }
})
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}; 
const {Client:ClashClient} = require('clashofclans.js');
const beast = new ClashClient() 

var cron = require('node-cron');
console.log('hello')
//miss rmd
cron.schedule('0 6 * * Monday',() => {
  console.log('sending cc missers');
  (async function (){
    let test = await lib.mysql.db['@0.2.1'].query({
    query: `select * from master where channel  != '0';`,
    charset: `UTF8MB4`
  });
    for (let i =0;i<test.result.length;i++) {
      let clan = await client.getClan(test.result[i].clan)
      let members = clan.members
      let send = []
      let u = await client.getCapitalRaidSeasons(test.result[i].clan) 
      let t = u[0].members
      for (let i=0;i<members.length;i++) {
        if (!(members[i] in t)){
          send.push(members[i].name) 
          } }
      await lib.discord.channels['@0.3.2'].messages.create({
        channel_id: test.result[i].channel,
        content: ` `,
        embeds: [
          {
          'type': `rich`,
          'title': `Missed raid attacks for ${clan.name}`,
          'description': send.map((u,index) =>{
          return JSON.stringify(index+1).padStart(2,' ') + u}).join('\n'), 
          'color': 0x00ff00,
          'thumbnail': {
          url:clan.badge.url
          }
      }
    ]
  });
      await sleep(500)
    }
})();
});

// cc rmd
cron.schedule('0 8 * * Friday',() => {
  console.log('sending cc start');
  (async function (){
    let test = await lib.mysql.db['@0.2.1'].query({
    query: `select * from claims;`,
    charset: `UTF8MB4`
});
    for (let i=0;i<test.result.length;i++) {
      try{
        await lib.discord.users['@0.2.1'].dms.create({
          recipient_id: test.result[i].dc, 
          content: `Clan capital raids are about to start. Get ready to rock the leaderboard 🤟`
    });
        console.log(`dm sent to ${test.result[i].dc}`)
      }catch(e) {
        console.log(e) }
      await sleep(250) 
}
})();
});


(async function () {
  await beast.login({email:process.env.mail,password:process.env.pass,keyName:'tata'})
    await beast.events.init();
})();
client.login(mySecret)
