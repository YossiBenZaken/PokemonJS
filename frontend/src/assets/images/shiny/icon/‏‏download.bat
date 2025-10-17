@echo off
setlocal enabledelayedexpansion

title Pokémon Shiny Downloader
echo =======================================
echo        Pokémon Shiny Downloader
echo =======================================
echo.

REM Set the target folder to the same directory as this BAT file
set "targetFolder=%~dp0"
echo 🗂️ Files will be saved to:
echo %targetFolder%
echo.

REM Ask for range of numbers
set /p startNum=Enter the starting number (e.g. 1): 
set /p endNum=Enter the ending number (e.g. 1008): 

echo.
echo 🚀 Starting download from %startNum% to %endNum%...
echo.

for /l %%i in (%startNum%,1,%endNum%) do (
    set "url=https://www.pokemon-arena.kyokai.hu/images/shiny/icon/%%i.gif"
    set "fileName=%%i.gif"

    echo ⬇️ Downloading: !url!
    curl -L -s -o "%targetFolder%!fileName!" "!url!"

    if exist "%targetFolder%!fileName!" (
        echo ✅ Saved: !fileName!
    ) else (
        echo ⚠️ File %%i.gif not found (skipped)
    )
    echo.
)

echo =======================================
echo 🎉 Done! All available files have been downloaded.
echo =======================================
pause
