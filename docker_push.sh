echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t whatshouldweplaydiscord .
docker push dunguyen90/whatshouldweplaydiscord:latest