#!/bin/zsh

docker build --tag 'weather' .
docker run -p 80:80 'weather'