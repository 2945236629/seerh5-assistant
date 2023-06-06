var expect = chai.expect;

describe('Loader', function () {
    it('should be true', function () {
        const core = window.sac;
        expect(sac.SacReady).true;
        expect(sac.SeerH5Ready).true;
        expect(core.checkEnv()).true;
    });

    it('should return true immediately', function (done) {
        const core = window.sac;
        core.CoreLoader().then((r) => {
            if (r) done();
            else done('load failed');
        });
    });
});
