var fs = require('fs');

var ratings = null;

exports.initWith = function (finalRatings) {
    ratings = finalRatings;
    return module.exports;
}

exports.saveToFiles = function () {
    if (!ratings) {
        throw "'ratings' is empty, call #initWith() first!";
    }

    var directory = generateDirectoryName();
    fs.mkdirSync(directory);
    saveGameResultTo(directory + "/results.csv")
    saveGuestsTo(directory + "/guests.csv");

    ratings = null;
}

function saveGuestsTo(file) {
    var stream = fs.createWriteStream(file);

    var data = [];
    var header = ["Team", "Name", "Email"];
    data.push(header.join(","));

    ratings.forEach(function (team) {
        var members = team.members;
        members.forEach(function (member) {
            var row = [toCSVValue(team.name), toCSVValue(member.name), member.email];
            data.push(row.join(","))
        });
    });

    stream.write(data.join("\r\n"));
}

function saveGameResultTo(file) {
    var stream = fs.createWriteStream(file);

    var data = [];
    var header = ["Position", "Team", "Score"];
    data.push(header.join(","));

    ratings.forEach(function (team, index) {
        var row = [index + 1, toCSVValue(team.name), team.totalScore];
        data.push(row.join(","))
    });

    stream.write(data.join("\r\n"));
}

function generateDirectoryName() {
    var now = new Date();
    var dateSuffix = now.toISOString() // 1234-56-78T12:34:56.789Z
        .replace(/-/g, '_')
        .replace(/:/g, '_') // 1234_56_78T12_34_56.789Z
        .slice(0, -".789Z".length); // 1234_56_78T12_34_56
    return "./content/game_" + dateSuffix;
}

function toCSVValue(stringValue) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
}
