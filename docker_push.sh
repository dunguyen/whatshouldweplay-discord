echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t dunguyen90/whatshouldweplaydiscord:latest .
docker push dunguyen90/whatshouldweplaydiscord:latest