# Server Status Checker
A Simple Server Status Checker Using Docker.
> For demo, please visit: https://status.isu.kim

## Usage
You can simply use `Docker Compose`:
```bash
wget https://raw.githubusercontent.com/isu-kim/server-stat-checker/main/docker-compose.yml  # Download Docker compose
wget https://github.com/isu-kim/server-stat-checker/blob/main/data/servers.json  # Docker example server lists
mkdir data && mv server.json data  # Create Server list directory
docker compose up  # or docker-compose up
```

## Configuration
- **Server List**: You can modify server names and their description simply by updating `./data/servers.json`.
- **Login Credential**: In `docker-compose.yml`, change `REACT_APP_PASSWORD` for the password for your website.

## Nginx Reverse Proxy
Use following settings for setting up an reverse proxy in Nginx for HTTPS.
```
server {
        listen 443 ssl;
        server_name status.isu.kim;
        ssl_certificate /etc/letsencrypt/live/status.isu.kim/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/status.isu.kim/privkey.pem;

        location / {
                proxy_pass                          http://127.0.0.1:3000;
                proxy_set_header Host               $host;
                proxy_set_header X-Real-IP          $remote_addr;

                proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto  https;

        }
}
```

## Disclaimer
- The ReactJS template for this website was made it possible by [themesberg](https://github.com/themesberg/volt-react-dashboard). I cut off some redundant codes and just made this as a bootstrap single page.
- I am not a web developer, nor a backend developer. Therefore, the codes might be awful.
- The status check is done by `nc -zv` from the backend API. Therefore, this has no capability to check health status. This will just check ports open.
- The server will compare passwords in plain text. Tried using SHA or hash, but had lack of experience with ReactJS and frontend. (Just was too lazy to implement a DB in backend)

## Contributing and Issues
- If you found any vulnerabilities, I guess there will be some, please PR. I have seen the ReactJS warning about CVEs, but I am too lazy to update them and fix their dependencies. Also, I do not wanted to break the program as well.
- Report issues in the issues section for help. 
