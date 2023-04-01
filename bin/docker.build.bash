sudo git pull;
docker rm audio-pack-bot;
docker rm mpei-audio-pack-bot;
docker rmi audio-pack-bot;
docker build -t audio-pack-bot ./;
docker run --env-file ./common/envs/.env --name audio-pack-bot -d audio-pack-bot;
docker run --env-file ./common/envs/.env.mpei --name mpei-audio-pack-bot -d audio-pack-bot;
