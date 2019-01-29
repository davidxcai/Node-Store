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
    console.log(divider);
    console.log(`\t   Welcome back, Mr. Shoppington`);
    console.log(divider);
    manager();
});

function read(low) {
    if (low) {
        connection.query('SELECT * FROM products', function (err, result) {
            if (err) throw err;
            console.log(divider);
            console.log("Low stock items: \n")
            var few = false;
            result.forEach(function (x, i) {
                var left = Number(result[i].stock_quantity);
                if (left <= 5) {
                    few = true;
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
            if (!few) {
                console.log("None; all items sufficiently stocked.");
                console.log(divider);
            }
            keepgoing();
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
            keepgoing();
        });
    }
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
            keepgoing();
        });
    });
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
}

//checks to see if the number is greater than 0
function validateTest(value) {
    if (isNaN(value) === false) {
        if (Number(value) <= 0) {
            return "Please enter a number greater than 0.";
        } else {
            return true;
        }
    } else if (isNaN(value)) {
        return "Please enter a number.";
    }
}

function keepgoing() {
    inquirer.prompt([
        {
            name: "action",
            message: "Would you like to do something else?",
            type: "list",
            choices: ["Yes", "No"]
        }
    ]).then(function (answer) {
        if (answer.action === "Yes") {
            manager();
        }
        else if (answer.action === "No") {
            console.log("Goodbye.");
        }
    })
}

function confirm(action, name, dep, price, q, id) {
    if (action === 'addNew') {
        console.log(divider);
        console.log(`Adding item(s) to inventory:`);
        console.log(`Item: ${name}`);
        console.log(`Department: ${dep}`)
        console.log(`Price: ${price}`);
        console.log(`Quantity: ${q}`);
        console.log(divider);
        inquirer.prompt({
            name: "action",
            message: "Please Confirm:",
            type: 'list',
            choices: ['Confirm', 'Cancel']
        }).then(function (ans) {
            if (ans.action === 'Confirm') {
                //run
                addNew(name, dep, price, q);
            }
            else if (ans.action === 'Cancel') {
                keepgoing();
            }
        });
    }
    else if (action === 'addMore') {
        console.log(divider);
        console.log(`Adding quantity to ID: ${id}:`);
        console.log(`Quantity: ${q}`);
        console.log(divider);
        inquirer.prompt({
            name: "action",
            message: "Please Confirm:",
            type: 'list',
            choices: ['Confirm', 'Cancel']
        }).then(function (ans) {
            if (ans.action === 'Confirm') {
                //run
                addMore(q, id);
            }
            else if (ans.action === 'Cancel') {
                keepgoing();
            }
        });
    }

}

//Prompts user upon startup
function manager() {
    inquirer.prompt([
        {
            name: "action",
            message: "What would you like to do?",
            type: "list",
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Quit']
        }
    ]).then(function (answer) {
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
                    validate: validateTest
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
            ]).then(function (ans) {
                var action = 'addMore';
                confirm(action, null, null, null, ans.stock, ans.id);
            });
        }
        else if (a === 'Add New Product') {
            var select = `SELECT * FROM departments`;
            var department = [];
            connection.query(select, function (err, dep) {
                if (err) throw err;
                dep.forEach(function (x, i) {
                    department.push(dep[i].department_name);
                });
                // let department = [...new Set(depArr)];
                console.log(`Department array: ${department}`);
                inquirer.prompt([
                    {
                        name: "product",
                        message: "What would you like to add?",
                        validate: function (value) {
                            if (value) {
                                return true;
                            }
                            else if (!value) {
                                console.log("Please enter a product name.")
                            }
                        }
                    },
                    {
                        name: "department",
                        message: "What department does this belong to?",
                        type: "list",
                        choices: department
                    },
                    {
                        name: "price",
                        message: "Set the price of the item: ",
                        validate: validateTest
                    },
                    {
                        name: "stock",
                        message: "Set the inventory quantity: ",
                        validate: validateTest
                    }
                ]).then(function (ans) {
                    var action = 'addNew';
                    confirm(action, ans.product, ans.department, ans.price, ans.stock);
                });
            })
        }
        else if (a === 'Quit') {
            console.log("Goodbye.");
        }
    });
}
