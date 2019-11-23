class DormRepository{
    constructor(dao){
        this.dao = dao;

    }
    createTable(){
        const sql = `
        CREATE TABLE IF NOT EXISTS dormInfo(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            building TEXT NOT NULL,
            room INTEGER NOT NULL,
            members TEXT)`;
        return this.dao.run(sql);
    }

    deleteTable(){
        const sql = `DROP TABLE IF EXISTS dormInfo`;
        return this.dao.run(sql);
    }

    insert(row){
        const {building, room, members} = row;
        return this.dao.run(
            `INSERT INTO dormInfo
            (building, room, members)
            VALUES (?, ?, ?)`, [building, room, members]
        );
    }

    update(row){
        const {ID, building, room, members} = row;
        return this.dao.run(
            `UPDATE dormInfo 
            SET building = ?,
            room = ?,
            members
            WHERE ID = ?`, [building, room, members, id]
        );
    }

    delete(ID){
        return this.dao.run(
            `DELETE FROM dormInfo WHERE ID = ?`,
            [ID]
        );
    }

    get(ID){
        return this.dao.get(
            `SELECT * FROM studentInfo WHERE ID = ?`, [ID]
        );
    }

    getAll(){
        return this.dao.all(`SELECT * FROM dormInfo`);
    }

    getDistinctCol(){
        return this.dao.all(`SELECT DISTINCT building FROM dormInfo`);
    }

    getBuildingRooms(name){
        return this.dao.all('SELECT * FROM dormInfo WHERE building = ?', [name]);
    }
}

module.exports = DormRepository;