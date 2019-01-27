const mysql = require('mysql');
const inquirer = require('inquirer');
const divider = '\n--------------------------------------------------\n';

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
});

function read(func, id) {
    if (id) {
        var select = `SELECT * FROM products WHERE item_id = ?`;
        connection.query(select, [id], function (err, result) {
            if (err) throw err;
            console.log(result);
        });
        func();
    }
    else {
        connection.query('SELECT * FROM products', function (err, result) {
            if (err) throw err;
            console.log(divider);
            result.forEach(function (x, i) {
                var left = Number(result[i].stock_quantity);
                console.log(`Item: ${result[i].product_name}`);
                console.log(`ID: ${result[i].item_id}`);
                console.log(`$${result[i].price}`);
                if (left <= 0) {
                    console.log(`Out of stock`);
                }
                else {
                    console.log(`In stock: ${left}`);
                }
                console.log(divider);
            });
        });
        func();
    }
}

function resetstock(quantity, id) {
    var update = `UPDATE products SET stock_quantity = ? WHERE item_id = ?`;
    connection.query(update, [quantity, id], function (err, result) {
        if (err) throw err;
        console.log(`reset stock: ${quantity}`);
    });
}

function update(quantity, id, func) {
    var update = `UPDATE products SET stock_quantity = ? WHERE item_id = ?`;
    var select = `SELECT * FROM products WHERE item_id = ?`;
    connection.query(select, [id], function (err, result) {
        if (err) throw err;
        var stock = result[0].stock_quantity;
        var remaining = result[0].stock_quantity -= quantity;
        var total = result[0].price * quantity;
        console.log(`quantity before: ${stock}`);
        if (stock > 0) {
            if (remaining < 0) {
                console.log(divider);
                console.log("Insufficient stock; unable to complete purchase");
                console.log(divider);
            }
            else {
                connection.query(update, [remaining, id], function (err) {
                    if (err) throw err;
                    console.log(`quantity after: ${remaining}`);
                    console.log(divider);
                    console.log("Thank you for your purchase!\n");
                    console.log(`Total: $${total}`);
                    console.log(divider);
                });
            }
        }
        else {
            console.log(divider);
            console.log(`Out of stock`);
            console.log(divider);
        }
    });
    func();
}

connection.connect(function (err) {
    if (err) throw err;
    // console.log(`Connected to mySql with ID: ${connection.threadId}`);
});

function prompt() {
    inquirer.prompt([
        {
            name: 'itemid',
            message: 'What is the id of the product you would like to purchase?',
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: 'quantity',
            message: 'How many would you like to purchase?',
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (answers) {
        update(answers.quantity, answers.itemid, prompt);
        // resetstock(answers.quantity, answers.itemid);
    })
}
read(prompt);