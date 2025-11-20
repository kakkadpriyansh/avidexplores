# cat  /etc/nginx/sites-available/avid-devsite-le-ssl.conf
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name dev.avidexplorers.in 4v3hiw.salite.site;
root /home/ChHBwpoOSiqKnXpa/avid-devsite/public_html;

access_log /home/ChHBwpoOSiqKnXpa/avid-devsite/logs/access.log;
error_log /home/ChHBwpoOSiqKnXpa/avid-devsite/logs/error.log;

location = /favicon.ico {
    log_not_found off;
    access_log off;
}

location = /robots.txt {
    allow all;
    log_not_found off;
    access_log off;
}

location /.well-known/ {
    auth_basic off;
}

location ^~ /.well-known/acme-challenge/ {
    alias /var/www/html/.well-known/acme-challenge/;
    try_files $uri =404;
}

include /home/ChHBwpoOSiqKnXpa/avid-devsite/conf/nginx/*.conf;    
            
        index index.html;

location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection upgrade;
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;

    # Dont Remove this line without technical support
    
}
    
            ssl_certificate    /etc/letsencrypt/live/avid-devsite/fullchain.pem;
        ssl_certificate_key    /etc/letsencrypt/live/avid-devsite/privkey.pem;
    }

