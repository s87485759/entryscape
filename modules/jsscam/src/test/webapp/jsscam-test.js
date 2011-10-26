function JSSCAMTest (name) {
	TestCase.call(this, name);
}
JSSCAMTest.prototype = new TestCase();

JSSCAMTest.prototype.setUp = function () {
	this.value = 'Hello';
};

JSSCAMTest.prototype.testValue = function() {
	this.assertEquals('Hello', this.value);
};

/*JSSCAMTest.prototype.testValueFail = function() {
	this.assertEquals('Good-bye', this.value);
};*/