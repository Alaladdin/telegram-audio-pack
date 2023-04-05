sudo git pull;
docker rm audio-pack-bot -f;
docker rm mpei-audio-pack-bot -f;
docker rmi audio-pack-bot -f;
docker build -t audio-pack-bot ./;
docker run --env-file ./common/envs/.env --name audio-pack-bot --restart on-failure -d audio-pack-bot;
docker run --env-file ./common/envs/.env.mpei --name mpei-audio-pack-bot --restart on-failure -d audio-pack-bot;
docker system prune -f;
