const sinon = require('sinon');
const logger = require('../logger');
const airQualityService = require('../services/airQuality.service');
const CityAirQuality = require('../models/cityAirQuality.model');
const db = require('../db/db.connection');
const { fetchAirQualityCronJob } = require('../jobs/airQuality.cron');

describe('fetchAirQualityCronJob', function() {
    let fetchAirQualityStub;
    let findStub;
    let updateManyStub;
    let saveStub;
    let connectStub;

    let expect;
    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    beforeEach(function() {
        // Stub the air quality service
        fetchAirQualityStub = sinon.stub(airQualityService, 'fetchAirQuality');
        
        // Stub the database methods
        connectStub = sinon.stub(db, 'connect').resolves();
        findStub = sinon.stub(CityAirQuality, 'find').returnsThis();
        updateManyStub = sinon.stub(CityAirQuality, 'updateMany').resolves();

        // Configure the find stub to return an empty array
        findStub.select = sinon.stub().returnsThis();
        findStub.sort = sinon.stub().returnsThis();
        findStub.exec = sinon.stub().resolves([]);
    });

    afterEach(function() {
        sinon.restore();
    });

    it('should log and save air quality data when fetch is successful', async function() {
        const mockAirQualityData = {
            success: true,
            pollution: {
                aqius: 50,
                mainus: 'P2',
                aqicn: 40,
                maincn: 'P2'
            }
        };

        fetchAirQualityStub.resolves(mockAirQualityData);

        const infoSpy = sinon.spy(logger, 'info');

        await fetchAirQualityCronJob(12.34, 56.78);
        sinon.assert.calledOnce(fetchAirQualityStub);
        sinon.assert.calledOnce(connectStub);
        sinon.assert.calledOnce(findStub);
        expect(infoSpy.calledWith(sinon.match.string)).to.be.true;
    });

});
