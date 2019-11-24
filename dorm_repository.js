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
            isawake INTEGER NOT NULL,
            members TEXT)`;
        return this.dao.run(sql);
    }

    deleteTable(){
        const sql = `DROP TABLE IF EXISTS dormInfo`;
        return this.dao.run(sql);
    }

    insert(row){
        const {building, room, isawake, members} = row;
        return this.dao.run(
            `INSERT INTO dormInfo
            (building, room, isawake, members)
            VALUES (?, ?, ?, ?)`, [building, room, isawake, members]
        );
    }

    update(row){
        const {ID, building, room, isawake, members} = row;
        return this.dao.run(
            `UPDATE dormInfo 
            SET building = ?,
            room = ?,
            isawake = ?,
            members = ?
            WHERE ID = ?`, [building, room, isawake, members, ID]
        );
    }

    updateMembers(row){
        const{ID, members} = row;
        return this.dao.run(
            `UPDATE dormInfo
            SET members = ?
            WHERE ID = ?
            `, [members, ID]
        );
    }

    updateAwake(row){
        const{ID, isawake} = row;
        return this.dao.run(
            `UPDATE dormInfo
            SET isawake = ?
            WHERE ID = ?
            `, [isawake, ID]
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
            `SELECT * FROM dormInfo WHERE ID = ?`, [ID]
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

    getByBuildingRoom(building, room){
        return this.dao.get(`SELECT * FROM dormInfo WHERE building = ? AND room = ?`, [building, room]);
    }
}

module.exports = DormRepository;