
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [

new SlashCommandBuilder()
.setName("createcode")
.setDescription("Create a new entry code")
.addStringOption(option =>
option.setName("code")
.setDescription("Code name")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("entryportal")
.setDescription("Create entry portal")
.addStringOption(option =>
option.setName("code")
.setDescription("Entry code")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("exportentries")
.setDescription("Export entries")
.addStringOption(option =>
option.setName("code")
.setDescription("Code")
.setRequired(true)
),

new SlashCommandBuilder()
.setName("deletecode")
.setDescription("Delete a code")
.addStringOption(option =>
option.setName("code")
.setDescription("Code")
.setRequired(true)
)

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {

await rest.put(
Routes.applicationCommands(process.env.CLIENT_ID),
{ body: commands }
);

console.log("Slash commands deployed");

})();
