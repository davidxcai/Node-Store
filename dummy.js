

// View Product Sales by Department
// Create New Department
// insert();
// function insert() {
//     var products = 'SELECT * FROM products';
//     var insert = `INSERT INTO departments (department_name) VALUES (?)`;
//     var depArr = [];
//     connection.query(products, function (err, data) {
//         if (err) throw err;
//         data.forEach(function (x, i) {
//             depArr.push(x.department_name);
//         });
//         var departments = [... new Set(depArr)];
//         departments.forEach(function (x) {
//             connection.query(insert, [x], function (err, data) {
//                 console.log(`Inserted ${x} into department names.`)
//             });
//         });
//     });
// }

// function startup() {
//     inquirer.prompt([
//         {
//             name: 'id',
//             message: 'Enter department id:',
//             validate: validateTest
//         },
//         {
//             name: 'quantity',
//             message: 'Enter over head costs',
//             validate: validateTest
//         }
//     ]).then(function (ans) {
//         ohc(ans.quantity, ans.id);
//     })
// }


// function ohc(num, id) {
//     var update = `UPDATE departments SET over_head_costs = ? WHERE department_id = ?`
//     connection.query(update, [num, id], function (err, result) {
//         if (err) throw err;
//         console.log(`Succesfully updated department: ${id} with over head cost of ${num}`);
//         startup();
//     })
// }
