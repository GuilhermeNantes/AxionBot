require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => console.log(`Logado como ${client.user.tag}!`));

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('Pong!');
  }

  if (message.content.startsWith('!pesquisar ')) {
    const termo = message.content.slice(11);
    try {
      const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`);
      const summary = response.data.extract || 'Não encontrei nada.';
      message.reply(`Resultado para "${termo}": ${summary.slice(0, 200)}...`);
    } catch (error) {
      message.reply('Erro ao pesquisar. Tente outro termo!');
    }
  }

  if (message.content.startsWith('!ia ')) {
    const pergunta = message.content.slice(4);
    try {
      const response = await axios.post('https://api.x.ai/grok', { // Substitua pela URL real da xAI
        query: pergunta,
        api_key: process.env.XAI_API_KEY,
      });
      const resposta = response.data.answer || 'Não consegui uma resposta do Grok.';
      message.reply(`Grok: ${resposta.slice(0, 2000)}`); // Limite do Discord é ~2000 caracteres
    } catch (error) {
      message.reply('Erro ao chamar o Grok. Tente novamente!');
      console.error(error); // Para debug
    }
  }
});

client.login(process.env.DISCORD_TOKEN);