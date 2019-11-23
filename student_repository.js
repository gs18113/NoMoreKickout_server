
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
            alarm NTEGER NOT NULL)`;
        return this.dao.run(sql);
    }

    deleteTable(){
        const sql = `DROP TABLE IF EXISTS studentInfo`;
        return this.dao.run(sql);
    }

    insert(row){
        return this.dao.run(
            `INSERT INTO studentInfo
            (ID, building, room, name, latecnt, alarm)
            VALUES (?, ?, ?, ?, ?, ?)`, [row.ID, row.building, row.room, row.name, row.latecnt, row.alarm]
        );
    }

    update(row){
        const {ID, building, room, name, latecnt, alarm} = row;
        return this.dao.run(
            `UPDATE studentInfo
            SET building = ?,
            room = ?,
            name = ?,
            latecnt = ?,
            alarm = ?
            WHERE ID = ?`, [building, room, name, latecnt, alarm, ID]
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
        const {ID, latecnt} = row;
        return this.dao.run(
            `UPDATE studentInfo
            SET
            alarm = ?
            WHERE ID = ?`, [alarm, ID]
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
}

module.exports = StudentRepository;