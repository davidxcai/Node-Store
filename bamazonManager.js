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

connection.connect(function (err) {
    if (err) throw err;
    // console.log(`Connected to mySql with ID: ${connection.threadId}`);
});

function read(low) {
    if (low) {
        connection.query('SELECT * FROM products', function (err, result) {
            if (err) throw err;
            console.log(divider);
            console.log("Low stock items: ")
            result.forEach(function (x, i) {
                var left = Number(result[i].stock_quantity);
                if (left < 5) {
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
                }
            });
        });
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
    }
    keepgoing();
}

function addMore(quantity, id) {
    var update = `UPDATE products SET stock_quantity = ? WHERE item_id = ?`;
    var select = `SELECT * FROM products WHERE item_id = ?`;
    connection.query(select, [id], function (err, result) {
        if (err) throw err;
        var stock = Number(result[0].stock_quantity);
        var remaining = stock += Number(quantity);
        connection.query(update, [remaining, id], function (err) {
            if (err) throw err;
            console.log(divider);
            console.log(`Total in stock: ${remaining}`);
            console.log(divider);
        });
    });
    keepgoing();
}

function addNew(product, department, price, stock) {
    var select = `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)`;
    connection.query(select, [product, department, price, stock], function (err, result) {
        if (err) throw err;
        console.log(divider);
        console.log(`Succesfully added "${product}" into inventory.`);
        console.log(divider);
        read();
    });
    keepgoing();
}

manager();

function keepgoing() {
    inquirer.prompt([
        {
            name: "action",
            message: "Would you like to do something else?",
            type: "list",
            choices: ["Yes", "No"]
        }
    ]).then(function(answer) {
        if (answer.action === "Yes") {
            manager();
        }
        else if (answer.action === "No") {
            console.log("Goodbye.");
        }
    })
}

function manager() {
    inquirer.prompt([
        {
            name: "action",
            message: "What would you like to do?",
            type: "list",
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
        }
    ]).then(function(answer) {
        var a = answer.action;
        if (a === 'View Products for Sale') {
            read();
        }
        else if (a === 'View Low Inventory') {
            low = true;
            read(low);
        }
        else if (a === 'Add to Inventory') {
            inquirer.prompt([
                {
                    name: "id",
                    message: "What is the ID of the item you want to update?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        else {
                            console.log(' Please enter a number.')
                            return false;
                        }
                    }
                },
                {
                    name: "stock",
                    message: "How much would you like to add?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        else {
                            console.log(' Please enter a number.')
                            return false;
                        }
                    }
                }
            ]).then(function(ans) {
                addMore(ans.stock, ans.id);
            });
        }
        else if (a === 'Add New Product') {
            inquirer.prompt([
                {
                    name: "product",
                    message: "What would you like to add?"
                },
                {
                    name: "department",
                    message: "What department does this belong to?"
                },
                {
                    name: "price",
                    message: "Set the price of the item: ",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        else {
                            console.log(' Please enter a number.')
                            return false;
                        }
                    }
                },
                {
                    name: "stock",
                    message: "Set the inventory quantity: ",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        else {
                            console.log(' Please enter a number.')
                            return false;
                        }
                    }
                }
            ]).then(function(ans) {
                addNew(ans.product, ans.department, ans.price, ans.stock);
            });
        }
    });
}