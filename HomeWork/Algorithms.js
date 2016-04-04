function getJyuliaIterations(x, y, cx, cy, n) {
    var recursion = function(x, y, degree) {
        if (degree > n) return 0;
        if (x * x + y * y > 4) return degree;
        var newX = x * x - y * y + cx;
        var newY = 2 * x * y + cy;
        return recursion(newX, newY, degree + 1);
    };
    return { count: recursion(x, y, 0)};
}

function getAttraction(point, n) {
    for (var i = 0 ; i < n; ++i) {
        for (var r = 0; r < NewtonPoolRoots.length; ++r)
            if (isPointInSurrounding(point.x, point.y, NewtonPoolRoots[r])) 
                return { root: r, count: i + 1};
        point = getNextRealPoint(point);
    }
    return { root: 0, count: 0 };
}

function getMandelbrotIterations(x, y, n) {
    var startX = x;
    var startY = y;
    var recursion = function(x, y, degree) {
        if (degree > n) return 0;
        if (x * x + y * y > 4) return degree;
        var newX = x * x - y * y + startX;
        var newY = 2 * x * y + startY;
        return recursion(newX, newY, degree + 1);
    };
    return { count: recursion(x, y, 0)};
}