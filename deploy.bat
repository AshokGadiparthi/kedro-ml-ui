@echo off
REM 🚀 Auto-Deploy Script for ML Platform (Windows)
REM This script automatically commits and pushes all changes to GitHub

setlocal enabledelayedexpansion

echo ═══════════════════════════════════════════════════════
echo    🚀 ML Platform - Auto Deploy to GitHub
echo ═══════════════════════════════════════════════════════
echo.

REM Check if git is initialized
if not exist .git (
    echo ⚠️  Git not initialized. Initializing...
    git init
    echo ✅ Git initialized
    echo.
)

REM Check if remote exists
git remote | findstr /C:"origin" >nul
if errorlevel 1 (
    echo ❌ No GitHub remote found
    echo Please add your GitHub repository:
    echo git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    echo.
    exit /b 1
)

REM Get current branch
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set BRANCH=%%i
if "!BRANCH!"=="" set BRANCH=main

echo 📍 Current branch: !BRANCH!
echo.

REM Show status
echo 📝 Changes to be committed:
git status --short
echo.

REM Generate commit message with timestamp
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
    set DATE=%%c-%%a-%%b
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set TIME=%%a:%%b
)
set TIMESTAMP=!DATE! !TIME!

set COMMIT_MSG=🚀 Auto-deploy: Updates from Figma Make - !TIMESTAMP!

REM Allow custom commit message
if not "%~1"=="" set COMMIT_MSG=%~1

echo 💬 Commit message: !COMMIT_MSG!
echo.

REM Stage all changes
echo 📦 Staging changes...
git add .

REM Commit
echo 💾 Committing...
git commit -m "!COMMIT_MSG!"

if errorlevel 1 (
    echo ❌ Commit failed
    exit /b 1
)

echo ✅ Committed successfully
echo.

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push origin !BRANCH!

if errorlevel 1 (
    echo.
    echo ═══════════════════════════════════════════════════════
    echo    ❌ Push failed
    echo ═══════════════════════════════════════════════════════
    echo.
    echo 💡 Possible solutions:
    echo   1. Make sure you have push access to the repository
    echo   2. Check your GitHub credentials
    echo   3. Try: git pull origin !BRANCH! --rebase
    echo   4. Check if repository URL is correct: git remote -v
    echo.
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════
echo    ✅ Successfully deployed to GitHub!
echo ═══════════════════════════════════════════════════════
echo.

REM Get repository URL
for /f "tokens=*" %%i in ('git config --get remote.origin.url') do set REPO_URL=%%i
set REPO_URL=!REPO_URL:.git=!

echo 🔗 View on GitHub:
echo !REPO_URL!
echo.

endlocal
