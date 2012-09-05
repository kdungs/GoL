$(function() {

    /* Setup */
    var DIM = 160,
        PLAYING = false,
        GRID = new Array(),
        COLOR = '#00ff00',
        TIMEOUT = 100;

    for (var x=0; x<DIM; x++) {
        GRID[x] = new Array();
        for (var y=0; y<DIM; y++) {
            GRID[x][y] = false;
        }
    }

    /*
    // Manual figures
    // Commented out since external figures from js/collection.js are used.
    var figures = {
        'Single Cell': [[0,0]],
        // Stationaries
        '[Stationary] Block': [[0,0],[0,1],[1,0],[1,1]],
        '[Stationary] Beehive': [[1,0],[2,0],[0,1],[3,1],[1,2],[2,2]],
        '[Stationary] Loaf': [[0,1],[1,0],[1,2],[2,0],[2,3],[3,1],[3,2]],
        '[Stationary] Boat': [[0,0],[0,1],[1,0],[1,2],[2,1]],
        // Oscillators
        '[Oscillator] Blinker (horiz.)': [[0,0],[1,0],[2,0]],
        '[Oscillator] Blinker (vert.)': [[0,0],[0,1],[0,2]],
        '[Oscillator] Toad': [[1,0],[2,0],[3,0],[0,1],[1,1],[2,1]],
        '[Oscillator] Beacon': [[0,0],[0,1],[1,0],[1,1],[2,2],[2,3],[3,2],[3,3]],
        // Spaceships
        '[Spaceship] Glider (NE)': [[0,0],[1,0],[2,0],[2,1],[1,2]],
        '[Spaceship] Glider (NW)': [[0,0],[1,0],[2,0],[0,1],[1,2]],
        '[Spaceship] Glider (SE)': [[0,2],[1,0],[1,2],[2,2],[2,1]],
        '[Spaceship] Glider (SW)': [[0,2],[1,0],[1,2],[2,2],[0,1]],
        '[Spaceship] LWSS (E)': [[4,1],[4,2],[4,3],[3,0],[3,3],[2,3],[1,3],[0,0],[0,2]],
        '[Spaceship] LWSS (W)': [[0,1],[0,2],[0,3],[1,0],[1,3],[2,3],[3,3],[4,0],[4,2]],
        '[Spaceship] LWSS (N)': [[0,0],[0,1],[0,2],[0,3],[1,0],[1,4],[2,0],[3,1],[3,4]],
        // Methuselahs
        '[Methuselah] F-pentomino': [[0,1],[1,0],[1,1],[1,2],[2,0]],
        '[Methuselah] Diehard': [[0,1],[1,1],[1,2],[5,2],[6,0],[6,2],[7,2]],
        '[Methuselah] Acorn': [[0,2],[1,0],[1,2],[3,1],[4,2],[5,2],[6,2]],
        // Guns
        '[Gun] Gosper glider gun': [[0,4],[0,5],[1,4],[1,5],[10,4],[10,5],[10,6],[11,3],[11,7],[12,2],[12,8],[13,2],[13,8],[14,5],[15,3],[15,7],[16,4],[16,5],[16,6],[17,5],[20,2],[20,3],[20,4],[21,2],[21,3],[21,4],[22,1],[22,5],[24,0],[24,1],[24,5],[24,6],[34,3],[34,4],[35,3],[35,4]],
        '[Gun] Minimal (10 cell)': [[0,5],[2,4],[2,5],[4,1],[4,2],[4,3],[6,0],[6,1],[6,2],[7,1]],
        '[Gun] 5x5': [[0,0],[0,1],[0,4],[1,0],[1,3],[2,0],[2,3],[2,4],[3,2],[4,0],[4,2],[4,3],[4,4]],
        '[Gun] Single row': [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[9,0],[10,0],[11,0],[12,0],[13,0],[17,0],[18,0],[19,0],[26,0],[27,0],[28,0],[29,0],[30,0],[31,0],[32,0],[34,0],[35,0],[36,0],[37,0],[38,0]],
    };
    */

    // Use figures from js/collection.js
    var figures = COLLECTION;

    var names = new Array();
    for (var name in figures) {
        names.push(name);
    }

    $('#InputFigure').typeahead({
        source: names,
        items: 12,
        minLength: 0
    });

    /* Event handlers */
    $('#ButtonSettingsSave').click(function(evt) {
        var bg, color, timeout, dim;
        bg = $('#InputBackground').val();
        color = $('#InputColor').val();
        timeout = parseInt($('#InputTimeout').val());
        dim = parseInt($('#InputDim').val());

        $('#GoL').css('background-color', bg);
        COLOR = color;
        TIMEOUT = timeout;

        if (dim !== DIM) {
            DIM = dim;
            delete GRID;
            for (var x=0; x<DIM; x++) {
                GRID[x] = new Array();
                for (var y=0; y<DIM; y++) {
                    GRID[x][y] = false;
                }
            }
            draw();
        }

        $('#ModalSettings').modal('hide');
    });

    $('#ButtonAdd').click(function(evt) {
        var figure, x, y;
        figure = $('#InputFigure').val();
        x = parseInt($('#InputX').val());
        y = parseInt($('#InputY').val());

        if (x < 0 || x >= DIM || y < 0 || y >= DIM) {
            alert('Invalid position!');
        } else if (figure === '') {
            alert('No figure');
        } else {
            var coordinates = figures[figure];
            if (coordinates) {
                for (c in coordinates) {
                    GRID[x+coordinates[c][0]][y+coordinates[c][1]] = true;
                }
            } else {
                alert('Not a valid figure.');
            }
        }

        $('#ModalAdd').modal('hide')
        draw();
    });

    $('#ButtonClear').click(function(evt) {
        for (var x=0; x<GRID.length; x++) {
            for (var y=0; y<GRID[x].length; y++) {
                GRID[x][y] = false;
            }
        }
        draw();
    });

    $('#TogglePlay').click(function(evt) {
        if (PLAYING) {
            PLAYING = false;
        } else {
            PLAYING = true;
            play();
        }
    });

    $('#ButtonStep').click(function(evt) {
        step();
        draw();
    });


    /* Functions */
    function draw() {
        var canvas = document.getElementById('GoL'),
            $gol = $('#GoL'),
            c, dim, blocksize;

        if (canvas.getContext) {
            c = canvas.getContext('2d');

            /* Adjust canvas size... */
            var w, h;
            w = $(document).width();
            h = $(document).height();
            dim = w < h? w: h;
            dim -= 104;

            canvas.width = dim;
            canvas.height = dim;

            $('#GoL').innerWidth(dim);
            $('#GoL').innerHeight(dim);

            blocksize = dim/DIM;

            /* Clear canvas. */
            canvas.width = canvas.width;
            
            /* Print GRID to canvas. */
            c.fillStyle = COLOR;
            for (var x=0; x<GRID.length; x++) {
                for (var y=0; y<GRID[x].length; y++) {
                    if (GRID[x][y]) {
                        //c.fillRect(x*blocksize+1, y*blocksize+1, blocksize-1, blocksize-1);
                        c.fillRect(x*blocksize, y*blocksize, blocksize, blocksize);
                    }
                }
            }
        }
    }

    function step() {
        var new_grid = new Array(),
            num_neighbours;
        for (var x=0; x<GRID.length; x++) {
            new_grid[x] = new Array();
            for(var y=0; y<GRID[x].length; y++) {
                /* Count live neighbours. */
                num_neighbours = 0;
                if (GRID[x-1]) {
                    if (GRID[x-1][y-1]) num_neighbours++;
                    if (GRID[x-1][y]) num_neighbours++;
                    if (GRID[x-1][y+1]) num_neighbours++;
                }
                if (GRID[x][y-1]) num_neighbours++;
                if (GRID[x][y+1]) num_neighbours++;
                if (GRID[x+1]) {
                    if (GRID[x+1][y-1]) num_neighbours++;
                    if (GRID[x+1][y]) num_neighbours++;
                    if (GRID[x+1][y+1]) num_neighbours++;
                }
                /* Evaluate rules. */
                if (GRID[x][y]) {
                    /* (x, y) is a live cell. */
                    if (num_neighbours < 2 || num_neighbours > 3) {
                        /* Too few or too many neighbours -> Cell dies. */
                        new_grid[x][y] = false;
                    } else {
                        /* 2 or 3 neighbours -> Cell survives. */
                        new_grid[x][y] = true;
                    }
                } else {
                    /* (x, y) is a dead cell. */
                    if (num_neighbours === 3) {
                        /* New cell by reproduction. */
                        new_grid[x][y] = true;
                    } else {
                        /* No reproduction, cell stays dead. */
                        new_grid[x][y] = false;
                    }
                }
            }
        }
        delete GRID;
        GRID = new_grid;
    }

    function play() {
        step();
        draw();
        if (PLAYING) {
            setTimeout(play, TIMEOUT);
        }
    }

});