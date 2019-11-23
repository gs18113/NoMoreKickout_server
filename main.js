const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');
const AppDAO = require('./dao');
const StudentRepository = require('./student_repository');
const DormRepository = require('./dorm_repository');

const dao = new AppDAO('./database.db');
const studentInfo = new StudentRepository(dao);
const dormInfo = new DormRepository(dao);
studentInfo.deleteTable()
.then(() => dormInfo.deleteTable())
.then(() => studentInfo.createTable())
.then(() => dormInfo.createTable())
.then(main)

function setAlarm(json){
    var actions = json.map((value) => {
        return studentInfo.update({ID: value, alarm: 1});
    });
    return Promise.all(actions);
}

function updateDB(json){
    return Promise.all(
        json.map((value) => {
        studentInfo.get()
        .then((data) => {
            data.latecnt++;
            studentInfo.update(data);
        });
    })
    );
}

function addStudent(json){
    return studentInfo.insert(json);
}

function addRoom(json){
    return dormInfo.insert(json)
    .then(value => value.id);
}

function getLatecnt(json){
    return studentInfo.get(json.ID)
    .then(data => data.latecnt);
}

function getAlarm(json){
    return studentInfo.get(json.ID)
    .then(data => data.alarm);
}

function getBuildings(){
    return dormInfo.getDistinctCol();
}

function getBuildingRooms(name){
    return dormInfo.getBuildingRooms(name);
}

function getAllStudents(){
    return studentInfo.getAll();
}

function main(){
    var app = http.createServer(function(req, res){
        if(req.method == 'POST'){
            console.log("Query!")
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end',  () => {
                var queryData = parse(body);
                var qtype = queryData.qtype;
                var _json = queryData.json;
                if(qtype == null){
                    res.writeHead(200);
                    res.end("Query invalid!");
                    return;
                }
                console.log(qtype)
                if(qtype != "getAllStudents" && qtype != "clearDB" && _json == null){
                    res.writeHead(200);
                    res.end("Query invalid!");
                    return;
                }
                if(_json != null) json = JSON.parse(_json);
                if(qtype == 'setAlarm'){
                    // json : [1, 2, ...] --> contains id
                    setAlarm(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(err));
                    });
                }
                else if(qtype == 'updateDB'){
                    // late cnt ++
                    // json : [1, 2, ...] --> contains id
                    updateDB(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(err));
                    });
                }
                else if(qtype == 'addStudent'){
                    // json : {"ID": ?, "building": ?, "room": ?, "name": ?, "latecnt": ?, "alarm": ?}
                    addStudent(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(err));
                    });
                }
                else if(qtype == 'addRoom'){
                    // json : {"building": ?, "room": ?, "members": ?}
                    addRoom(json)
                    .then((id) => {
                        res.writeHead(200);
                        res.end(id.toString());
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(err));
                    });
                }
                else if(qtype == 'getLatecnt'){
                    // json: {"ID": 1}
                    getLatecnt(json)
                    .then((value) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(value));
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(err));
                    })
                }
                else if(qtype == 'getAlarm'){
                    // json: {"ID": 1}
                    console.log("Alarm!!")
                    getAlarm(json)
                    .then((value) => {
                        res.writeHead(200);
                        console.log(value);
                        res.end(value);
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        console.log("Error!")
                        res.end(JSON.stringify(err));
                    })
                }
                else if(qtype == 'getAllStudents'){
                    getAllStudents()
                    .then(value => {
                        res.writeHead(200);
                        res.end(JSON.stringify(value));
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(err));
                    })
                }
                else if(qtype == 'getBuildings'){
                    getBuildings()
                    .then(value => {
                        res.writeHead(200);
                        res.end(JSON.stringify(value));
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(err));
                    });
                }
                else if(qtype == 'getBuildingRooms'){
                    // json: {"building": "우정2관"}
                    getBuildingRooms(json.building)
                    .then(value => {
                        res.writeHead(200);
                        res.end(JSON.stringify(value));
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(err));
                    });
                }
                else if(qtype == 'clearDB'){
                    studentInfo.deleteTable()
                    .then(() => dormInfo.deleteTable())
                    .then(() => studentInfo.createTable()) 
                    .then(() => dormInfo.createTable())
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(JSON.stringify(err));
                    })
                }
                else{
                    res.writeHead(200);
                    res.end("Query invalid!");
                }
            });
        }
        else{
            console.log("Received GET request");
            res.writeHead(200);
            fs.readFile('index.html', (_err, data) => {
                res.end(data);
            })
        }
        
    });

    const PORT = 80;
    app.listen(PORT);
}