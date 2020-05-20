echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t whatshouldweplaydiscord:latest .
docker push whatshouldweplaydiscord:latest