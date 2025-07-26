=================================================
  APRS TNC Web - Windows Installer README
=================================================

Thank you for using the APRS TNC Web installer!
This folder contains scripts to help you install, run, and manage the application on Windows.

---

## Step 1: Prerequisites - Docker

The application runs using Docker technology. If you don't have it on your computer yet, you need to install it, nothing else.

- **Download Docker Desktop for Windows:** https://www.docker.com/products/docker-desktop/

After installation, make sure Docker Desktop is running. You will usually see a whale icon in your taskbar. The application must be fully running for the scripts to work.

---

## Step 2: Installation

1.  Run the **install.bat** file.
2.  The script will first check if the Docker service is enabled. If not, it will display an error.
3.  Next, it will download the necessary configuration files (`docker-compose.yaml` and `.env`).
4.  Finally, it will launch the application. **The script is designed to run until the application starts correctly and a page opens in your web browser.** This process might take a moment on the first run, as Docker needs to download the application images. If an error occurs (e.g., no connection to Docker), the process will be aborted.

---

## Step 3: Post-Installation Configuration (VERY IMPORTANT!)

After a successful installation and the page opens automatically in your browser, you must configure the application to connect to your device.

1.  In the web interface, go to **Settings** (the gear icon in the top right corner).
2.  In the **TNC Address** field, enter the IP address of your TNC/LoRa device along with the port, for example: **192.168.1.100:8001**.
3.  Fill in your **Callsign**, the **SSID** for the LoRa device (e.g., -7 for a mobile station), and your station's **Location**.
4.  Save the settings. From this point on, you should see APRS frames in the interface.

---

## Managing the Application

In the folder, you will find additional scripts for managing the application:

- **start.bat**: Starts the application if it was previously stopped.
- **stop.bat**: Stops the application from running (but does not delete any data or files).
- **uninstall.bat**: Completely removes the application, its data, and configuration files. **Use with caution!**

---

73! Damian SQ2CPA
