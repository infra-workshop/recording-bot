import * as chai from 'chai';
import * as fs from "fs";
import {markdown} from "../markdown";

describe('markdownのテスト', () => {

    it('フルテスト', () => {

        const resourcesPath = __dirname + "/../../resources/test/";

        const md = fs.readFileSync(resourcesPath + "test.md").toString("utf8");

        chai.assert.equal(markdown(md), fs.readFileSync(resourcesPath + "test.md.html").toString("utf8"));
    })
});
