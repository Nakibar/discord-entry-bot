require("dotenv").config();
const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
Events,
PermissionsBitField,
AttachmentBuilder
} = require("discord.js");

const fs = require("fs");

const client = new Client({
intents:[GatewayIntentBits.Guilds]
});

function loadCodes(){
return JSON.parse(fs.readFileSync("./codes.json"));
}

function saveCodes(data){
fs.writeFileSync("./codes.json",JSON.stringify(data,null,2));
}

client.once("ready",()=>{
console.log(`Bot Ready as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

if(interaction.isChatInputCommand()){

let codes = loadCodes();
const guildId = interaction.guild.id;

// initialize server storage
if(!codes[guildId]){
  codes[guildId] = {};
}

// ADMIN CHECK
if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
return interaction.reply({content:"Admin only command.",ephemeral:true});
}

// CREATE CODE
if(interaction.commandName === "createcode"){

const code = interaction.options.getString("code").toUpperCase();

if(codes[guildId][code]){
return interaction.reply({
content:"Code already exists",
ephemeral:true
});
}

codes[guildId][code] = [];
saveCodes(codes);

interaction.reply({
content:`Code **${code}** created successfully`,
ephemeral:true
});
}

// ENTRY PORTAL
if(interaction.commandName === "entryportal"){

const code = interaction.options.getString("code").toUpperCase();

if(!codes[guildId][code]){
return interaction.reply({
content:"Code does not exist",
ephemeral:true
});
}

const embed = new EmbedBuilder()
.setTitle("🎁 Entry Portal")
.setDescription(`Click the button below and enter your code to register!\n\nCode: **${code}**`)
.setColor("Purple");

const button = new ButtonBuilder()
.setCustomId(`enter_${code}`)
.setLabel(`Enter ${code}`)
.setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder().addComponents(button);

interaction.reply({
embeds:[embed],
components:[row]
});
}

// EXPORT ENTRIES
if(interaction.commandName === "exportentries"){

const code = interaction.options.getString("code").toUpperCase();

if(!codes[guildId][code]){
return interaction.reply({
content:"Code not found",
ephemeral:true
});
}

const users = codes[guildId][code];

if(users.length === 0){
return interaction.reply({
content:"No entries yet",
ephemeral:true
});
}

// support old + new data
const list = users.map((u, index) => {
  if(typeof u === "string"){
    return `${index + 1}. Unknown User (${u})`;
  }
  return `${index + 1}. ${u.username}`;
});

const finalList = list.join("\n");

// create txt file
const buffer = Buffer.from(finalList, "utf-8");

const file = new AttachmentBuilder(buffer, {
name: `entries_${code}.txt`
});

interaction.reply({
content:`Entries exported for **${code}**`,
files:[file],
ephemeral:true
});
}

// DELETE CODE
if(interaction.commandName === "deletecode"){

const code = interaction.options.getString("code").toUpperCase();

if(!codes[guildId][code]){
return interaction.reply({
content:"Code not found",
ephemeral:true
});
}

delete codes[guildId][code];
saveCodes(codes);

interaction.reply({
content:`Code **${code}** deleted successfully`,
ephemeral:true
});
}

}

// BUTTON CLICK
if(interaction.isButton()){

if(interaction.customId.startsWith("enter_")){

const code = interaction.customId.split("_")[1];

const modal = new ModalBuilder()
.setCustomId(`modal_${code}`)
.setTitle(`Enter Code: ${code}`);

const input = new TextInputBuilder()
.setCustomId("codeinput")
.setLabel(`Type: ${code}`)
.setStyle(TextInputStyle.Short)
.setRequired(true);

const row = new ActionRowBuilder().addComponents(input);

modal.addComponents(row);

interaction.showModal(modal);

}

}

// MODAL SUBMIT
if(interaction.isModalSubmit()){

if(interaction.customId.startsWith("modal_")){

const code = interaction.customId.split("_")[1];
const entered = interaction.fields.getTextInputValue("codeinput").toUpperCase();

let codes = loadCodes();
const guildId = interaction.guild.id;

// ensure server exists
if(!codes[guildId]){
  codes[guildId] = {};
}

if(!codes[guildId][code]){
return interaction.reply({content:"Invalid code",ephemeral:true});
}

if(entered !== code){
return interaction.reply({content:"Wrong code",ephemeral:true});
}

// safe duplicate check
if(codes[guildId][code].some(u => typeof u === "object" && u.id === interaction.user.id)){
return interaction.reply({
content:"⚠️ You already registered!",
ephemeral:true
});
}

// store user
codes[guildId][code].push({
  id: interaction.user.id,
  username: interaction.user.username
});

saveCodes(codes);

interaction.reply({
content:"✅ Successfully registered",
ephemeral:true
});
}

}

});

client.login(process.env.TOKEN);
