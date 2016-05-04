var expect = require("expect.js");
var JimpleBuilder = require("..");

describe("JimpleBuilder", function() {

    describe("intern methods", function() {

        it("should resolve arguments", function() {

            var builder = new JimpleBuilder();

            expect(builder.resolveArgument("toto")).to.be('"toto"');
            expect(builder.resolveArgument(12)).to.be(12);
            expect(builder.resolveArgument("@config.toto")).to.be('c.get("config.toto")');
        });

    });

    describe("builder", function()
    {
        it("should build empty container", function ()
        {
            var builder = new JimpleBuilder();

            var containerSrc = builder.build();

            expect(containerSrc).to.be(
                `var Jimple = require("jimple");
var container = new Jimple();

module.exports = container;`);
        });

        it("should parseString", function ()
        {

            var containerSrc = new JimpleBuilder().parseString("config:\n    config1: toto").build();

            eval(containerSrc);

            expect(container.get("config.config1")).to.be("toto");
        });

        it("should write file", function ()
        {

            new JimpleBuilder().parseFile(__dirname + '/a.yml').build(__dirname + '/test1.js');

            const container = require(__dirname + '/test1.js');

            expect(container.get("config.prefix1.config1")).to.be("toto");
        });

        it("should write arguments", function ()
        {

            const container = require(__dirname + '/test1.js');

            const service = container.get('prefix1.prefix2.service2');

            //expect(container.get("config.prefix1.config1")).to.be("toto");
        });

    });
});
