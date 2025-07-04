# APRS TNC Web

A simple, web-based APRS interface for your KISS mode TNC. Decode frames, view raw data, send and receive messages, all from a web browser.

![photo_2025-06-08_19-05-56](https://github.com/user-attachments/assets/621928f4-4b38-481d-b429-3af6274b6f7d)

## Overview

APRS TNC Web offers a straightforward way to interact with the APRS network. By connecting your TNC in KISS mode, you get access to a clean web interface to monitor local APRS traffic and manage your messages. The entire application runs within a Docker container, making it incredibly easy to deploy on any system in your network-be it a Raspberry Pi, a home server, or your desktop computer.

This project is specifically designed for amateur radio operators looking for a simple, cross-platform alternative to more complex or Windows-only software like APRSIS32. If your primary needs are monitoring local activity and handling APRS messages, APRS TNC Web is for you! :)

![chrome_mj3AbZRk8i](https://github.com/user-attachments/assets/d7891911-d386-4703-bf9a-f19899f28738)

## Features

-   **KISS TNC Integration:** Connects to any TNC operating in KISS mode via TCP/IP.
-   **Frame Decoding:** Decodes and displays incoming APRS frames in a clean, human-readable format.
-   **Raw Frame View:** Inspect the raw, undecoded APRS frames for diagnostics or deeper analysis.
-   **Messaging:** Send and receive APRS messages through a user-friendly web interface.
-   **Dockerized Deployment:** Runs in a Docker container for an easy, one-command setup and complete portability.
-   **Web-Based Interface:** Access your APRS feed from any device with a web browser on your local network.

## Quick Start

1.  **Install Docker.**
    Make sure you have a working Docker environment. You can download [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your operating system.

2.  **Create a directory.**
    Create a new folder for the project files, for example: `aprs-tnc-web`.

    ```bash
    mkdir aprs-tnc-web
    cd aprs-tnc-web
    ```

3.  **Create the environment file.**
    Copy the content of `.env.example` from the repository and save it as a new file named `.env` in your project directory.

4.  **Create the Docker Compose file.**
    Copy the `docker-compose.yaml` file from the repository into the same directory.

5.  **Launch the application.**
    Open a terminal in your project directory and run the following command:
    ```bash
    docker compose up -d
    ```
    The application will now be running and available at `http://<your-ip>:8000`, where `<your-ip>` is the IP address of the machine running Docker.

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

## More photos

![photo_2025-06-08_19-07-00](https://github.com/user-attachments/assets/d6b05ec8-f327-4939-99c4-56cf0c2a9e38)
![photo_2025-06-08_17-27-07](https://github.com/user-attachments/assets/befa045e-f82d-4075-8844-6dfd49baa553)
![photo_2025-06-08_17-21-43](https://github.com/user-attachments/assets/07adb6dd-727b-465c-81c4-b4202d37fef2)
![chrome_TF5KFSzTqi](https://github.com/user-attachments/assets/48a03eee-466f-4cfe-93d9-0e2ef6b6d137)
![chrome_Wsy8Iw6629](https://github.com/user-attachments/assets/ed70c992-947b-499c-a176-8176fac8543b)
![chrome_jBn9GE52Bo](https://github.com/user-attachments/assets/2b0d733a-0603-4dfc-9b77-6dac49ec9c17)
![chrome_HRfkZLLFTP](https://github.com/user-attachments/assets/ecf8e668-6ade-4f20-baeb-44cbf2280ce0)
![chrome_FkLh7KnkmK](https://github.com/user-attachments/assets/ba30ea04-81a4-481b-a8c6-6d177919849a)
![chrome_dvkzRCPzzb](https://github.com/user-attachments/assets/7d7ce8e7-5715-4f13-9a1d-c61f510ae860)
![chrome_b0UGKKvwAS](https://github.com/user-attachments/assets/d60930cd-3953-447a-9ce5-23f8a9f237d8)
