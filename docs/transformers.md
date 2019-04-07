## Transformers

Transformers modify the log output in a manner determined by a function. Loggerize 's 
transformers can be applied to individual [tokens](#token) or a whole output 
string. Transformers are designated inside a formatter's configuration and can 
take the form of a string, array of strings or an anonymous function in the 
case of user defined transformers.

**N.B.** When using the JSON output format, the transformer 
can only be applied to individual tokens and not the output string.

### Transforming Output

To transform the entire log output, add the 'transformer' field with the name 
of the desired transformation you desire to the root level of the formatter's 
config. 

```
// @filename transformer-output.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: {
			"name": "myFormatter",
			"transformer": "uppercase", //Call the uppercase transformer
			"format": "%{level} %{message}",
		}
	},
});

logger.info("Log Message Test!");	//Output => 'INFO LOG MESSAGE TEST!'
```

The above example applies a single transformer (uppercase) to the entire log 
output by declaring the name of the transformer as a text string on the 
transformer field. Transformers affecting output are applied as the final step 
in the log pipeline (i.e. after all other formatting).


### Transforming Tokens

For more fine grained control of transformations, you can apply the transformation 
on the individual token level.

```javascript
// @filename transformer-token.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: {
			"name": "myFormatter",
			"message": {
				"transformer": ["lowercase"],
			},
			"format": "%{level} %{message}",
		}
	},
});

logger.info("Log Message Test!");	//Output => 'info log message test!'
```

The above example applies a single transformer (lowercase) using the transformation 
array syntax which will apply all the transformers listed in the array to the token.


### User-Defined Transformers (Advance)

Advance users who wish to add their own custom transformers can do so very easily 
using the module-level `addTransformer` function. This function takes two arguments, 
the name of the transformer and a function definition that does the transforming.

#### Using Custom Transformers on Output

The below example creates a custom transformer that truncates the log output 
after the first ten characters.

```javascript
// @filename transformer-add.js
var Loggerize = require("loggerize");

Loggerize.addTransformer("truncateAfterTen", function(input){ 
	return input.substring(0, 10); 
});

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: {
			"name": "myFormatter",
			"transformer": "truncateAfterTen",
			"format": "%{level} %{message}",
		}
	},
});

logger.info("Log Message Test!");	//Output => 'info Log M'
```

Transformers created using the module-level `addTransformer` are available to 
all formatters.

#### Using Custom Transformers on Tokens

Custom transformation on tokens can be as easy as creating an anonymous funtion.

```javascript
// @filename transformer-anonymous.js
var Loggerize = require("loggerize");

let logger = Loggerize.createLogger({
	"name": "myLogger", 
	"handle": {
		name: "myHandle",
		target: "console",
		formatter: {
			"name": "myFormatter",
			"level": {
				"transformer": function(input){
					return input.substring(0, 2); 
				}
			},
			"format": "%{level} %{message}",
		}
	},
});

logger.info("Log Message Test!");	//Output => 'in Log Message Test!'
```

The above transformer is applied to the level token and truncates the severity 
level to only output the first two characters of the level name.


