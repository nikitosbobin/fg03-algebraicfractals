var env;

function Environment() {
    this.canvas;
    this.ctx;
    this.colorsField;
    this.leftP = -2;
    this.rightP = 2;
    this.topP = 2;
    this.bottomP = -2;
}

function getComplexPoint(i, j) {
    return { x: i*(env.rightP - env.leftP)/(env.canvas.width - 1) + env.leftP,
             y: j*(env.bottomP - env.topP)/(env.canvas.height - 1) + env.topP };
}

function load() {
    env = new Environment();
    env.canvas = document.getElementById("mCanvas");
    env.ctx = env.canvas.getContext('2d');
    env.ctx.fillStyle = "#000";
    env.ctx.fillRect(0, 0, env.canvas.width, env.canvas.height);
    var mouseHandler = new MouseHander();
    env.canvas.onmousedown = mouseHandler.mouseDown;
    env.canvas.onmouseup = mouseHandler.mouseUp;
    env.canvas.onmousemove = mouseHandler.mouseMove;
    env.colorsField = document.getElementById("drawing_type");
    drawFractal(env.ctx);
}

function removeHybridColor(colorsFieldObj) {
    colorsFieldObj.remove(3);
}

function appendHybridColor(colorsFieldObj) {
    colorsFieldObj.appendChild(new Option("Hybrid", 3, false, false));
}

function myParseInteger(source, defaultValue) {
    var result = parseInt(source);
    if (!!result) return result;
    return defaultValue;
}

function myParseFloat(source, defaultValue) {
    var result = parseFloat(source);
    if (!!result) return result;
    return defaultValue;
}

function drawFractal() {
    var context = env.ctx;
    var algorithm = myParseInteger(document.getElementById("algorithm_type").value, 0);
    var drawingType = myParseInteger(document.getElementById("drawing_type").value, 0);
    var iterations = myParseInteger(document.getElementById("iterations_field").value, 10);
    var juliaRealConstant = myParseFloat(document.getElementById("julia_real").value, -0.12);
    var juliaImagineConstant = myParseFloat(document.getElementById("julia_imagine").value, 0.74);
    var imageData = context.createImageData(env.canvas.width, env.canvas.height);
    for (var i = 0; i < env.canvas.width; ++i)
        for (var j = 0; j < env.canvas.height; ++j) {
            var p = getComplexPoint(i, j);
            var attr;
            switch (algorithm) {
                case 0: attr = getAttraction(p, iterations);
                    break;
                case 1: attr = getMandelbrotIterations(p.x, p.y, iterations);
                    break;
                case 2: attr = getJyuliaIterations(p.x, p.y, juliaRealConstant, juliaImagineConstant, iterations); 
                    break;
            }
            switch (drawingType) {
                case 0: 
                    if (algorithm == 0)
                        classicDrawing1(i, j, attr.root, imageData);
                    else
                        classicDrawing2(i, j, attr.count, imageData);
                    break;
                case 1: levelDrawing(attr.count, iterations, i, j, imageData); break;
                case 2: zebraDrawing(attr.count, i, j, imageData); break;
                case 3: hybridDrawing(attr.count, iterations, attr.root, i, j, imageData); break;
            }
        }
    context.putImageData(imageData, 0, 0);
}

function algorithmChange(obj) {
    algorithm = parseInt(obj.value);
    if (algorithm == 0) appendHybridColor(env.colorsField); 
    else removeHybridColor(env.colorsField);
}

function fillPoint(imageData, x, y, pixel) {
    imageData.data[4 * (x + env.canvas.width * y) + 0] = pixel.r;
    imageData.data[4 * (x + env.canvas.width * y) + 1] = pixel.g; 
    imageData.data[4 * (x + env.canvas.width * y) + 2] = pixel.b;
    imageData.data[4 * (x + env.canvas.width * y) + 3] = pixel.a;
}

function MouseHander() {
    this.isMouseDown = false;
    this.startPoint = null;
    this.endPoint = null;
    this.lastData = null;
    this.statesStack = [];
}

MouseHander.prototype = {
    mouseDown: function (e) {
        this.lastData = env.ctx.getImageData(0, 0, env.canvas.width, env.canvas.height);
        this.isMouseDown = true;
        this.startPoint = { x: e.pageX - 8, y: e.pageY - 8 };
    },
    mouseMove: function (e) {
        if (this.isMouseDown) {
            var x = e.pageX - 8;
            var y = e.pageY - 8;
            env.ctx.strokeStyle = "#000";
            env.ctx.strokeWidth = 2;
            var dx = Math.abs(x - this.startPoint.x);
            var dy = Math.abs(y - this.startPoint.y);
            var summaryDelta = 0;
            if (dx > dy) {
                summaryDelta = dx;
                this.endPoint = { x: this.startPoint.x + dx, y: this.startPoint.y + dx};
            }else {
                summaryDelta = dy;
                this.endPoint = { x: this.startPoint.x + dy, y: this.startPoint.y + dy};
            }
            env.ctx.putImageData(this.lastData, 0, 0);
            env.ctx.strokeRect(this.startPoint.x, this.startPoint.y, summaryDelta, summaryDelta);
        }
    },
    mouseUp: function (e) {
        this.isMouseDown = false;
        var r = this.endPoint.x;
        var b = this.endPoint.y;
        var l = this.startPoint.x;
        var t = this.startPoint.y;
        var tmp1 = getComplexPoint(l, t);
        var tmp2 = getComplexPoint(r, b);
        if(!this.statesStack)
            this.statesStack = [];
        this.statesStack.push({ l: env.leftP, r: env.rightP, t: env.topP, b: env.bottomP });
        env.leftP = tmp1.x;
        env.topP = tmp1.y;
        env.rightP = tmp2.x;
        env.bottomP = tmp2.y;
        drawFractal();
        this.startPoint = null;
        this.lastData = null;
    }
}

function unzoom() {
    if (statesStack.length > 0) {
        var tmp = statesStack.pop();
        leftP = tmp.l;
        topP = tmp.t;
        rightP = tmp.r;
        bottomP = tmp.b;
        drawFractal();
    }
}

var NewtonPoolRoots = [
    { x: 1,                    y: 0},
    { x: -Math.cos(Math.PI/3), y: Math.sin(Math.PI/3) },
    { x: -Math.cos(Math.PI/3), y: -Math.sin(Math.PI/3) }
];

function getNextRealPoint(point) {
    var a = point.x * point.x;
    var b = point.y * point.y;
    var X = 2 * point.x / 3 + (a - b) / (3 * Math.pow((a + b), 2));
    var Y = 2 * point.y * (1 - point.x / Math.pow((a + b), 2)) / 3;
    return { x: X, y: Y };
}

function isPointInSurrounding(x, y, root) {
    var epsylon = 0.0001;
    return Math.abs(x - root.x) <= epsylon && Math.abs(y - root.y) <= epsylon;
}