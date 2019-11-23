const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');
const AppDAO = require('./dao');
const StudentRepository = require('./student_repository');
const DormRepository = require('./dorm_repository');

const dao = new AppDAO('./database.db');
const studentInfo = new StudentRepository(dao);
const dormInfo = new DormRepository(dao);
studentInfo.createTable()
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
    return studentInfo.add(json);
}

function addRoom(json){
    return dormInfo.add(json);
}

function shouldWake(json){
    return studentInfo.get(json.ID)
    .then((data) => data.alarm);
}

function getState(json){
    return studentInfo.get(json.ID)
    .then(data => data.latecnt);
}

function getDorms(dorm){
    // TODO
}

function main(){
    var app = http.createServer(function(req, res){
        if(req.method == 'POST'){
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end',  () => {
                var queryData = parse(body);
                var qtype = queryData.qtype;
                var _json = queryData.json;
                if(qtype == null || _json == null){
                    res.writeHead(404);
                    res.end();
                    return;
                }
                json = JSON.parse(_json);
                if(qtype == 'setAlarm'){
                    // json : [1, 2, ...] --> contains id
                    setAlarm(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end();
                    })
                    .catch((err) => {
                        res.writeHead(404);
                        res.end();
                    });
                }
                else if(qtype == 'updateDB'){
                    // late cnt ++
                    // json : [1, 2, ...] --> contains id
                    updateDB(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end();
                    })
                    .catch((err) => {
                        res.writeHead(404);
                        res.end();
                    });
                }
                else if(qtype == 'addStudent'){
                    // json : {"ID": ?, "building": ?, "room": ?, "name": ?, "latecnt": ?, "alarm": ?}
                    addStudent(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end();
                    })
                    .catch((err) => {
                        res.writeHead(404);
                        res.end();
                    });
                }
                else if(qtype == 'addRoom'){
                    // json : {"building": ?, "room": ?, "members": ?}
                    addRoom(json)
                    .then((id) => {
                        res.writeHead(200);
                        res.end(id);
                    })
                    .catch((err) => {
                        res.writeHead(404);
                        res.end();
                    });
                }
                else if(qtype == 'shouldWake'){
                    // json: {"ID": 1}
                    shouldWake(json)
                    .then((value) => {
                        res.writeHead(200);
                        res.end(value);
                    })
                    .catch((err) => {
                        res.writeHead(404);
                        res.end();
                    })
                }
                else if(qtype == 'getState'){
                    // json: {"ID": 1}
                    getState(json)
                    .then((value) => {
                        res.writeHead(200);
                        res.end(value);
                    })
                    .catch((err) => {
                        res.writeHead(404);
                        res.end();
                    })
                }
            });
        }
    });

    app.listen(80);
}