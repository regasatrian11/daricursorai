@echo off
echo Installing Supabase CLI...

REM Try to install via npm (local)
echo Trying to install Supabase CLI locally...
npm install supabase --save-dev

REM Check if installation was successful
if exist "node_modules\.bin\supabase.cmd" (
    echo ✅ Supabase CLI installed locally!
    echo.
    echo To use Supabase CLI, run:
    echo npx supabase --version
    echo npx supabase db push
    echo.
    pause
) else (
    echo ❌ Local installation failed
    echo.
    echo Please follow the manual instructions in MIGRATION_INSTRUCTIONS.md
    echo.
    pause
)
