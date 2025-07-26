@ECHO OFF
TITLE APRS TNC Web Starter

CLS
ECHO #################################################################
ECHO #                 APRS TNC Web Starter                        #
ECHO #################################################################
ECHO.
ECHO This script will start the existing APRS TNC Web application.
ECHO.
ECHO Press any key to start.
PAUSE >nul
CLS

:: Change directory to the script's location
CD /D "%~dp0"

:CHECK_DOCKER
ECHO Checking if Docker daemon is running...
docker ps >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO #################################################################
    ECHO # ERROR: Docker daemon is not responding.                     #
    ECHO #################################################################
    ECHO.
    ECHO Could not connect to the Docker service.
    ECHO Please make sure Docker Desktop is started and fully running.
    ECHO.
    PAUSE
    EXIT /B 1
)
ECHO Docker is running.

:CHECK_FILE
IF NOT EXIST "docker-compose.yaml" (
    ECHO.
    ECHO ERROR: docker-compose.yaml not found in this directory.
    ECHO Please run the installer first to download the required files.
    PAUSE
    EXIT /B 1
)

:START_APP
ECHO.
ECHO Starting the APRS TNC Web application...
docker compose up -d

ECHO.
ECHO #################################################################
ECHO #           Application started successfully!                 #
ECHO #################################################################
ECHO.
ECHO To access the web interface, open your browser and go to:
ECHO http://localhost:8000
ECHO.
START http://localhost:8000
PAUSE
EXIT /B 0
