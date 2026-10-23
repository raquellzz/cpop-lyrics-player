import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pinyin } from 'pinyin-pro';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- CONFIGURAÇÃO DA MÚSICA ----
const SONG_INFO = {
  id: "exo_growl_chinese",
  title: "Growl (으르렁) - Chinese Ver.",
  artist: "EXO",
  youtubeId: "I3dzURCmA4Y", // ID do clipe do YouTube
};

// Caminhos dos arquivos (Coloque seu arquivo .lrc na mesma pasta desse script)
const INPUT_LRC = path.join(__dirname, 'input.lrc');
const OUTPUT_JSON = path.join(__dirname, `../public/songs/${SONG_INFO.id}.json`);

function parseLrcToJSON() {
  if (!fs.existsSync(INPUT_LRC)) {
    console.error("Arquivo input.lrc não encontrado na pasta scripts!");
    return;
  }

  const lrcText = fs.readFileSync(INPUT_LRC, 'utf-8');
  const lines = lrcText.split('\n');
  const timeRegex = /\[(\d{2}):(\d{2}(?:\.\d{2,3})?)\](.*)/;

  const lyricsArray = [];

  lines.forEach(line => {
    const match = timeRegex.exec(line.trim());
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const totalSeconds = (minutes * 60) + seconds;
      const hanziText = match[3].trim();

      if (hanziText) {
        // Separa o texto caractere por caractere (simples para o MVP)
        const characters = hanziText.split('');
        const segments = characters.map(char => {
          // O pinyin-pro retorna o pinyin com os tons (ex: wǒ, ài, nǐ)
          const charPinyin = pinyin(char, { toneType: 'symbol', type: 'string' });
          return {
            hanzi: char,
            pinyin: charPinyin,
            translation: "" // Pode ser preenchido manualmente depois
          };
        });

        lyricsArray.push({
          time: Number(totalSeconds.toFixed(2)),
          segments: segments,
          lineTranslation: "Tradução pendente..." 
        });
      }
    }
  });

  const finalData = {
    ...SONG_INFO,
    dataFile: `songs/${SONG_INFO.id}.json`,
    lyrics: lyricsArray
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(finalData, null, 2), 'utf-8');
  console.log(`Sucesso! JSON salvo em: public/songs/${SONG_INFO.id}.json`);
  console.log(`Não esqueça de adicionar a música no seu public/catalog.json!`);
}

parseLrcToJSON();