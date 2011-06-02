// Simple unit tests for jsdog example

module("Core");
test("truth", function() {
    ok(true, "true is ok");
    ok(! false, "false is ok");
});

module("Library");
test("HelloWorld.bar", function() {
    var hello = new HelloWorld();
    equal(hello.bar(), true, "hello.bar() returns true");
});

