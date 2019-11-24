
class StudentRepository{
    constructor(dao){
        this.dao = dao;

    }

    createTable(){
        const sql = `
        CREATE TABLE IF NOT EXISTS studentInfo (
            ID INTEGER PRIMARY KEY NOT NULL UNIQUE,
            building TEXT NOT NULL,
            room INTEGER NOT NULL,
            name TEXT NOT NULL,
            latecnt INTEGER NOT NULL,
            noAlert INTEGER NOT NULL,
            isawake INTEGER NOT NULL,
            alarm INTEGER NOT NULL)`;
        return this.dao.run(sql);
    }

    deleteTable(){
        const sql = `DROP TABLE IF EXISTS studentInfo`;
        return this.dao.run(sql);
    }

    insert(row){
        return this.dao.run(
            `INSERT INTO studentInfo
            (ID, building, room, name, latecnt, noAlert, isawake, alarm)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [row.ID, row.building, row.room, row.name, row.latecnt, row.noAlert, row.isawake, row.alarm]
        );
    }

    update(row){
        const {ID, building, room, name, latecnt, noAlert, isawake, alarm} = row;
        return this.dao.run(
            `UPDATE studentInfo
            SET building = ?,
            room = ?,
            name = ?,
            latecnt = ?,
            noAlert = ?,
            isawake = ?,
            alarm = ?
            WHERE ID = ?`, [building, room, name, latecnt, noAlert, isawake, alarm, ID]
        );
    }

    updateLate(row){
        const {ID, latecnt} = row;
        return this.dao.run(
            `UPDATE studentInfo
            SET
            latecnt = ?
            WHERE ID = ?`, [latecnt, ID]
        );
    }

    updateAlarm(row){
        const {ID, alarm} = row;
        return this.dao.run(
            `UPDATE studentInfo
            SET
            alarm = ?
            WHERE ID = ?`, [alarm, ID]
        );
    }

    updateAwake(row){
        const {ID, isawake} = row;
        return this.dao.run(
            `UPDATE studentInfo
            SET
            isawake = ?
            WHERE ID = ?`, [isawake, ID]
        );
    }

    delete(ID){
        return this.dao.run(
            `DELETE FROM studentInfo WHERE ID = ?`,
            [ID]
        );
    }

    get(ID){
        return this.dao.get(
            `SELECT * FROM studentInfo WHERE ID = ?`, [ID]
        );
    }

    getAll(){
        return this.dao.all(`SELECT * FROM studentInfo`)
    }

    getAllSleeping(){
        return this.dao.all(`SELECT * FROM studentInfo WHERE isAwake = 0`)
    }

    resetAll(){
        return this.dao.run(`
        UPDATE studentInfo 
        SET
        isawake = 0,
        alarm = 0`);
    }
}

module.exports = StudentRepository;