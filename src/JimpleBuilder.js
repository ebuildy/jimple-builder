"use strict";

const YAML = require('yamljs');
const FS = require('fs');

class JimpleBuilder
{
    constructor(root)
    {
        this.root = root;
        this.services = {};
    }

    parseFile(file)
    {
        const buffer = YAML.load(file);

        return this.parseObject(buffer);
    }

    parseString(str)
    {
        const buffer = YAML.parse(str);

        return this.parseObject(buffer);
    }

    parseObject(obg)
    {
        if (obg.hasOwnProperty('config'))
        {
            var config = JSON.flatten(obg.config, '.');

            for (var configKey in config)
            {
                this.services['config.' + configKey] = {
                    type : 'config',
                    value : config[configKey]
                };
            }
        }

        if (obg.hasOwnProperty('services'))
        {
            var services = JSON.flatten(obg.services, '.');

            for (var serviceKey in services)
            {
                this.services[serviceKey] = services[serviceKey];
                this.services[serviceKey].type = 'services';
            }
        }

        return this;
    }

    build(file)
    {
        const   TAB = "\t",
                EOL = "\n";
        
        var buffer = "";

        buffer += 'var Jimple = require("jimple");' + EOL;

        buffer += 'var container = new Jimple();' + EOL + EOL;

        for(var serviceName in this.services)
        {
            const service = this.services[serviceName];

            if (service.type === 'config')
            {
                buffer += 'container.set("' + serviceName + '", function(c) {' + EOL;
                buffer += TAB + 'return ' + JSON.stringify(service.value) + ';' + EOL;
                buffer += "});\n\n";
            }
            else
            {
                 buffer += 'container.set("' + serviceName + '", function(c) {' + EOL;
                 buffer += TAB + 'const clazz = require("./' + service.class + '.js");' + EOL;

                buffer += TAB + 'const r = new clazz(';

                if (service.hasOwnProperty('arguments'))
                {
                    for (var i = 0; i < service.arguments.length; i++)
                    {
                        buffer += this.resolveArgument(service.arguments[i]);

                        if (i < service.arguments.length - 1) buffer += ',';
                    }
                }

                 buffer += ');' + EOL;

                if (service.hasOwnProperty('calls'))
                {
                    service.calls.forEach((call) =>
                    {
                       buffer += TAB + 'r.' + call[0] + '(';

                        if (call.length > 1)
                        {
                            call[1].map((arg, i, arr) =>
                            {
                                buffer += this.resolveArgument(arg) + ((i < arr.length - 1) ? ',' : '')
                            });
                        }
                        
                        buffer += ');' + EOL
                    });
                }

                buffer += TAB + 'return r;' + EOL;

                 buffer += '});' + EOL + EOL;
            }
        }

        buffer += 'module.exports = container;';

        if (typeof file === 'undefined' || file === false || file === null)
        {
            return buffer;
        }
        else
        {
            FS.writeFileSync(file, buffer);
        }
    }

    resolveArgument(arg)
    {
        if (arg[0] === '@')
        {
            return 'c.get("' + arg.substr(1) + '")'
        }
        else if (typeof arg === "string")
        {
            return JSON.stringify(arg);
        }
        else
        {
            return arg;
        }
    }
}

JSON.flatten = function(data, separator)
{
    var result = {};

    function recurse (cur, prop) {

        if (Object(cur) !== cur || cur.hasOwnProperty('class')) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for(var i=0, l=cur.length; i<l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + separator + p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }

    recurse(data, "");

    return result;
}

module.exports = JimpleBuilder
