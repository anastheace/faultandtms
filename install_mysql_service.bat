@echo off
echo ===================================================
echo MySQL Complete Setup Script (Run as Administrator)
echo ===================================================
echo.

set MYSQL_BIN="C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"

if not exist %MYSQL_BIN% (
    echo [ERROR] MySQL is not installed in the expected directory.
    echo Expected path: %MYSQL_BIN%
    pause
    exit /b 1
)

echo [1/3] Initializing database directory (no password for root)...
%MYSQL_BIN% --initialize-insecure --console
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Initialization failed or directory might already exist. Proceeding anyway...
)

echo.
echo [2/3] Installing MySQL as a Windows Service...
%MYSQL_BIN% --install MySQL84
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Service installation issue (might already exist).
)

echo.
echo [3/3] Starting the MySQL Service...
net start MySQL84

echo.
echo ===================================================
echo Setup attempt finished! 
echo If it says "The MYSQL84 service was started successfully", you are good to go!
echo.
pause
