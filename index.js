const lib = require('lib')({token: process.env['token']});
const mySecret = process.env['dtoken'];
const {Client, GatewayIntentBits} = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on('ready', () => {
  console.log(`logged in!`);
});
client.on('messageCreate', (message) => {
  if (message.content == 'ping') {
    console.log(message);
    return lib.discord.channels['@0.3.2'].messages.create({
      channel_id: `860512303233236995`,
      content: `pong!`,
      message_reference: {
        message_id: message.id,
      },
    });
  } else {
    return;
  }
});
async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
const {Client: ClashClient} = require('clashofclans.js');
const beast = new ClashClient();

var cron = require('node-cron');
console.log('hello');
//miss rmd
cron.schedule('0 7 * * Monday', () => {
  console.log('sending cc missers');
  (async function () {
    let test = await lib.mysql.db['@0.2.1'].query({
      query: `select * from master where channel  != '0';`,
      charset: `UTF8MB4`,
    });
    for (let i = 0; i < test.result.length; i++) {
      let clan = await client.getClan(test.result[i].clan);
      let members = clan.members;
      let send = [];
      let u = await client.getCapitalRaidSeasons(test.result[i].clan);
      let t = u[0].members;
      for (let i = 0; i < members.length; i++) {
        if (!(members[i] in t)) {
          send.push(members[i].name);
        }
      }
      await lib.discord.channels['@0.3.2'].messages.create({
        channel_id: test.result[i].channel,
        content: ` `,
        embeds: [
          {
            type: `rich`,
            title: `Missed raid attacks for ${clan.name}`,
            description: send
              .map((u, index) => {
                return JSON.stringify(index + 1).padStart(2, ' ') + u;
              })
              .join('\n'),
            color: 0x00ff00,
            thumbnail: {
              url: clan.badge.url,
            },
          },
        ],
      });
      await sleep(250);
    }
  })();
});

// cc rmd
cron.schedule('1 7 * * Friday', () => {
  console.log('sending cc start');
  (async function () {
    let test = await lib.mysql.db['@0.2.1'].query({
      query: `select * from claims;`,
      charset: `UTF8MB4`,
    });
    for (let i = 0; i < test.result.length; i++) {
      try {
        await lib.discord.users['@0.2.1'].dms.create({
          recipient_id: test.result[i].dc,
          content: `Clan capital raids are about to start. Get ready to rock the leaderboard 🤟`,
        });
        console.log(`dm sent to ${test.result[i].dc}`);
      } catch (e) {
        console.log(e);
      }
      await sleep(250);
    }
  })();
});

