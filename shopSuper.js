const mysql = require('mysql');
const inquirer = require('inquirer');
const divider = '\n--------------------------------------------------\n';

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
});

connection.connect(function (err) {
    if (err) throw err;
    // console.log(`Connected to mySql with ID: ${connection.threadId}`);
});

sales();
// View Product Sales by Department
// Create New Department

function sales() {
    var read = `describe departments`;
    connection.query(read, function(err, data) {
        if (err) throw err;
        console.log(data);
    });
}

function newDep() {

}

function supervisor() {

}