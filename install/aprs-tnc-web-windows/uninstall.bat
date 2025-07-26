@ECHO OFF
TITLE APRS TNC Web Uninstaller

CLS
ECHO #################################################################
ECHO #              APRS TNC Web Uninstaller                       #
ECHO #################################################################
ECHO.
ECHO WARNING: This script will stop and permanently remove the
ECHO APRS TNC Web application, its containers, volumes (data), 
ECHO and all downloaded files (docker-compose.yaml, .env).
ECHO.
CHOICE /C YN /M "Are you sure you want to completely uninstall?"
IF %ERRORLEVEL%==2 (
    ECHO Uninstall cancelled.
    GOTO:EOF
)
CLS

:: Change directory to the script's location
CD /D "%~dp0"

:STOP_APP
ECHO.
ECHO Stopping and removing Docker containers and volumes...
ECHO This will delete all application data.
docker compose down --volumes >nul 2>&1
ECHO Containers and data have been removed.

:DELETE_FILES
ECHO.
ECHO Deleting local files...
IF EXIST "docker-compose.yaml" (
    DEL "docker-compose.yaml"
    ECHO Deleted docker-compose.yaml
)
IF EXIST ".env" (
    DEL ".env"
    ECHO Deleted .env
)

ECHO.
ECHO #################################################################
ECHO #           Uninstallation completed successfully!            #
ECHO #################################################################
ECHO.
PAUSE
EXIT /B 0
