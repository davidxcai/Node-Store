const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');
const Format = require('format-number');
const colors = require('colors');
const format = Format({prefix: '$', integerSeparator: ',', negativeLeftOut: true});
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
            choices: ['View Product Sales', 'Add New Department', 'Quit']
        }
    ).then(function (a) {
        if (a.action === 'View Product Sales') {
            sales();
        }
        else if (a.action === 'Add New Department') {
            newDep();
        }
        else if (a.action === 'Quit') {
            console.log("Goodbye.");
            connection.end();
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
                    console.log(`Please enter a name for the department.`.red);
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
        var cost = format(parseFloat(ans.cost).toFixed(2));
        var create = 'INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)'
        connection.query(create, [ans.new, ans.cost], function (err) {
            if (err) throw err;
            console.log(divider);
            console.log(`Succesfully added "${dep}" department with over head cost of ${cost}.`.green);
            console.log(divider);
            keepgoing();
        });
    })
}

function sales() {
    var table = new Table({
        head: ['Department ID'.cyan, 'Department Name'.cyan, 'Over Head Costs'.cyan, 'Product Sales'.cyan, 'Total Profit'.cyan],
        colWidths: [15, 20, 20, 15, 15]
    });
    var select = 'IFNULL(SUM(products.product_sales), 0) AS product_sales, departments.department_id, departments.department_name, departments.over_head_costs';
    var group = 'GROUP BY departments.department_id';
    var join = `SELECT ${select} FROM products INNER JOIN departments ON products.department_name=departments.department_name ${group}`;
    connection.query(join, function (err, result) {
        var totalSales = [];
        if (err) throw err;
        result.forEach(function (x, i) {
            var dep = result[i];
            var profit = parseFloat(dep.product_sales - dep.over_head_costs).toFixed(2);
            totalSales.push(profit);
            table.push(
                [dep.department_id, dep.department_name, format(parseFloat(dep.over_head_costs).toFixed(2)), format(dep.product_sales), format(profit)]
            );
        });
        status(totalSales);
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
            console.log("Goodbye.");
            connection.end();
        }
    })
}

function validateTest(value) {
    if (isNaN(value) === false) {
        if (Number(value) <= 0) {
            return "Please enter a number greater than 0.".red;
        } else {
            return true;
        }
    } else if (isNaN(value)) {
        return "Please enter a number.".red;
    }
}

function status(x) {
    var pos = 0;
    var neg = 0;
    var alldep = x.length;
    x.forEach(num => {
        if (num <0) {
            neg++;
        }
        else if (num >0) {
            pos++;
        }
    });
    console.log((alldep/pos) * 100);
    console.log(`positive ${pos}`);
    console.log(`negative ${neg}`);
    console.log(`alldep ${alldep}`);
    // if (pos > neg) {
    //     console.log(`Sales are looking great!`);
    // }
}