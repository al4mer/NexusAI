import os
import discord
from discord.ext import commands
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize bot
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="/", intents=intents)

@bot.event
async def on_ready():
    print(f'✅ Bot logged in as {bot.user}')
    print(f'📅 {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    try:
        synced = await bot.tree.sync()
        print(f'✨ Synced {len(synced)} command(s)')
    except Exception as e:
        print(f'❌ Error syncing commands: {e}')

@bot.tree.command(name="ask", description="Stelle eine Frage an NexusAI")
async def ask(interaction: discord.Interaction, question: str):
    """KI-Chat Command"""
    await interaction.response.defer()
    
    try:
        # Placeholder - wird durch Groq AI ersetzt
        response = f"Frage: {question}\n\n*KI-Antwort wird hier eingefügt*"
        
        await interaction.followup.send(response)
    except Exception as e:
        await interaction.followup.send(f"❌ Fehler: {str(e)}")

@bot.tree.command(name="help", description="Zeige Hilfe-Informationen")
async def help(interaction: discord.Interaction):
    """Hilfe Command"""
    embed = discord.Embed(
        title="🤖 NexusAI - Hilfe",
        description="Alle verfügbaren Commands:",
        color=discord.Color.blue()
    )
    
    commands_list = [
        ("/ask [frage]", "Stelle eine Frage an die KI"),
        ("/script [typ]", "Script-Generator (Roblox, JS, Python)"),
        ("/set_language [sprache]", "Ändere die Bot-Sprache"),
        ("/set_personality [text]", "Passe die KI-Persönlichkeit an"),
        ("/set_channel [kanal]", "Setze Auto-Reply Channel"),
        ("/set_admins [@user]", "Verwalte Admin-Rechte"),
        ("/ai [prompt]", "Teste KI-Antworten"),
    ]
    
    for cmd, desc in commands_list:
        embed.add_field(name=cmd, value=desc, inline=False)
    
    embed.set_footer(text="Made by Alamer | Powered by Groq AI")
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="set_language", description="Ändere die Bot-Sprache")
async def set_language(interaction: discord.Interaction, language: str):
    """Language Command"""
    await interaction.response.send_message(f"✅ Sprache auf '{language}' gesetzt")

@bot.tree.command(name="set_personality", description="Passe KI-Persönlichkeit an")
async def set_personality(interaction: discord.Interaction, personality: str):
    """Personality Command"""
    await interaction.response.send_message(f"✅ Persönlichkeit aktualisiert")

@bot.tree.command(name="set_channel", description="Setze Auto-Reply Channel")
async def set_channel(interaction: discord.Interaction, channel: discord.TextChannel):
    """Channel Command"""
    await interaction.response.send_message(f"✅ AI-Channel auf {channel.mention} gesetzt")

@bot.tree.command(name="set_admins", description="Verwalte Admin-Rechte")
async def set_admins(interaction: discord.Interaction, user: discord.User):
    """Admin Command"""
    await interaction.response.send_message(f"✅ {user.mention} ist jetzt Admin")

@bot.tree.command(name="script", description="Script-Generator")
async def script(interaction: discord.Interaction, script_type: str, description: str):
    """Script Generator Command"""
    await interaction.response.defer()
    
    try:
        # Placeholder für Script-Generierung
        await interaction.followup.send(f"📝 {script_type} Script wird generiert...")
    except Exception as e:
        await interaction.followup.send(f"❌ Fehler: {str(e)}")

# Run bot
if __name__ == "__main__":
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        print("❌ DISCORD_TOKEN nicht gefunden!")
        exit(1)
    
    bot.run(token)
