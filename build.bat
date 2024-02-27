@echo off
if not exist "pokemon-showdown" git clone https://github.com/smogon/pokemon-showdown
if not exist pokemon-showdown\data\mods\digimon md pokemon-showdown\data\mods\digimon
robocopy "mods\digimon" "pokemon-showdown\data\mods\digimon" /nfl /ndl /njh /njs /nc /ns /np >nul
robocopy "config" "pokemon-showdown\config" formats.ts /nfl /ndl /njh /njs /nc /ns /np >nul
cd pokemon-showdown
if "%~1" == "run" (
    node pokemon-showdown && cd ..
) else (
    npm run build && cd ..
)
exit /b 0
