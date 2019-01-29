const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');
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
    supervisor();
    // read();
    // console.log(`Connected to mySql with ID: ${connection.threadId}`);
});

function supervisor() {
    inquirer.prompt(
        {
            name: "action",
            message: "What would you like to do?",
            type: 'list',
            choices: ['View Product Sales', 'Add New Department']
        }
    ).then(function (a) {
        if (a.action === 'View Product Sales') {
            sales();
        }
        else if (a.action === 'Add New Department') {
            newDep();
        }
    })
}

function newDep() {
    inquirer.prompt([
        {
            name: 'new',
            message: "Set the name for new department:",
            validate: function (value) {
                if (!value) {
                    console.log(`Please enter a name for the department.`);
                }
                else {
                    return true;
                }
            }
        },
        {
            name: "cost",
            message: "Set the over head cost of the new department:",
            validate: validateTest
        }
    ]).then(function (ans) {
        var dep = ans.new;
        var cost = parseFloat(ans.cost).toFixed(2);
        var create = 'INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)'
        connection.query(create, [ans.new, ans.cost], function (err) {
            if (err) throw err;
            console.log(divider);
            console.log(`Succesfully added "${dep}" department with over head cost of $${cost}.`);
            console.log(divider);
            keepgoing();
        });
    })
}

function sales() {
    var table = new Table({
        head: ['Department ID', 'Department Name', 'Over Head Costs', 'Product Sales', 'Total Profit'],
        colWidths: [15, 20, 20, 15, 15]
    });
    var select = 'IFNULL(SUM(products.product_sales), 0) AS product_sales, departments.department_id, departments.department_name, departments.over_head_costs';
    var group = 'GROUP BY departments.department_id';
    var join = `SELECT ${select} FROM products INNER JOIN departments ON products.department_name=departments.department_name ${group}`;
    connection.query(join, function (err, result) {
        if (err) throw err;
        result.forEach(function (x, i) {
            var dep = result[i];
            var profit = parseFloat(dep.product_sales - dep.over_head_costs).toFixed(2);
            table.push(
                [dep.department_id, dep.department_name, parseFloat(dep.over_head_costs).toFixed(2), dep.product_sales, profit]
            );
        });
        console.log(table.toString());
        console.log(divider);
        keepgoing();
    });
}

function keepgoing() {
    inquirer.prompt({
        name: "continue",
        message: "Would you like to do something else?",
        type: 'list',
        choices: ["Yes", "No"]
    }).then(function(ans) {
        if (ans.continue === "Yes") {
            supervisor();
        }
        else if (ans.continue === "No") {
            console.log("Goodbye. (Press Ctrl C to exit)")
        }
    })
}

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

function read() {
    connection.query("SELECT * FROM departments", function(err, results) {
        if (err) throw err;
        console.log(results);
    })
}