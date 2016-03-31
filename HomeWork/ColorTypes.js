function classicDrawing(dataProvider) {
    var pixel = { r: 0, g: 0, b: 0, a: 255 };
    if (dataProvider.root || dataProvider.root == 0) {
        switch (dataProvider.root) {
            case 0: pixel = { r: 255, g: 0,   b: 0,   a: 255 }; break;
            case 1: pixel = { r: 0,   g: 255, b: 0,   a: 255 }; break;
            case 2: pixel = { r: 0,   g: 0,   b: 255, a: 255 }; break;
        }
    } else if (dataProvider.count) {
        var color = dataProvider.count == 0 ? 0 : 255;
        pixel = { r: color, g: color, b: color, a: 255 }
    }
    fillPoint(dataProvider.imageData, dataProvider.x, dataProvider.y, pixel);
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

function zebraDrawing(n, x, y, imageData) {
    var colors = n % 2 == 0 ? 0 : 255;
    fillPoint(imageData, x, y, { r: colors, g: colors, b: colors, a: 255 });
}

function levelDrawing(n, x, y, imageData) {
    var brightness = iterations > 1 ? 255*n/(iterations - 1) : 255;
    fillPoint(imageData, x, y, { r: brightness, g: brightness, b: brightness, a: 255 });
}