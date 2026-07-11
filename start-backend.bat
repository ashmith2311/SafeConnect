@echo off
title SafeConnect Backend Server
echo =======================================
echo   SafeConnect Backend - Auto Starting
echo =======================================
echo Waiting for MySQL to be ready...
timeout /t 10 /nobreak >nul

:retry
echo Starting Spring Boot backend...
"c:\Safe Connect\maven\apache-maven-3.9.6\bin\mvn.cmd" -f "c:\Safe Connect\backend\pom.xml" spring-boot:run
echo Backend stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto retry
