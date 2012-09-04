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

    var add_functions = {
        'Single Cell': function(x, y) {
            GRID[x][y] = true;
        },
        'Block': function(x, y) {
            GRID[x][y] = true;
            GRID[x][y+1] = true;
            GRID[x+1][y] = true;
            GRID[x+1][y+1] = true;
        },
        'Beehive': function(x, y) {
            //GRID[x][y] = true;
        },
        'Glider (NE)': function(x, y) {
            GRID[x][y] = true;
            GRID[x+1][y] = true;
            GRID[x+2][y] = true;
            GRID[x+2][y+1] = true;
            GRID[x+1][y+2] = true;
        },
        'Glider (NW)': function(x, y) {
            GRID[x][y] = true;
            GRID[x+1][y] = true;
            GRID[x+2][y] = true;
            GRID[x][y+1] = true;
            GRID[x+1][y+2] = true;
        },
        'Glider (SE)': function(x, y) {
            GRID[x][y+2] = true;
            GRID[x+1][y] = true;
            GRID[x+1][y+2] = true;
            GRID[x+2][y+2] = true;
            GRID[x+2][y+1] = true;
        },
        'Glider (SW)': function(x, y) {
            GRID[x][y+2] = true;
            GRID[x+1][y] = true;
            GRID[x+1][y+2] = true;
            GRID[x+2][y+2] = true;
            GRID[x][y+1] = true;
        },
        'Block Engine': function(x, y) {
            GRID[x+6][y] = true;
            GRID[x+4][y+1] = true;
            GRID[x+6][y+1] = true;
            GRID[x+7][y+1] = true;
            GRID[x+4][y+2] = true;
            GRID[x+6][y+2] = true;
            GRID[x+4][y+3] = true;
            GRID[x+2][y+4] = true;
            GRID[x][y+5] = true;
            GRID[x+2][y+5] = true;
        },
        'Single Line Gun': function(x, y) {
            GRID[x][y] = true;
            GRID[x+1][y] = true;
            GRID[x+2][y] = true;
            GRID[x+3][y] = true;
            GRID[x+4][y] = true;
            GRID[x+5][y] = true;
            GRID[x+6][y] = true;
            GRID[x+7][y] = true;
            GRID[x+9][y] = true;
            GRID[x+10][y] = true;
            GRID[x+11][y] = true;
            GRID[x+12][y] = true;
            GRID[x+13][y] = true;
            GRID[x+17][y] = true;
            GRID[x+18][y] = true;
            GRID[x+19][y] = true;
            GRID[x+26][y] = true;
            GRID[x+27][y] = true;
            GRID[x+28][y] = true;
            GRID[x+29][y] = true;
            GRID[x+30][y] = true;
            GRID[x+31][y] = true;
            GRID[x+32][y] = true;
            GRID[x+34][y] = true;
            GRID[x+35][y] = true;
            GRID[x+36][y] = true;
            GRID[x+37][y] = true;
            GRID[x+38][y] = true;
        },
    };

    var types = new Array();
    for (var name in add_functions) {
        types.push(name);
    }

    $('#InputType').typeahead({
        source: types,
        items: 4,
        minLength: 0
    });

    /* Event handlers */
    $('#ButtonSettingsSave').click(function(evt) {
        var color, timeout;
        color = $('#InputColor').val();
        timeout = parseInt($('#InputTimeout').val());

        COLOR = color;
        TIMEOUT = timeout;

        $('#ModalSettings').modal('hide');
    });

    $('#ButtonAdd').click(function(evt) {
        var item, x, y;
        item = $('#InputType').val();
        x = parseInt($('#InputX').val());
        y = parseInt($('#InputY').val());

        if (x < 0 || x >= DIM || y < 0 || y >= DIM) {
            alert('Invalid position!');
        } else {
            var fn = add_functions[item];
            if (fn) {
                fn(x, y);
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
                    if (num_neighbours < 2 || num_neighbours > 3) {
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