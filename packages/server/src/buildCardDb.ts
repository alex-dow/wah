import { configure, getLogger } from 'log4js';
import * as fs from 'fs';
import mongoose from 'mongoose';
import { WhiteCard, BlackCard, CardDeck } from '@wah/lib/src/models/card';


configure({
  appenders: {
    'out': { type: 'stdout' }
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'debug'
    }
  }
});
const LOG = getLogger('main');
const signatures = `

 _______   _______   ___   ___ ___    _______   ______
|   _   | |   _   | |   | |   Y   )  |   _   | |   _  \\
|.  1   | |   1___| |.  | |.  1  /   |.  |   | |.  |   |
|.  ____| |____   | |.  | |.  _  \\   |.  |   | |.  |   |
|:  |     |:  1   | |:  | |:  |   \\  |:  1   | |:  |   |
|::.|     |::.. . | |::.| |::.| .  ) |::.. . | |::.|   |
\`---'     \`-------' \`---' \`--- ---'  \`-------' \`--- ---'
                https://psikon.org

`;
LOG.info(signatures);

async function main(): Promise<void> {

  // Bootstrap Step 2: MongoDB

  const mongoUri = "mongodb://psikon:root123@127.0.0.1:27017/wah?authSource=wah";

  LOG.info('Connecting to MongoDB');
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });

  LOG.info('Loading card json file, this can take a while...');

  const CARD_DB = '/home/v0idnull/Github/json-against-humanity/full.md.json';

  const cards = JSON.parse(fs.readFileSync(CARD_DB).toString());

  LOG.info('Card json file loaded');
  LOG.info('Total white cards:', cards.white.length);
  LOG.info('Total black cards:', cards.black.length);

  const deckKeys = Object.keys(cards.metadata);

  LOG.info('Total decks:', deckKeys.length);

  LOG.info('Processing decks');
  for (let i = 0; i < deckKeys.length; i++) {
    const deckKey = deckKeys[i];
    const totalWhiteCards = cards.white.filter((cd: any) => {
      return cd.deck === deckKey;
    }).length;

    const totalBlackCards = cards.black.filter((cd: any) => {
      return cd.deck === deckKey;
    }).length;
    const deck = await CardDeck.create({
      name: cards.metadata[deckKey].name,
      official: cards.metadata[deckKey].official,
      description: cards.metadata[deckKey].description,
      icon: cards.metadata[deckKey].icon,
      deckKey: deckKey,
      totalWhiteCards,
      totalBlackCards
    });
    cards.metadata[deckKey].deckModel = deck;
  }

  LOG.info('Processing white cards');
  for (let idx = 0; idx < cards.white.length; idx++) {
    const whiteCard = cards.white[idx];
    if (!cards.metadata[whiteCard.deck]) {
      LOG.error('This card has no associated deck:', whiteCard);
    } else {
      try {
        await WhiteCard.create({
          text: whiteCard.text,
          icon: whiteCard.icon,
          deck: cards.metadata[whiteCard.deck].deckModel
        });
      } catch (err) {
        LOG.error('This card failed:', whiteCard);
        LOG.error(err);
      }
    }
  }

  LOG.info('Processing black cards');
  for (let idx = 0; idx < cards.black.length; idx++) {
    const blackCard = cards.black[idx];
    if (!cards.metadata[blackCard.deck]) {
      LOG.error('This card has no associated deck:', blackCard);
    } else {
      try {
        await BlackCard.create({
          text: blackCard.text,
          icon: blackCard.icon,
          deck: cards.metadata[blackCard.deck].deckModel,
          pick: blackCard.pick
        });
      } catch (err) {
        LOG.error('This card failed:', blackCard);
        LOG.error(err);
      }
    }
  }

  await mongoose.disconnect();
}

main()
.then(() => {
  LOG.info('Done');
})
.catch((err) => {
  LOG.error(err);
});