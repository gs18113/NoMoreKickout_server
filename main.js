const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');
const AppDAO = require('./dao');
const StudentRepository = require('./student_repository');
const DormRepository = require('./dorm_repository');
const RequestRepository = require('./request_repository');

const dao = new AppDAO('./database.db');
const studentInfo = new StudentRepository(dao);
const dormInfo = new DormRepository(dao);
const requestInfo = new RequestRepository(dao);
studentInfo.deleteTable()
.then(() => dormInfo.deleteTable())
.then(() => requestInfo.deleteTable())
.then(() => studentInfo.createTable())
.then(() => dormInfo.createTable())
.then(() => requestInfo.createTable())
.then(main)

function setAlarm(json){
    var actions = json.map((value) => {
        return studentInfo.update({ID: value, alarm: 1});
    });
    return Promise.all(actions);
}

function addLate(json){
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

function addRequest(json){
    return requestInfo.insert(json)
    .then(value => value.id);
}

function getLatecnt(json){
    return studentInfo.get(json.ID)
    .then(data => data.latecnt);
}

function getAlarm(json){
    return studentInfo.get(json.ID)
    .then(data => (!data.noAlert)&&data.alarm);
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

function getAllRequests(){
    return requestInfo.getAll();
}

function answerRequest(json){
    if(json.confirm == 1){
        return requestInfo.get(json.RID)
        .then((value) => {
            if(value.requestType == 1){
                return studentInfo.get(value.ID)
                .then((orig) => {
                    return studentInfo.update({
                        ID: value.ID,
                        building: value.building.trim(),
                        room: value.room,
                        name: value.name,
                        latecnt: orig.latecnt,
                        noAlert: value.noAlert,
                        alarm: orig.alarm
                    });
                });
            }
            else{
                return studentInfo.insert({
                    ID: value.ID,
                    building: value.building.trim(),
                    room: value.room,
                    name: value.name,
                    latecnt: 0,
                    noAlert: value.noAlert,
                    alarm: 0
                });
            }
        })
        .then(() => requestInfo.delete(json.RID));
    }
    else return requestInfo.delete(json.RID);
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
                if(_json != null && qtype == null){
                    json = JSON.parse(_json);
                    if(json.qtype != null) qtype = json.qtype;
                }
                if(qtype == null){
                    res.writeHead(200);
                    res.end("Query invalid!");
                    return;
                }
                console.log("Received POST request. Query type: ");
                console.log(qtype)
                if(qtype != "getAllStudents" && qtype != "clearDB" && qtype != "getAllRequests" && _json == null){
                    res.writeHead(200);
                    res.end("Query invalid!");
                    return;
                }
                try{
                    if(_json != null) json = JSON.parse(_json);
                }
                catch(err){
                    res.writeHead(200);
                    res.end(err.toString());
                }
                if(qtype == 'setAlarm'){
                    // json : [1, 2, ...] --> contains id
                    setAlarm(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    });
                }
                else if(qtype == 'addLate'){
                    // late cnt ++
                    // json : [1, 2, ...] --> contains id
                    addLate(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
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
                        res.end(err.toString());
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
                        res.end(err.toString());
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
                        res.end(err.toString());
                    })
                }
                else if(qtype == 'getAlarm'){
                    // json: {"ID": 1}
                    getAlarm(json)
                    .then((value) => {
                        res.writeHead(200);
                        res.end(value.toString());
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
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
                        res.end(err.toString());
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
                        res.end(err.toString());
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
                        res.end(err.toString());
                    });
                }
                else if(qtype == 'clearDB'){
                    studentInfo.deleteTable()
                    .then(() => dormInfo.deleteTable())
                    .then(() => requestInfo.deleteTable())
                    .then(() => studentInfo.createTable()) 
                    .then(() => dormInfo.createTable())
                    .then(() => requestInfo.createTable())
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    })
                }
                else if(qtype == 'addRequest'){
                    // json: {"ID": ?, "building": ?, "room": ?, "name":, ?, "noAlert": ?, "requestType": ?}
                    addRequest(json)
                    .then((nid) => {
                        res.writeHead(200);
                        res.end(nid.toString());
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    })
                }
                else if(qtype == 'getAllRequests'){
                    getAllRequests()
                    .then(value => {
                        res.writeHead(200);
                        res.end(JSON.stringify(value));
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    })
                }
                else if(qtype == 'answerRequest'){
                    //json: {"RID": ?, "confirm": 0/1 }
                    answerRequest(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    })
                }
                else{
                    res.writeHead(200);
                    res.end("Query invalid!");
                }
            });
        }
        else{
            console.log("Received GET request.");
            res.writeHead(200);
            fs.readFile('index.html', (_err, data) => {
                res.end(data);
            })
        }
        
    });

    const PORT = 80;
    app.listen(PORT);
}