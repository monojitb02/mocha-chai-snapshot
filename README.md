# mocha-chai-snapshot

Hook for chai to generate and matche snapshot in testing node application just like in jest

## Getting Started

Install mocha-chai-snapshot using [`npm`](https://www.npmjs.com/):

```bash
npm install --save-dev mocha-chai-snapshot
```

Example Useage
```javascript
// first.spec.js  => The first file test-runner executes or add these below lines at the top of every spec file
const chai = require('chai');
const chaiSnapshot = require('mocha-chai-snapshot');
const { expect } = chai;
chai.use(chaiSnapshot);


//component.spec.js
describe("GET /hello", () =>{
    it("Should say Hello to Starnger", () => {
        return request(app)
        .get('/hello')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
            expect(body).to.matchSnapshot(this);
        });
    });

    it("Should say Hello to Jhon", () => {
        return request(app)
        .get('/hello')
        .query({ name: 'Jhon' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
            expect(body).to.matchSnapshot(this);
        });
    });
});
```
It will automatically create(if `CHAI_SNAPSHOT_UPDATE` environment variable to `true`) `__snapshots__` folder in same folder of specs and snapshot file like below
```javascript
exports[`GET /hello : Should say Hello to Starnger 1`] = "Hello, stranger!";
exports[`GET /hello : Should say Hello to Jhon 1`] = {
  "name": "Jhon",
  "say": "Hello"
};
```

If the found snapshot does not match with the actuals and you want to update the related snapshots, use `isForced` in `expect` chain.

Example Useage
```javascript
// first.spec.js  => The first file testrunner executes or add these below lines at the top of every spec file
const chaiSnapshot =require('mocha-chai-snapshot');

chai.use(chaiSnapshot);


//component.spec.js
it("Should say Hello", () => {
    return request(app)
      .get('/hello')
      .query({ name: 'Jack' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body }) => {
        expect(body).isForced.to.matchSnapshot(this);
      });
});
```

Or

Set `CHAI_SNAPSHOT_UPDATE = true` to update the snapshots if there is any mismatch in any of the spec files even if `isForced` is not used.

**Warning!:** Do not set `CHAI_SNAPSHOT_UPDATE = true` in build pipeline. If it is set, build will never fail even if there is no snapshots available in the `__snapshots__` folder.

**Notes:** It is tested in `mocha v5.2.0` and `chai v4.2.0`.