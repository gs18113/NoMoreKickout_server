class RequestRepository{
    constructor(dao){
        this.dao = dao;
    }

    createTable(){
        const sql = `
        CREATE TABLE IF NOT EXISTS requestInfo (
            RID INTEGER PRIMARY KEY AUTOINCREMENT,
            ID INTEGER NOT NULL,
            building TEXT NOT NULL,
            room INTEGER NOT NULL,
            name TEXT NOT NULL,
            noAlert INTEGER NOT NULL,
            requestType INTEGER NOT NULL
            )`; // requestType: 0(new), 1(change)
        return this.dao.run(sql);
    }

    deleteTable(){
        const sql = `DROP TABLE IF EXISTS requestInfo`;
        return this.dao.run(sql);
    }

    insert(row){
        return this.dao.run(
            `INSERT INTO requestInfo
            (ID, building, room, name, noAlert, requestType)
            VALUES (?, ?, ?, ?, ?, ?)`, [row.ID, row.building, row.room, row.name, row.noAlert, row.requestType]
        );
    }

    update(row){
        const {ID, building, room, name, noAlert, requestType} = row;
        return this.dao.run(
            `UPDATE requestInfo
            SET ID = ?,
            building = ?,
            room = ?,
            name = ?,
            noAlert = ?,
            requestType = ?
            WHERE RID = ?`, [ID, building, room, name, noAlert, requestType, RID]
        );
    }

    delete(RID){
        return this.dao.run(
            `DELETE FROM requestInfo WHERE RID = ?`,
            [RID]
        );
    }

    get(RID){
        return this.dao.get(
            `SELECT * FROM requestInfo WHERE RID = ?`, [RID]
        );
    }

    getAll(){
        return this.dao.all(`SELECT * FROM requestInfo`)
    }
}

module.exports = RequestRepository;