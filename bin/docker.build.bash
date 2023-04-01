docker rmi audio-pack-bot;
docker build -t audio-pack-bot .;
docker run audio-pack-bot -e .env;