// war stuff
cron.schedule('*/5 * * * *', () => {
  console.log('fetching wars');
  (async function myTimer() {
    //console.log('hemlo  ');
    console.log(new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'}));
    let a = await lib.mysql.db['@0.2.1'].query({
      query: `select * from master;`,
      charset: `UTF8MB4`,
    });
    for (let i = 0; i < a.result.length; i++) {
      try {
        var clan = await beast.getClanWar(a.result[i].clan);
      } catch (e) {
        if (e.reason === 'notInWar') {
          continue;
        }
        console.log(e);
      }
      if (a.result[i].new === clan.state) {
        console.log(a.result[i].new === clan.state);
        continue;
      } else {
        await lib.mysql.db['@0.2.1'].query({
          query: `update master set state = '${a.result[i].new}' where clan = '${a.result[i].clan}';`,
          charset: `UTF8MB4`,
        });
        await lib.mysql.db['@0.2.1'].query({
          query: `update master set new = '${clan.state}' where clan = '${a.result[i].clan}';`,
          charset: `UTF8MB4`,
        });
        console.log('values changed ');
        let b = await lib.mysql.db['@0.2.1'].query({
          query: `select * from master;`,
          charset: `UTF8MB4`,
        });
        if (b.result[i].new === 'inWar') {
          await lib.discord.channels['@0.3.2'].messages.create({
            channel_id: `${b.result[i].war}`,
            content: `  `,
            embeds: [
              {
                'type': `rich`,
                'title': ` `,
                'color': 0xff0000,
                'description': `Battle day has started against ${clan.opponent.name}`
              }
            ]
          });
          }
        else if (b.result[i].new === 'warEnded') {
          console.log('war over')
          var clan = await beast.getClanWar(b.result[i].clan);
          var attacks = await clan.clan.attacks;
          var attk = await clan.opponent.attacks;
          let result;
          let res;
          if (clan.status === 'win') {
            result = 'true'}
          else{result = 'false'}
          if (result === 'true') {
            res = 'false'}
          else{res = 'true'}
          await lib.discord.channels['@0.3.2'].messages.create({
            channel_id: `${b.result[i].war}`,
            content: ``, // required
            embeds: [
              {
                'type': `rich`,
                'title': ` `,
                'color': 0x00ff00,
                'description': `The war has ended. Final result: ${clan.clan.name} ⭐ ${clan.clan.stars} (${clan.clan.destruction}%) - ${clan.opponent.stars}⭐ (${clan.opponent.destruction}%) ${clan.opponent.name}`
              }
            ]
          });
          for (let j = 0; j < attacks.length; j++) {
            console.log('adding stats');
            await lib.mysql.db['@0.2.1'].query({
              query: `insert into players values('${attacks[j].attackerTag}','${attacks[j].attacker.name}','${attacks[j].attacker.townHallLevel}','${attacks[j].order}','${attacks[j].attackerTag}','${attacks[j].defenderTag}','${attacks[j].stars}','${attacks[j].duration}','${attacks[j].destruction}','${attacks[j].defender.mapPosition}','${attacks[j].defender.townHallLevel}','${attacks[j].defender.clan.tag}','${attacks[j].defender.clan.name}','${attacks[j].attacker.clan.tag}','${attacks[j].clan.name}','${attacks[j].clan.level}','${attacks[j].defender.clan.level}','${clan.startTime}','${clan.teamSize}','${result}');`,
              charset: `UTF8MB4`
            });
          }
          for (let j = 0; j < attk.length; j++) {
            console.log('adding stats');
            await lib.mysql.db['@0.2.1'].query({
              query: `insert into players values('${attk[j].attackerTag}','${attk[j].attacker.name}','${attk[j].attacker.townHallLevel}','${attk[j].order}','${attk[j].attackerTag}','${attk[j].defenderTag}','${attk[j].stars}','${attk[j].duration}','${attk[j].destruction}','${attk[j].defender.mapPosition}','${attk[j].defender.townHallLevel}','${attk[j].defender.clan.tag}','${attk[j].defender.clan.name}','${attk[j].attacker.clan.tag}','${attk[j].clan.name}','${attk[j].clan.level}','${attk[j].defender.clan.level}','${clan.startTime}','${clan.teamSize}','${res}');`,
              charset: `UTF8MB4`
            });
          }
          const {registerFont, createCanvas, loadImage} = require('canvas');
          const comicsans = require('@canvas-fonts/tahoma');
          registerFont(comicsans, {family: 'Tahoma'});
          const canvas = createCanvas(375,200);
          const ctx = canvas.getContext('2d');
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          let bill = `https://media.discordapp.net/attachments/860512303233236995/1050966121781674044/IMG_20221210_081343.jpg`;
          let image = await loadImage(bill);
          ctx.drawImage(image, 2, 2, 375,200);
          ctx.font = 'bold 25px "Comic Sans"';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.fillText(clan.opponent.destruction,250,132) 
          ctx.fillText(clan.clan.destruction,135,132) 
          ctx.font = 'bold 40px " Comic Sans"';
          ctx.fillText(clan.clan.stars,140,79) 
          ctx.fillText(clan.opponent.stars,250,79)
          ctx.font= 'bold 15px " Comic Sans"';
          ctx.fillText(clan.clan.name,120,173) 
          ctx.fillText(clan.opponent.name,238,173) 
          await lib.discord.channels['@0.3.2'].messages.create({
            channel_id: b.result[i].war,
            content: `  `,
            attachments: [
              {
                'file': canvas.toBuffer(),
                'filename': `result.png`
              }
            ]
          });
     }
      }
    }
  })();
});

cron.schedule('0 7 * * Monday', () => {
console.log('loading cc');
(async function () {
  let test = await lib.mysql.db['@0.2.1'].query({
    query: `select * from master where channel  != '0';`,
    charset: `UTF8MB4`,
  });
  for (let i=0;i<test.result.length;i++) {
    let n = await beast.getCapitalRaidSeasons(test.result[i].clan)
    if (JSON.stringify(n[0].endTime).slice(5,7) == new Date().getMonth()+1 && JSON.stringify(n[0].endTime).slice(8,10) == new Date().getDate()) {
      await lib.mysql.db['@0.2.1'].query({
        query: `insert into record values ('${test.result[i].clan}','${n[0].capitalTotalLoot}','${n[0].raidsCompleted}','${n[0].totalAttacks}','${n[0].offensiveReward}','${n[0].defensiveReward}','${n[0].endTime}')`,
        charset: `UTF8MB4`
      });
      for (let j=0;j<n[0].members.length;j++) {
        await lib.mysql.db['@0.2.1'].query({
          query: `insert into cplayers values('${n[0].members[j].tag}','${n[0].members[j].name}','${n[0].members[j].attacks}','${n[0].members[j].capitalResourcesLooted}','${test.result[i].clan}','${n[0].endTime}');`,
          charset: `UTF8MB4`
      });
      await sleep(50)
      }
      }
    }
      })();
    });
cron.schedule('33 16 * * Monday', () => {
console.log('loading cc');
(async function () {
  let test = await lib.mysql.db['@0.2.1'].query({
    query: `select * from master where channel  != '0';`,
    charset: `UTF8MB4`,
  });
  for (let i=0;i<test.result.length;i++) {
    let n = await beast.getCapitalRaidSeasons(test.result[i].clan)
    if (JSON.stringify(n[0].endTime).slice(5,7) == new Date().getMonth()+1 && JSON.stringify(n[0].endTime).slice(8,10) == new Date().getDate()) {
      await lib.mysql.db['@0.2.1'].query({
        query: `insert into record values ('${test.result[i].clan}','${n[0].capitalTotalLoot}','${n[0].raidsCompleted}','${n[0].totalAttacks}','${n[0].offensiveReward}','${n[0].defensiveReward}','${n[0].endTime}')`,
        charset: `UTF8MB4`
      });
      for (let j=0;j<n[0].members.length;j++) {
        await lib.mysql.db['@0.2.1'].query({
          query: `insert into cplayers values('${n[0].members[j].tag}','${n[0].members[j].name}','${n[0].members[j].attacks}','${n[0].members[j].capitalResourcesLooted}','${test.result[i].clan}','${n[0].endTime}');`,
          charset: `UTF8MB4`
      });
      await sleep(50)
      }
      }
    }
      })();
    });

(async function () {
  await beast.login({
    email: process.env.mail,
    password: process.env.pass,
    keyName: 'tata',
  });
  await beast.events.init();
})();
client.login(mySecret);
