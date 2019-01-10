/**
*
* @filename burst.js
*
*
*
*
**************************************************/

module.exports.burst = function (logRecord){
	
	this.timePoints.push(logRecord["DateObj"].now());
	while (this.timePoints[this.timePoints.length - 1] - this.timePoints[0] > this.period){
		this.timePoints.unshift();
	}
	
	if (this.timePoints.length > this.rate){
		
		if(this.timePoints.length > this.maxBurst){
			return false;
		}
		
		this.burstStart = (this.burstStart == -1) ? logRecord["DateObj"].now() : this.burstStart;
		if (logRecord["DateObj"].now() - this.burstStart > this.maxBurstPeriod){
			return false;
		}
	}
	
	this.burstStart = -1;
	return true;
}