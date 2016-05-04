# jimple-builder
Build NodeJS Jimple (https://github.com/fjorgemota/jimple) container from YML (symfony2 like). As your nodeJS project dev dependency, this module will transform a YAML file to ``container.js``.

<!> For ES6 class only <!>

[![Build Status](https://travis-ci.org/ebuildy/jimple-builder.svg?branch=master)](https://travis-ci.org/ebuildy/jimple-builder)
[![Code Climate](https://codeclimate.com/github/ebuildy/jimple-builder/badges/gpa.svg)](https://codeclimate.com/github/ebuildy/jimple-builder)
[![Test Coverage](https://codeclimate.com/github/ebuildy/jimple-builder/badges/coverage.svg)](https://codeclimate.com/github/ebuildy/jimple-builder/coverage)

# Example

```yaml
services:
  doxer:
    jwt:
      class: services/jwt
      arguments: ["@config.jwt.key", "@config.jwt.algo"]

    validator:
      class: services/validator
      arguments: ["@doxer.models.user"]

    data:
      class: services/data
      arguments: ["@config.mongodb.server", "@config.mongodb.db"]

    server:
      class: services/server
      arguments: ["@config.server.port"]
      calls:
        - ["addMiddleware", ["@doxer.validator"]]
        - ["addMiddleware", ["@doxer.middlewares.auth"]]
        - ["addMiddleware", ["@doxer.middlewares.api"]]
```

This will generate:

```js

container.set("doxer.jwt", function(c) {
	const clazz = require("./services/jwt.js");
	const r = new clazz(c.get("config.jwt.key"),c.get("config.jwt.algo"));
	return r;
});

container.set("doxer.validator", function(c) {
	const clazz = require("./services/validator.js");
	const r = new clazz(c.get("doxer.models.user"));
	return r;
});

container.set("doxer.data", function(c) {
	const clazz = require("./services/data.js");
	const r = new clazz(c.get("config.mongodb.server"),c.get("config.mongodb.db"));
	return r;
});

container.set("doxer.server", function(c) {
	const clazz = require("./services/server.js");
	const r = new clazz(c.get("config.server.port"));
	r.addMiddleware(c.get("doxer.validator"));
	r.addMiddleware(c.get("doxer.middlewares.auth"));
	r.addMiddleware(c.get("doxer.middlewares.api"));
	return r;
});
```
