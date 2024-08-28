**Air Quality express api and cron simple app using expressjs and mongoose.**

## Table of contents

* [Installation](#Installation)
* [Testing](#Testing)
* [API Documentation](#Documentation)
* [Key Points](#Points)
* [Assumptions](#Assumptions)

## Installation
```console
$ git clone 
$ npm install
& cp .env.example .env
$ nano .env
$ npm test
$ npm run dev
$ open http://localhost:8080
```
## Dockerized
```console
$ docker compose up --build -d
$ docker compose logs -f
```
## Testing
```console
$ npm test
```
## Documentation
```console
$ open http://localhost:8080/api-docs
```
## Points
    1- Using docker-compose with .env
    2- Customized console log, and file rotated log with request ID.
    3- Api routes/handlers.
    4- Api data serialization and validation using joi.
    5- Services.
    6- models using fields validation and composite index for filtering.
    7- Cronsjob with it's retrieval API.
    8- Unite testing with mock external API example.
    9- Integration testing with stub example.
## Assumptions
    we will save all the data from airvisual that might have the same values on different datetimes to generate a time series on the api level.
    example: we can display on which times the aqius for the same long and lat was the highest.