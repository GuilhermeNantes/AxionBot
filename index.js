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
  if (message.content.toLowerCase().startsWith('axion ')) {
    const termo = message.content.slice(6).trim(); // 6 porque "Axion " tem 6 caractere
    if (!termo.trim()) {
      return message.reply('Por favor, digite um termo após !pesquisa. Ex: !pesquisa Python');
    }
    try {
      // Mudança: URL da Wikipédia em português
      const response = await axios.get(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termo)}`);
      const summary = response.data.extract || 'Não encontrei nada sobre esse termo.';
      // Mudança: Mensagem em português, com título se disponível
      const titulo = response.data.title || termo;
      const resumoLimitado = summary.slice(0, 200) + (summary.length > 200 ? '...' : '');
      message.reply(`**${titulo}:** ${resumoLimitado}`);
    } catch (error) {
      // Mudança: Erro em português
      console.error('Erro na pesquisa:', error.message);
      message.reply('Erro ao pesquisar. Verifique o termo e tente novamente!');
    }
  }

  // Requer: process.env.HUGGINGFACE_TOKEN no .env
  if (content.toLowerCase().startsWith('!ia ')) {
    const pergunta = content.slice(4).trim();
    if (!pergunta) return message.reply('❓ Por favor, envie uma pergunta após `!ia`.');

    // Escolha um modelo pequeno para começar — troque se quiser
    const MODEL = process.env.HF_MODEL || 'google/flan-t5-large'; // exemplo
    const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

    if (!HF_TOKEN) {
      return message.reply('⚠️ Erro: token da Hugging Face não configurado. Defina HUGGINGFACE_TOKEN no .env');
    }

    try {
      const hfRes = await axios.post(
        `https://api-inference.huggingface.co/models/${MODEL}`,
        { inputs: pergunta },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000, // 20s
        }
      );

      // Alguns modelos retornam texto direto; outros retornam arrays/objetos
      let resposta = '';
      if (typeof hfRes.data === 'string') {
        resposta = hfRes.data;
      } else if (Array.isArray(hfRes.data) && hfRes.data[0]?.generated_text) {
        resposta = hfRes.data[0].generated_text;
      } else if (hfRes.data?.generated_text) {
        resposta = hfRes.data.generated_text;
      } else if (Array.isArray(hfRes.data) && hfRes.data[0]?.summary_text) {
        resposta = hfRes.data[0].summary_text;
      } else {
        resposta = JSON.stringify(hfRes.data).slice(0, 1500);
      }

      // Limita pra não ultrapassar limite do Discord
      if (resposta.length > 1900) resposta = resposta.slice(0, 1900) + '...';

      return message.reply(`🤖 IA (${MODEL}):\n${resposta}`);
    } catch (err) {
      console.error('Erro HuggingFace:', err?.response?.data || err.message);
      // Detecta se modelo está carregando (status 503) e dá feedback útil
      if (err.response?.status === 503) {
        return message.reply('⚠️ Modelo ocupado/carregando — tente novamente em alguns segundos.');
      }
      return message.reply('❌ Erro ao chamar a IA (Hugging Face). Confira o token/modelo e tente novamente.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);