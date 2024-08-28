// integration test with stub example
const request = require('supertest');
const sinon = require('sinon');

const app = require('../app');
const airQualityService = require('../services/airQuality.service');

describe('Air Quality API Tests', () => {
    let expect;
    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    // test GET health_check
    describe('GET /air_quality/health_check', () => {
      it('should return 200 with an "ok" message', async () => {
        const res = await request(app).get('/air_quality/health_check');
        // Validate api response code
        expect(res.statusCode).to.equal(200);
        // Validate the received data
        expect(res.body).to.have.property('message', 'ok');
      });
    });
    
    // test POST nearest_city
    describe('POST /air_quality/nearest_city', () => {
        let serviceStub;

        beforeEach(async () => {
            // define moked response for stub
            const mockedResponse = {
                success: true,
                pollution: {
                    aqicn: 33,
                }
            };
            // Stub the fetchAirQuality method to return the mocked response
            serviceStub = sinon.stub(airQualityService, 'fetchAirQuality').resolves(mockedResponse);
        });
        afterEach(() => {
            sinon.restore(); // restore
        });

        // validate best case scenario
        it('should return pollution data for valid coordinates', async () => {
            const response = await request(app)
                .post('/air_quality/nearest_city')
                .send({ longitude: -122.4194, latitude: 37.7749 });
            // Validate api response code
            expect(response.status).to.equal(200);
            // Validate the received data structure
            expect(response.body).to.have.property('Result');
            expect(response.body.Result).to.have.property('Pollution');
            // Validate the received data sample
            expect(response.body.Result.Pollution).to.have.property('aqicn', 33);
            // Verify that the service method was called
            sinon.assert.calledOnce(serviceStub);
            
        });
        // validate missing pram scenario
        it('should return 400 for missing parameters', async () => {
            const response = await request(app)
                .post('/air_quality/nearest_city')
                .send({ longitude: -122.4194 });
            // Validate api response code
            expect(response.status).to.equal(400);
            // Validate the received data structure
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.be.an('array');
            // Validate the received data sample
            expect(response.body.message).to.include('"latitude" is required');
            // Verify that the service method was called
            sinon.assert.notCalled(serviceStub);
        });
    });
});