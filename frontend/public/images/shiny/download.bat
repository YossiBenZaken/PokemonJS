@echo off
setlocal enabledelayedexpansion

title Pokémon Shiny Downloader
echo =======================================
echo     Pokémon Shiny Downloader
echo =======================================
echo.

REM קובע שהתיקייה לשמירה היא אותה תיקייה של הסקריפט
set "targetFolder=%~dp0"
echo 🗂️ קבצים יישמרו בתיקייה:
echo %targetFolder%
echo.

REM בקשת טווח המספרים
set /p startNum=803
set /p endNum=1102

echo.
echo 🚀 מתחיל להוריד קבצים מ-%startNum% עד %endNum%...
echo.

for /l %%i in (%startNum%,1,%endNum%) do (
    set "url=https://www.pokemon-arena.kyokai.hu/images/shiny/%%i.gif"
    set "fileName=%%i.gif"

    echo ⬇️ מוריד: !url!
    curl -L -s -o "%targetFolder%!fileName!" "!url!"

    if exist "%targetFolder%!fileName!" (
        echo ✅ נשמר: !fileName!
    ) else (
        echo ⚠️ קובץ %%i.gif לא נמצא (דילוג)
    )
    echo.
)

echo =======================================
echo 🎉 סיום! כל הקבצים שהיו זמינים הורדו.
echo =======================================
pause