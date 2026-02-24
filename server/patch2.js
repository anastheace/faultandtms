const db = require('./config/db');

db.serialize(() => {
    db.run("UPDATE computers SET computer_id = REPLACE(computer_id, 'PC-', 'LAB-')", function (err) {
        if (err) console.error(err);
        else console.log('PC- replaced with LAB-');
    });

    db.run("UPDATE computers SET computer_id = UPPER(computer_id)", function (err) {
        if (err) console.error(err);
        else console.log('computers uppercased');
    });

    db.run("UPDATE computers SET lab_number = 'Lab A' WHERE computer_id LIKE 'LAB-A-%'");
    db.run("UPDATE computers SET lab_number = 'Lab B' WHERE computer_id LIKE 'LAB-B-%'");
    db.run("UPDATE computers SET lab_number = 'Lab C' WHERE computer_id LIKE 'LAB-C-%'");
    db.run("UPDATE computers SET lab_number = 'Lab D' WHERE computer_id LIKE 'LAB-D-%'", function () {
        console.log('Cleaned up DB workstation patterns.');
    });
});
