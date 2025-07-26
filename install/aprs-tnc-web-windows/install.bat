@ECHO OFF
TITLE APRS TNC Web Installer

CLS
ECHO #################################################################
ECHO #              APRS TNC Web Installer                         #
ECHO #################################################################
ECHO.
ECHO This script will download the required files and start the
ECHO APRS TNC Web application using Docker.
ECHO.
ECHO Please ensure Docker Desktop is installed AND running before you proceed.
ECHO.
ECHO Press any key to start the installation, or close this window to cancel.
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
    ECHO If Docker is not installed, you can download it from:
    ECHO https://www.docker.com/products/docker-desktop/
    ECHO.
    PAUSE
    EXIT /B 1
)
ECHO Docker is running.

:DOWNLOAD_FILES
ECHO.
ECHO Downloading configuration files...
ECHO Downloading docker-compose.yaml...
curl -s -L "https://raw.githubusercontent.com/SQ2CPA/aprs-tnc-web/master/docker-compose.yaml" -o "docker-compose.yaml"
IF NOT EXIST "docker-compose.yaml" (
    ECHO ERROR: Failed to download docker-compose.yaml. Check your internet connection.
    PAUSE
    EXIT /B 1
)

ECHO.
ECHO Downloading environment file .env...
curl -s -L "https://raw.githubusercontent.com/SQ2CPA/aprs-tnc-web/master/.env.example" -o ".env"
IF NOT EXIST ".env" (
    ECHO ERROR: Failed to download .env file. Check your internet connection.
    PAUSE
    EXIT /B 1
)
ECHO Downloads completed successfully.

:START_APP
ECHO.
ECHO Starting the APRS TNC Web application using Docker Compose...
ECHO This might take a moment as the images need to be pulled...
docker compose up -d

ECHO.
ECHO Waiting for 10 seconds before restarting the application to ensure stability...
TIMEOUT /T 10 /NOBREAK > nul

ECHO.
ECHO Shutting down for a clean restart...
docker compose down

ECHO.
ECHO Restarting the application...
docker compose up -d

ECHO.
ECHO #################################################################
ECHO #         Installation completed successfully!                #
ECHO #################################################################
ECHO.
ECHO The APRS TNC Web application is now running in the background.
ECHO.
ECHO To access the web interface, open your browser and go to:
ECHO http://localhost:8000
ECHO.
ECHO IMPORTANT: After the first launch, go to the settings (top-right icon) 
ECHO to configure your callsign, SSID, and TNC address!
ECHO.
ECHO Launching browser...
START http://localhost:8000

PAUSE
EXIT /B 0
