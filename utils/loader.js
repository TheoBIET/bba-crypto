const { readdirSync } = require("fs");

// Load all files from ./commands/
const loadCommands = (client, dir = "./commands/") => {
  let i = 0;

  readdirSync(dir).forEach((file) => {
    console.log(dir + file);
    const command = require(`../${dir}${file}`);
    const fileName = file.split(".")[0];
    client.commands.set(fileName, command);
    console.log(`Loading command ${fileName}...`);
    i++;
  });

  console.log(`Loaded ${i} commands.`);
};

module.exports = {
  loadCommands,
};
