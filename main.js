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
/*studentInfo.deleteTable()
.then(() => dormInfo.deleteTable())
.then(() => requestInfo.deleteTable())
.then(() => studentInfo.createTable())
.then(() => dormInfo.createTable())
.then(() => requestInfo.createTable())
.then(main)*/
main();

function setAlarm(json){
    return studentInfo.updateAlarm(json);
}

function setRoomAwake(json){
    return dormInfo.updateAwake(json)
    .then(() => {
        return dormInfo.get(json.ID)
        .then((row) => {
            var members = JSON.parse(row.members);
            var actions = members.map((id) => {
                return studentInfo.updateAwake({ID: id, isawake: json.isawake});
            })
            return Promise.all(actions);
        })
    })
}

function setAwake(json){
    return studentInfo.updateAwake(json);
}

function addLate(rows){
    return studentInfo.getAllSleeping()
    .then(rows => {
        var actions = rows.map((row) => {
            return studentInfo.updateLate({ID: row.ID, latecnt: row.latecnt+1});
        });
        return Promise.all(actions);
    });
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

function getAllRooms(){
    return dormInfo.getAll();
}

function getAllStudents(){
    return studentInfo.getAll();
}

function getAllRequests(){
    return requestInfo.getAll();
}

function getStudentInfo(ID){
    return studentInfo.get(ID);
}

function viewRequestExists(RID){
    return requestInfo.get(RID);
}

function answerRequest(json){
    if(json.confirm == 1){
        return requestInfo.get(json.RID)
        .then((value) => {
            if(value.requestType == 1){
                return studentInfo.get(value.ID)
                .then((orig) => {
                    return dormInfo.getByBuildingRoom(orig.building, orig.room)
                    .then(room => {
                        var members = JSON.parse(room.members);
                        return dormInfo.updateMembers({
                            ID: room.ID,
                            members: JSON.stringify(members.filter(ID => (ID != orig.ID)))
                        });
                    })
                    .then(() => dormInfo.getByBuildingRoom(value.building, value.room))
                    .then(room => {
                        var members = JSON.parse(room.members);
                        members.push(value.ID);
                        return dormInfo.updateMembers({
                            ID: room.ID,
                            members: JSON.stringify(members)
                        });
                    })
                    .then(() => orig)
                })
                .then((orig) => {
                    return studentInfo.update({
                        ID: value.ID,
                        building: value.building.trim(),
                        room: value.room,
                        name: value.name,
                        latecnt: orig.latecnt,
                        noAlert: value.noAlert,
                        isawake: orig.isawake,
                        alarm: orig.alarm
                    });
                });
            }
            else{
                return dormInfo.getByBuildingRoom(value.building, value.room)
                .then(room => {
                    var members = JSON.parse(room.members);
                    members.push(value.ID);
                    return dormInfo.updateMembers({
                        ID: room.ID,
                        members: JSON.stringify(members)
                    });
                })
                .then(() => 
                    studentInfo.insert({
                    ID: value.ID,
                    building: value.building.trim(),
                    room: value.room,
                    name: value.name,
                    latecnt: 0,
                    noAlert: value.noAlert,
                    isawake: 0,
                    alarm: 0
                    }));
            }
        })
        .then(() => requestInfo.delete(json.RID));
    }
    else return requestInfo.delete(json.RID);
}

function wakeAll(){
    return studentInfo.getAllSleeping()
    .then(rows => {
        var actions = rows.map((row) => {
            return studentInfo.updateAlarm({ID: row.ID, alarm: 1});
        });
        return Promise.all(actions);
    });
}

function deleteRoom(ID){
    return dormInfo.delete(ID);
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
                if(qtype != "getAllStudents" && qtype != "wakeAll" && qtype != "clearDB" && qtype != "getAllRequests" && qtype != "getAllRooms" && _json == null){
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
                    // json : {"ID":?, "alarm":0/1}
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
                if(qtype == 'setRoomAlarm'){
                    // json : [1, 2, ...] --> contains id
                    setRoomAlarm(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    });
                }
                else if(qtype == 'wakeAll'){
                    wakeAll(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    });
                }
                /*else if(qtype == 'setAwake'){
                    // json : {"ID": ?, "isawake":0/1} 
                    setAwake(json)
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    });
                }*/
                else if(qtype == 'setRoomAwake'){
                    // json : {"ID": ?, "isawake":0/1} 
                    setRoomAwake(json)
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
                    addLate()
                    .then(() => {
                        return studentInfo.resetAll();
                    })
                    .then(() => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    });
                }
                /*else if(qtype == 'addStudent'){
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
                }*/
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
                else if(qtype == 'getAllRooms'){
                    getAllRooms()
                    .then(value => {
                        res.writeHead(200);
                        res.end(JSON.stringify(value));
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    });
                }
                else if(qtype == 'getStudentInfo'){
                    // json: {"ID": ?}
                    getStudentInfo(json.ID)
                    .then(value => {
                        res.writeHead(200);
                        res.end(JSON.stringify(value));
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err.toString());
                    })
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
                else if(qtype == 'viewRequestExists'){
                    //json: {"RID": ?}
                    viewRequestExists(json.RID)
                    .then((value) => {
                        res.writeHead(200);
                        res.end((value != null).toString());
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end("false");
                    })
                }
                else if(qtype == 'getRoomAwake'){
                    //json: {"ID": ?}
                    getRoomAwake(json.ID)
                    .then(value => {
                        res.writeHead(200);
                        res.end(value.toString());
                    })
                    .catch((err) => {
                        res.writeHead(200);
                        res.end(err);
                    })
                }
                else if(qtype == 'deleteRoom'){
                    // json: {"ID": ?}
                    deleteRoom(json.ID)
                    .then(value => {
                        res.writeHead(200);
                        res.end("successful");
                    })
                    .catch(err => {
                        res.writeHead(200);
                        res.end(err);
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