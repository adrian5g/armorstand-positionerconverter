const fs = require('fs');
const path = require('path');

// Função para formatar número como Double no Kotlin
function toKtDouble(number) {
  return parseFloat(number).toFixed(1);
}

// Função para transformar o material em um material válido para spigot 1.8.8
function toValidMaterial(string) {
  return string.toUpperCase()
  .replace(/HARDENED_CLAY/g, 'STAINED_CLAY');;
}

// Função para verificar e processar o arquivo de entrada
function processFile(inputFilePath, outputFilePath, callback) {
  if (!fs.existsSync(inputFilePath)) {
    console.error('Arquivo de entrada não encontrado!');
    return;
  }

  fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }

    const modifiedData = data
      .replace(
        'summon falling_block ~ ~1.0 ~ {Block:stone,Time:1,Passengers:[{id:falling_block,Block:redstone_block,Time:1,Passengers:[{id:falling_block,Block:activator_rail,Time:1,Passengers:',
        ''
      )
      .replace(/:commandblock_minecart,/g, ':"commandblock_minecart",')
      .replace(/,Command:/g, ',"Command":')
      .replace(/\{id:/g, '{"id":');

    const finalData = modifiedData.slice(0, -5); // Remover os últimos 5 caracteres

    fs.writeFile(outputFilePath, finalData, 'utf8', (err) => {
      if (err) {
        console.error('Erro ao salvar o arquivo JSON:', err);
        return;
      }
      console.log(`Arquivo JSON salvo com sucesso em: ${outputFilePath}`);
      callback?.(outputFilePath); // Chama o callback se fornecido
    });
  });
}

// Função para processar os comandos no JSON
function processCommands(jsonData) {
  const results = [];

  jsonData.forEach(({ Command }) => {
    if (Command.startsWith('setblock')) {
      const match = Command
      .match(/setblock ~([-\d.]+) ~([-\d.]+) ~([-\d.]+) ([a-zA-Z_]+)(?: ([-\d.]+))?/);

      if (match) {
        const [, x, y, z, material, damage] = match;

        results.push(
          `setBlock(ItemStack(Material.${toValidMaterial(material)}, 1, ${damage || 0}), ${toKtDouble(
            x
          )}, ${toKtDouble(y)}, ${toKtDouble(z)});`
        );
      } else {
        console.error('Comando setblock inválido:', Command);
      }
    } else if (Command.startsWith('summon armor_stand')) {
      const match = Command.match(/summon armor_stand ~([\d.-]+) ~([\d.-]+) ~([\d.-]+) \{(.+)\}$/);
      if (match) {
        const [, x, y, z, attributes] = match;

        const small = /Small:1/.test(attributes) ? 'true' : 'false';
        const armorMatch = attributes.match(/ArmorItems:\[.*\{.*id:(.+?)\}\]/);
        const headItem = (armorMatch ? armorMatch[1] : 'AIR').match(/^(.+?)(?:,Damage:(\d+))?$/);

        const headItemMaterial = toValidMaterial(headItem[1]);
        const headItemDamage = headItem[2] || 0;

        results.push(
          `summonArmorStand(${toKtDouble(x)}, ${toKtDouble(y)}, ${toKtDouble(
            z
          )}, head = ItemStack(Material.${headItemMaterial}, 1, ${headItemDamage}), small = ${small});`
        );
      } else {
        console.error('Comando summon armor_stand inválido:', Command);
      }
    }
  });

  return results;
}

// Função principal
function main() {
  const inputFile = path.join(__dirname, 'command.txt');
  const outputFile = path.join(__dirname, 'data.json');

  processFile(inputFile, outputFile, (outputPath) => {
    try {
      const rawData = fs.readFileSync(outputPath, 'utf8');
      const jsonData = JSON.parse(rawData);

      const kotlinCode = processCommands(jsonData);

      if (kotlinCode.length > 0) {
        console.log('Código Kotlin gerado:');
        kotlinCode.forEach((code) => console.log(code));
      } else {
        console.log('Nenhum comando válido encontrado.');
      }
    } catch (error) {
      console.error('Erro ao processar o arquivo JSON:', error.message);
    }
  });
}

main();
