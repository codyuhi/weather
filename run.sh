#!/bin/zsh

docker build --tag 'cody-weather' .
docker run -p 80:80 'cody-weather'