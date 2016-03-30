var canvas;
var ctx;
var leftP = -2;
var rightP = 2;
var topP = 2;
var bottomP = -2;
var drawingType = 0;
var iterations = 10;

function getComplexPoint(i, j) {
    return { x: i*(rightP - leftP)/(canvas.width - 1) + leftP,
             y: j*(bottomP - topP)/(canvas.height - 1) + topP };
}

function load() {
    canvas = document.getElementById("mCanvas");
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    canvas.onmousemove = mouseMove;
    drawFractal();
}

function drawFractal() {
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    for (var i = 0; i < canvas.width; ++i)
        for (var j = 0; j < canvas.height; ++j) {
            var p = getComplexPoint(i, j);
            var attr = getAttraction(p, iterations);
            switch (drawingType) {
                case 0: classicDrawing(i, j, attr.root, imageData); break;
                case 1: levelDrawing(attr.count, i, j, imageData); break;
                case 2: zebraDrawing(attr.count, i, j, imageData); break;
                case 3: hybridDrawing(attr.count, attr.root, i, j, imageData); break;
            }
        }
    ctx.putImageData(imageData, 0, 0);
}

function hybridDrawing(n, root, x, y, imageData) {
    var pixel;
    var brightness = iterations > 1 ? 255*n/(iterations - 1) : 255;
    switch (root) {
        case 0: pixel = { r: brightness, g: 0,   b: 0,   a: 255 }; break;
        case 1: pixel = { r: 0,   g: brightness, b: 0,   a: 255 }; break;
        case 2: pixel = { r: 0,   g: 0,   b: brightness, a: 255 }; break;
    }
    fillPoint(imageData, x, y, pixel);
}

function onItChange(obj) {
    iterations = obj.value;
    drawFractal();
}

function zebraDrawing(n, x, y, imageData) {
    var colors = n % 2 == 0 ? 0 : 255;
    fillPoint(imageData, x, y, { r: colors, g: colors, b: colors, a: 255 });
}

function levelDrawing(n, x, y, imageData) {
    var brightness = iterations > 1 ? 255*n/(iterations - 1) : 255;
    fillPoint(imageData, x, y, { r: brightness, g: brightness, b: brightness, a: 255 });
}

function classicDrawing(x, y, root, imageData) {
    var pixel;
    switch (root) {
        case 0: pixel = { r: 255, g: 0,   b: 0,   a: 255 }; break;
        case 1: pixel = { r: 0,   g: 255, b: 0,   a: 255 }; break;
        case 2: pixel = { r: 0,   g: 0,   b: 255, a: 255 }; break;
    }
    fillPoint(imageData, x, y, pixel);
}

function fillPoint(imageData, x, y, pixel) {
    imageData.data[4 * (x + canvas.width * y) + 0] = pixel.r;
    imageData.data[4 * (x + canvas.width * y) + 1] = pixel.g; 
    imageData.data[4 * (x + canvas.width * y) + 2] = pixel.b;
    imageData.data[4 * (x + canvas.width * y) + 3] = pixel.a;
}

var isMouseDown = false;
var startPoint = null;
var endPoint = null;
var lastData = null;
var statesStack = [];
function mouseDown(e) {
    lastData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    isMouseDown = true;
    startPoint = { x: e.pageX - 8, y: e.pageY - 8 };
}

function mouseMove(e) {
    if (isMouseDown) {
        var x = e.pageX - 8;
        var y = e.pageY - 8;
        ctx.strokeStyle = "#000";
        ctx.strokeWidth = 2;
        var dx = Math.abs(x - startPoint.x);
        var dy = Math.abs(y - startPoint.y);
        var summaryDelta = 0;
        if (dx > dy) {
            summaryDelta = dx;
            endPoint = { x: startPoint.x + dx, y: startPoint.y + dx};
        }else {
            summaryDelta = dy;
            endPoint = { x: startPoint.x + dy, y: startPoint.y + dy};
        }
        ctx.putImageData(lastData, 0, 0);
        ctx.strokeRect(startPoint.x, startPoint.y, summaryDelta, summaryDelta);
    }
}

function drawingTypeChange(obj) {
    drawingType = parseInt(obj.value);
    drawFractal();
}

function mouseUp(e) {
    isMouseDown = false;
    var r = endPoint.x;
    var b = endPoint.y;
    var l = startPoint.x;
    var t = startPoint.y;
    var tmp1 = getComplexPoint(l, t);
    var tmp2 = getComplexPoint(r, b);
    statesStack.push({ l: leftP, r: rightP, t: topP, b: bottomP });
    leftP = tmp1.x;
    topP = tmp1.y;
    rightP = tmp2.x;
    bottomP = tmp2.y;
    drawFractal();
    startPoint = null;
    lastData = null;
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

var roots = [
    { x: 1,                    y: 0},
    { x: -Math.cos(Math.PI/3), y: Math.sin(Math.PI/3) },
    { x: -Math.cos(Math.PI/3), y: -Math.sin(Math.PI/3) }
];

function getAttraction(point, n) {
    for (var i = 0 ; i < n; ++i) {
        for (var r = 0; r < roots.length; ++r)
            if (isPointInSurrounding(point.x, point.y, roots[r])) 
                return { root: r, count: i + 1};
        point = getNextRealPoint(point);
    }
    return { root: 0, count: 0 };
}

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