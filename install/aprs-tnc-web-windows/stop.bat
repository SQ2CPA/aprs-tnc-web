@ECHO OFF
TITLE Stop APRS TNC Web

CLS
ECHO #################################################################
ECHO #                   Stop APRS TNC Web                         #
ECHO #################################################################
ECHO.
ECHO This script will stop the APRS TNC Web application containers.
ECHO The containers will not be deleted, and you can start them
ECHO again later using start.bat.
ECHO.
ECHO Press any key to stop the application.
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

:STOP_APP
ECHO.
ECHO Stopping APRS TNC Web application...
docker compose down

ECHO.
ECHO #################################################################
ECHO #           Application stopped successfully!                 #
ECHO #################################################################
ECHO.
ECHO The application containers have been stopped.
ECHO You can run start.bat to launch them again.
ECHO.
PAUSE
EXIT /B 0
