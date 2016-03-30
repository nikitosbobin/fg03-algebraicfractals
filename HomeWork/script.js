var canvas;
var ctx;

function load() {
    canvas = document.getElementById("mCanvas");
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.onmousedown = mouseDown;
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    for (var i = 0; i < canvas.width; ++i)
        for (var j = 0; j < canvas.height; ++j) {
            var p = getComplexPoint(i, j, 2, -2, 2, -2, canvas.width, canvas.height);
            var attr = getAttraction(p, 40);
            switch (attr.root) {
                case 0: imageData.data[4 * (i + canvas.width * j) + 0] = 255;
                        imageData.data[4 * (i + canvas.width * j) + 1] = 0; 
                        imageData.data[4 * (i + canvas.width * j) + 2] = 0;
                        imageData.data[4 * (i + canvas.width * j) + 3] = 255;
                        break;
                case 1: imageData.data[4 * (i + canvas.width * j) + 0] = 0;
                        imageData.data[4 * (i + canvas.width * j) + 1] = 255; 
                        imageData.data[4 * (i + canvas.width * j) + 2] = 0;
                        imageData.data[4 * (i + canvas.width * j) + 3] = 255;
                        break;
                case 2: imageData.data[4 * (i + canvas.width * j) + 0] = 0;
                        imageData.data[4 * (i + canvas.width * j) + 1] = 0; 
                        imageData.data[4 * (i + canvas.width * j) + 2] = 255;
                        imageData.data[4 * (i + canvas.width * j) + 3] = 255;
                        break;
            }
        }
    ctx.putImageData(imageData, 0, 0);
}

function mouseDown(e) {
    var x = e.pageX - 8;
    var y = e.pageY - 8;
    console.log(x, y);
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

function fillPoint(x, y, color) {
    switch(color) {
        case "red": ctx.fillStyle = "#f44336";
            break;
        case "green": ctx.fillStyle = "#4caf50";
            break;
        case "blue": ctx.fillStyle = "#2196f3";
            break;
    }
    ctx.fillRect(x, y, 1, 1);
}

function getComplexPoint(i, j, right, left, top, bottom, width, height) {
    return new Point(i*(right - left)/(width - 1) + left, j*(bottom - top)/(height - 1) + top)
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}