$(function () {
    "use strict";

    // --- Setup ---
    var DIM = 160,
        PLAYING = false,
        GRID = [],
        COLOR = '#00ff00',
        TIMEOUT = 100;

    for (var x=0; x<DIM; x++) {
        GRID[x] = [];
        for (var y=0; y<DIM; y++) {
            GRID[x][y] = false;
        }
    }

    // Manual figures
    var manual_figures = {
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
        '[Spaceship] LWSS (S)': [[0,4],[0,3],[0,2],[0,1],[1,4],[1,0],[2,4],[3,3],[3,0]],
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

    // Use manual figures and figures from js/collection.js
    var figures = $.extend({}, manual_figures, COLLECTION);

    // Add options to <select>
    $.each(figures, function(name, coordinates) {
        $('#SelectFigure').append($('<option></option>').val(name).html(name));
    });

    // --- Event handlers ---
    $('#ButtonSettingsSave').click(function () {
        var bg, color, timeout, dim;
        bg = $('#InputBackground').val();
        color = $('#InputColor').val();
        timeout = parseInt($('#InputTimeout').val(), 10);
        dim = parseInt($('#InputDim').val(), 10);

        $('#GoL').css('background-color', bg);
        COLOR = color;
        TIMEOUT = timeout;

        if (dim !== DIM) {
            DIM = dim;
            GRID = [];
            for (var x=0; x<DIM; x++) {
                GRID[x] = [];
                for (var y=0; y<DIM; y++) {
                    GRID[x][y] = false;
                }
            }
            draw();
        }

        $('#ModalSettings').modal('hide');
    });

    $('#ButtonAdd').click(function () {
        var figure, x, y;
        figure = $('#SelectFigure').val();
        x = parseInt($('#InputX').val(), 10);
        y = parseInt($('#InputY').val(), 10);

        if (x < 0 || x >= DIM || y < 0 || y >= DIM) {
            alert('Invalid position!');
        } else if (figure === '') {
            alert('No figure');
        } else {
            var coordinates = figures[figure];
            if (coordinates) {
                for (var i=0; i<coordinates.length; i++) {
                    GRID[x+coordinates[i][0]][y+coordinates[i][1]] = true;
                }
            } else {
                alert('Not a valid figure.');
            }
        }

        $('#ModalAdd').modal('hide');
        draw();
    });

    $('#ButtonClear').click(function () {
        for (var x=0; x<GRID.length; x++) {
            for (var y=0; y<GRID[x].length; y++) {
                GRID[x][y] = false;
            }
        }
        draw();
    });

    $('#TogglePlay').click(function () {
        if (PLAYING) {
            PLAYING = false;
        } else {
            PLAYING = true;
            play();
        }
    });

    $('#ButtonStep').click(function () {
        step();
        draw();
    });

    $('#ButtonFullscreen').click(function () {
        var $gol = $('#GoL');
        $gol = $gol[0];
        $gol.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        $gol.mozRequestFullScreen();
    });

    // This is a little handier in fullscreen mode
    $('#GoL').click(function () {
        if (PLAYING) {
            PLAYING = false;
            $('#TogglePlay').removeClass('active');
        } else {
            PLAYING = true;
            $('#TogglePlay').addClass('active');
            play();
        }
    });

    // --- Functions ---
    function draw () {
        var $gol = $('#GoL'),
            canvas, context, dim, blocksize;

        canvas = $gol[0];
        if (canvas.getContext) {
            context = canvas.getContext('2d');
            /* Adjust canvas size. */
            var w, h;
            w = $(document).width();
            h = $(document).height();
            dim = w < h? w: h;
            dim -= 54;
            canvas.width = dim;
            canvas.height = dim;
            $gol.innerWidth(dim);
            $gol.innerHeight(dim);
            blocksize = dim/DIM;

            //Clear canvas.
            canvas.width = canvas.width;
            
            // Print GRID to canvas.
            context.fillStyle = COLOR;
            for (var x=0; x<GRID.length; x++) {
                for (var y=0; y<GRID[x].length; y++) {
                    if (GRID[x][y]) {
                        context.fillRect(x*blocksize, y*blocksize, blocksize, blocksize);
                    }
                }
            }
        }
    }

    function step () {
        var buffer_last,
            buffer_current,
            num_neighbours;

        for (var x=0; x<GRID.length; x++) {
            buffer_last = buffer_current;
            buffer_current = GRID[x].slice();

            for (var y=0; y<buffer_current.length; y++) {
                // Count neighbours.
                num_neighbours = 0;
                // Row to the left.
                if (buffer_last) {
                    if (buffer_last[y-1]) {num_neighbours++;}
                    if (buffer_last[y]) {num_neighbours++;}
                    if (buffer_last[y+1]) {num_neighbours++;}
                }
                // This row.
                if (buffer_current[y-1]) {num_neighbours++;}
                if (buffer_current[y+1]) {num_neighbours++;}
                // Row to the right.
                if (GRID[x+1]) {
                    if (GRID[x+1][y-1]) {num_neighbours++;}
                    if (GRID[x+1][y]) {num_neighbours++;}
                    if (GRID[x+1][y+1]) {num_neighbours++;}
                }
                // Apply rules (shortened - only changes)
                if ((buffer_current[y] && num_neighbours !== 2 && num_neighbours !== 3) || (!buffer_current[y] && num_neighbours === 3)) {
                    GRID[x][y] = !buffer_current[y];
                }
            }
        }
    }

    function play () {
        step();
        draw();
        if (PLAYING) {
            setTimeout(play, TIMEOUT);
        }
    }

});