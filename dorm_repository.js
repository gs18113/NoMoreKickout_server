class DormRepository{
    constructor(dao){
        this.dao = dao;

    }
    createTable(){
        const sql = `
        CREATE TABLE IF NOT EXISTS dormInfo(
            ID NTEGER PRIMARY KEY AUTOINCREMENT,
            building TEXT NOT NULL,
            room INTEGER NOT NULL,
            members TEXT)`;
        return this.run(sql);
    }

    insert(row){
        const {building, room, memeberse} = row;
        return this.dao.run(
            `INSERT INTO dormInfo
            (building room members)
            VALUES (?)`, [building, room, members]
        );
    }

    update(row){
        const {ID, building, room, memebers} = row;
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

    getDistinctCol(column){
        // TODO
    }
}

module.exports = DormRepository;