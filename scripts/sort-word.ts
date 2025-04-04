import fs from 'fs';
import path from 'path';

const wordsFilePath = path.resolve('./src/words.ts');

fs.readFile(wordsFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    process.exit(1);
  }

  const match = data.match(/export const words = \[([\s\S]*?)\];/);
  if (!match) {
    console.error('Could not find words array in the file');
    process.exit(1);
  }

  const wordsString = match[1];
  const wordRegex = /'([a-z]{5})'/g;
  const words: string[] = [];
  let wordMatch;

  while ((wordMatch = wordRegex.exec(wordsString)) !== null) {
    words.push(wordMatch[1]);
  }

  const sortedWords = [...words].sort();

  const formattedWords = sortedWords.map((word) => `  '${word}'`).join(',\n');
  const newContent = `export const words = [\n${formattedWords}\n];\n`;

  fs.writeFile(wordsFilePath, newContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error(`Error writing file: ${writeErr}`);
      process.exit(1);
    }
    console.log(
      `✅ Successfully sorted ${sortedWords.length} words alphabetically.`
    );
  });
});
