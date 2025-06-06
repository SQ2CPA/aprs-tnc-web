# APRS TNC Web

A simple, web-based APRS interface for your KISS mode TNC. Decode frames, view raw data, send and receive messages, all from a web browser.

## Overview

APRS TNC Web offers a straightforward way to interact with the APRS network. By connecting your TNC in KISS mode, you get access to a clean web interface to monitor local APRS traffic and manage your messages. The entire application runs within a Docker container, making it incredibly easy to deploy on any system in your network-be it a Raspberry Pi, a home server, or your desktop computer.

This project is specifically designed for amateur radio operators looking for a simple, cross-platform alternative to more complex or Windows-only software like APRSIS32. If your primary needs are monitoring local activity and handling APRS messages, APRS TNC Web is for you! :)

## Features

-   **KISS TNC Integration:** Connects to any TNC operating in KISS mode via TCP/IP.
-   **Frame Decoding:** Decodes and displays incoming APRS frames in a clean, human-readable format.
-   **Raw Frame View:** Inspect the raw, undecoded APRS frames for diagnostics or deeper analysis.
-   **Messaging:** Send and receive APRS messages through a user-friendly web interface.
-   **Dockerized Deployment:** Runs in a Docker container for an easy, one-command setup and complete portability.
-   **Web-Based Interface:** Access your APRS feed from any device with a web browser on your local network.

## Getting Started

Getting APRS TNC Web up and running is designed to be as simple as possible.

### Prerequisites

-   A functional Docker environment. If you don't have Docker installed, follow the [official installation instructions](https://docs.docker.com/get-docker/) for your operating system.
-   A TNC connected to your system and configured for KISS mode.

### Installation

1.  **Get the necessary files.**
    Simply copy the `docker-compose.yaml` file to a directory on your machine.

2.  **Configure your environment.**
    Create a file named `.env` in the same directory. You can use the `.env.example` as a template:

    ```sh
    PORT=8000

    DB_HOST=mysql_db
    DB_USER=aprstncweb
    DB_PASSWORD=aprstncweb
    DB_NAME=aprstncweb
    DB_PORT=3306

    MYSQL_ROOT_PASSWORD=aprstncweb
    MYSQL_DATABASE=aprstncweb
    MYSQL_USER=aprstncweb
    MYSQL_PASSWORD=aprstncweb
    ```

3.  **Launch the application.**
    With Docker running, open a terminal in your project directory and run the following command:

    ```bash
    docker compose up -d
    ```

    This command will pull the required Docker image, create the container, and start the application in the background.

4.  **Access the web interface.**
    Once the container is running, the application is available on your network. Open a web browser and navigate to:

    `http://<your-device-ip>:8000`

    Replace `<your-device-ip>` with the IP address of the machine running Docker.

## Usage

Once you open the web interface, you will see a real-time log of decoded APRS frames from your TNC. You can use the navigation to switch to the raw frames view or to access the messaging page, where you can compose and send new APRS messages. Please go to settings (right top corner) first and set your details like your device callsign and SSID! Don't forget to put your TNC address with port!

## Future Development

The current version of APRS TNC Web focuses on the core functionalities of monitoring local traffic and messaging. While sufficient for many users, future enhancements are being considered.

-   **Object/Item Beacons:** Support for creating and broadcasting APRS objects or items is not yet implemented but is a potential feature for a future release.
-   **Advanced UI features:** Enhancements like mapping or advanced data filtering are not on the immediate roadmap but are not ruled out.

Contributions and feature suggestions are welcome!

# 73, Damian SQ2CPA, Poland
