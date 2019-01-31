
## The LogRecord (Advance)

The logRecord will be primarily of concern to persons creating their own custom 
filter plugins or custom target extensions. Otherwise, most users will need not 
concern themselves with details of the logRecord.

The logRecord is an object that stores the raw data that is to be processed and/or 
the resulting output. It holds data such as the name of the logger that sent it 
through the pipeline, the severity of the event and even a Javascript Date Object 
for conveniently operating on and marking dates. The logRecord is *read-only* 
and should never be altered, especially since the same logRecord is passed 
to each parent logger in any logger hierarchies.

The logRecord is of particular interest to filters. The log record conveniently 
makes fields available that can be examined to decide whether or not to filter 
a potential log output.

Additionally the logRecord is made available as the first argument to targets. 
The target can then choose to write the logRecord's output field as is, or 
can choose another field from the logRecord.

Furthermore, a logRecord is the first argument of the callback function when 
listening to events.

Below is an example logRecord.

```javascript
var logRecord = {
	"DateObj": Date(2020, 11, 14, 15, 0, 59),	//Hidden Field
	"timestamp": "14 Dec 2020 15:00:59 -0600",		
	"loggerName": "myLogger",
	"level": "debug",
	"levelNum": 4,
	"message": "Sample Log Message",
	"uuid": "3cf2552c-1dba-11e9-ab14-d663bd873d93",
	
	//Output is determined by the formatter used
	"output": "debug Sample Log Message"
};
```

