/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// from https://github.com/firebase/functions-samples/blob/master/quickstarts/uppercase/functions/test/test.js

const chai = require("chai");
const assert = chai.assert;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const sinon = require("sinon");

describe("Cloud Functions", () => {
  var myFunctions,
    configStub,
    adminInitStub,
    functions,
    admin;

  before(() => {
    admin = require("firebase-admin");
    adminInitStub = sinon.stub(admin, "initializeApp");
    functions = require("firebase-functions");
    configStub = sinon.stub(functions, "config").returns({
      firebase: {
        databaseURL: "https://not-a-project.firebaseio.com",
        storageBucket: "not-a-project.appspot.com"
      }
    });
    myFunctions = require("../index");
  });

  after(() => {
    configStub.restore();
    adminInitStub.restore();
  });

  describe("upperCase", () => {
    it("should upper case input and write it to /upperCase", () => {

      const fakeEvent = {
        // signature is: DeltaSnapshot(app: firebase.app.App, adminApp: firebase.app.App,
        // data: any, delta: any, path?: string);
        data: new functions.database.DeltaSnapshot(null, null, null, "toupper")
        // To mock a database delete event: data: new
        // functions.database.DeltaSnapshot(null, null, "old_data", null)
      };

      const setParam = "TOUPPER";

      const refStub = sinon.stub();
      const setStub = sinon.stub();
      // The following 4 lines override the behavior of
      // event.data.ref.parent.child("upperCase") .set("INPUT") to return true
      Object.defineProperty(fakeEvent.data, "ref", { get: refStub });
      refStub.returns({
        set: setStub
      });

      // the actual test happens here: comparing the result with TOUPPER
      setStub.withArgs(setParam).returns(true);

      return assert.eventually.equal(myFunctions.upperCase(fakeEvent), true);
    });
  });

  describe("pureUppercase", () => {
    it("should return a uppercased string", () => {
      return assert.equal(myFunctions.pureUppercase("lowercase"), "LOWERCASE");
    });
  });
});
