### Transformers

As the name suggests, transformers modify the log output in a manner determined by a function. Loggerize 
provides two built in transformers, uppercase and lowercase.

```
var Loggerize = require("../lib/index.js");
Loggerize.addFormatter({
	"name": "myFormatter",
	"transformer": "uppercase",
	"format": "%{level} %{message}",
});
let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"hasHandles": false //set to false to avoid automatically adding the default handle
});
logger.attachHandles({
	name: "myHandle",
	target: "console",
	formatter: "myFormatter",
});
logger.info("Log Message Test!");	//Output => 'INFO LOG MESSAGE TEST!'
```

Transformers are stipulated using the `transformer` property of the formatter. The above example 
uses the built in transformer `uppercase` to convert the log output string to all uppercase characters.

Transformers can also 

"transformer": function(input){ return input.substring(0, 10); },

**NOTE** Transformers only run on text output, hence it does not run on JSON.

Transformers applied to the whole output string (not individual tokens) that affect case















