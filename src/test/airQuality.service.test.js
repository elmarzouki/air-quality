// unite test with mock external API example
const request = require('supertest');
const nock = require('nock');

const airQualityService = require('../services/airQuality.service');

describe('AirQualityService', () => {
    let airVisualNock;

    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    afterEach(() => {
        nock.cleanAll(); // clean
    });

    it('should return pollution data when the API call succeeds', async () => {
        // Mock the external API request
        airVisualNock = nock('http://api.airvisual.com')
            .get('/v2/nearest_city')
            .query(true)
            .reply(200, {
            data: {
                current: {
                    pollution: {
                        aqicn: 33,
                    }
                }
            }
        });

        const result = await airQualityService.fetchAirQuality(-122.4194, 37.7749);
        
        expect(result.success).to.be.true;
        expect(result.pollution.aqicn).to.equal(33);
        // Validate that Nock intercepted the external API call
        expect(airVisualNock.isDone()).to.be.true;
    });

    it('should handle errors on the API call', async () => {
        // Mock the external API request to simulate an error
        airVisualNock = nock('http://api.airvisual.com')
            .get('/v2/nearest_city')
            .query(true)
            .reply(400, {
                message: "Invalid key"
        });

        const result = await airQualityService.fetchAirQuality(-122.4194, 37.7749);

        // Validate the error is handled correctly
        expect(result.success).to.be.false;
        expect(result.message).to.equal('Failed to fetch data from airvisual');
        // Validate nock intercepted the request
        expect(airVisualNock.isDone()).to.be.true;
    });
});
