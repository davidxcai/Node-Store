const mysql = require('mysql');
const inquirer = require('inquirer');
const colors = require('colors');
const Format = require('format-number');
const format = Format({ prefix: '$', integerSeparator: ','});
const divider = '\n--------------------------------------------------\n';

const con = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
});

con.connect(err => {
    if (err) throw err;
    console.log(divider);
    console.log(`\t    Welcome to Shoppingtons!`.green);
    console.log(divider);
    prompt();
});

//Selects all items from products database
function read(id, where) {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM products ${where}`, [id], (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    })
}

//Formats display when read() is invoked in the prompt
function pretty(x) {
    console.log(divider)
    x.forEach((y, i) => {
        let left = `In stock: \t${x[i].stock_quantity}`;
        if (left <= 0) {left = 'Out of stock'.red;}
        console.log(`ID: \t\t${x[i].item_id}`);
        console.log(`Item: \t\t${x[i].product_name}`);
        console.log(`Price: \t\t${x[i].price}`);
        console.log(`${left}`);
        console.log(`Department: \t${x[i].department_name}`);
        console.log(divider);
    })
}

//Calculates total and updates products database
function summary(q, id) {
    var where = 'WHERE item_id = ?';
    read(id, where).then(res => {
        if (res[0].stock_quantity === 0) {
            console.log('Out of stock.'.red)
        }
        else if (res[0].stock_quantity < q) {
            console.log('Insufficient stock.'.magenta);
        }
        else {
            let total = parseFloat(q * res[0].price * 1.06).toFixed(2);
            let tax = parseFloat(q * res[0].price * 0.06).toFixed(2);
            let sales = parseFloat(total + res[0].product_sales).toFixed(2);
            let left = res[0].stock_quantity -= q;
            console.log(divider);
            console.log('Order Summary:\n');
            console.log(`Tax: \t\t${tax}\n`);
            console.log(`Quantity: \t${q}\n`);
            console.log(`Total: \t\t${total}`);
            console.log(divider)
            confirm(update, left, sales, id);
        }
    })
}

//Before it updates the database, prompts the user to confirm the purchase
function confirm(func, q, s, id) {
    inquirer.prompt({
        name: 'confirm',
        message: 'Please confirm your order:',
        type: 'list',
        choices: ['Confirm'.green, 'Cancel'.red]
    }).then(a => {
        if (a.confirm === 'Confirm'.green) {
            func(q, s, id);
        }
        else if (a.confirm === 'Cancel'.red) {
            keepgoing();
        }
    })
}

function update(q, sales, id) {
    let update = `UPDATE products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?`;
    con.query(update, [q, sales, id], (err) => {
        if (err) throw err;
        console.log(divider);
        console.log('\t   Thank you, your order is on its way!'.green);
        console.log(divider);
        keepgoing();
    })
}

//Checks to see if value of ID is a number
function validator(value) {
    var reg = /^\d+$/;
    return reg.test(value) || "Please enter a number!".red;
}

//Searches the database based on a specific ID
function id(func, condition) {
    let message = 'What is the ID of the product?';
    if (func === quantity) {message = 'What is the ID of the product you want to buy?';}
    inquirer.prompt({
        name: 'id',
        message: message,
        validate: validator
    }).then(a => {
        if (func === read) {
            func(a.id, condition).then(res => {
                pretty(res);    //formats the result from read()
                keepgoing();    //prompts for another action
            });
        }
        else if (func === quantity) {
            func(a.id); //prompts user to enter quantity and passing the id to quantity
        }
    })
}

function quantity(id) { //id is passed from id(), holding the value to pass onto confirm()
    inquirer.prompt({
        name: 'q',
        message: 'Please enter the quantity you want to purchase:',
        validate: validator
    }).then(a => {
        summary(a.q, id);
    })
}

function prompt() {
    inquirer.prompt({
        name: 'action',
        message: 'What would you like to do?',
        type: 'list',
        choices: ['Shop all', 'Search by product ID', 'Quit']
    }).then(a => {
        if (a.action === 'Shop all') {
            read().then(res => {
                pretty(res);
                id(quantity);
            });
        }
        else if (a.action === 'Search by product ID') {
            var where = 'WHERE item_id = ?';
            id(read, where);

        }
        else if (a.action === 'Quit') {
            quit();
        }
    })
}

function keepgoing() {
    inquirer.prompt({
        name: 'action',
        message: 'Would you like to do something else?',
        type: 'list',
        choices: ['Yes', 'No']
    }).then(a => {
        if (a.action === 'Yes') {
            prompt();
        }
        else if (a.action === 'No') {
            quit();
        }
    })
}

function quit() {
    console.log(divider);
    console.log(`\t   Thank you, come back soon!`.cyan);
    console.log(divider);
    con.end();
}