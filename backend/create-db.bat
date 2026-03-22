@echo off
REM Quick MySQL setup for SureFix - assumes root has NO password
echo Setting up MySQL database for SureFix...

REM Try common MySQL paths
set MYSQL_PATH=
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
if exist "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_PATH=C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe

if "%MYSQL_PATH%"=="" (
  echo ERROR: MySQL not found. Install MySQL or add to PATH
  pause
  exit /b 1
)

%MYSQL_PATH% -u root -e "CREATE DATABASE IF NOT EXISTS surefix_db;"
%MYSQL_PATH% -u root surefix_db < config\schema_fixed.sql

echo ✅ Database surefix_db created and seeded!
echo Test connection: node test-db-connection.js
pause
