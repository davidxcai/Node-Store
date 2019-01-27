var mysql = require('mysql');
const inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'music_db'
});

function update(id, title, artist, genre) {
    var update = `UPDATE music SET title = ?, artist = ?, genre = ? WHERE ID = ?`;
    connection.query(update, [title, artist, genre, id], function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

function create(title, artist, genre) {
    var sql = `INSERT INTO music (title, artist, genre) VALUES (?, ?, ?)`;
    connection.query(select, [title, artist, genre], function (err, result) {
        if (err) throw err;
        console.log(result);
    });
}

function select(id) {
    if (id) {
        var select = `SELECT * FROM music WHERE ID = ?`;
        connection.query(select, [id], function (err, result) {
            if (err) throw err;
            console.log(result);
        });
    }
    else {
        connection.query('SELECT * FROM music', function (err, result) {
            if (err) throw err;
            console.log(result);
        });
    }
}

function decimate(id) {
    connection.query("DELETE FROM music WHERE ID = ?", [id], function(err, res) {
        if (err) throw err;
        console.log(res);
    });
}

connection.connect(function (err) {
    if (err) throw err;
    // console.log(`Connected to mySql with ID: ${connection.threadId}`);
});

inquirer.prompt([ 
    {
        name: "action",
        message: "What do you want to do?",
        type: "list",
        choices: ['Create', 'Update', 'Read', 'Delete']
    }
]).then(function(answer) {
    if (answer.action === 'Create') {
        console.log('hello');
        inquirer.prompt([
            {
                name: "song",
                message: "Song:"
            },
            {
                name: "artist",
                message: "Artist/band:"
            },
            {
                name: "genre",
                message: "Genre:"
            }
        ]).then(function(answers) {
            create(answers.song, answers.artist, answers.genre);
            console.log('Song succesfully created!');
        })
    }
    else if (answer.action === 'Update') {
        inquirer.prompt([
            {
                id: "id",
                message: "ID:"
            },
            {
                name: "song",
                message: "Song:"
            },
            {
                name: "artist",
                message: "Artist/band:"
            },
            {
                name: "genre",
                message: "Genre:"
            }
        ]).then(function(answers) {
            update(answers.id, answers.song, answers.artist, answers.genre);
            console.log('Song succesfully updated!');
        })
    }
    else if (answer.action === "Read") {
        inquirer.prompt([
            {
                name: "id",
                message: "ID:"
            },
        ]).then(function(answers) {
            if (answers.id) {
                select(answers.id);
            }
            else {
                select();
            }
        })
    }
    else if (answer.action === "Delete") {
        inquirer.prompt([
            {
                id: "id",
                message: "ID:"
            },
        ]).then(function(answers) {
            decimate(answers.id);
        })
    }
})
