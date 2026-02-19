import { db } from '../cofig/db.js'
export const addapp = (req, res) => {
        const {
            Name_user,
            Phone,
            Device,
            Description,
            Status
        } = req.body
        if (!Name_user || !Phone || !Device || !Description || !Status)
            return res.json({ message: "Enter all data fields" })
        db.query("INSERT INTO appointments(Name_user,Phone,Device,Description,Status) VALUES(?,?,?,?,?)", [Name_user, Phone, Device, Description, Status], (err, result) => {
            if (err) return res.json({ message: "Failed to insert" })
            res.json({ message: "Data inserted successfully" })
        })

    }
    // updateapp
export const updateapp = (req, res) => {
        const { id } = req.params
        const { Name_user, Phone, Device, Description, Status } = req.body;
        db.query("UPDATE appointments SET Name_user=?,Phone=?,Device=?,Description=? WHERE id=?", [Name_user, Phone, Device, Description, id], (err, result) => {
            if (err) return res.json({ err: 'The item was not updateded' });
            return res.json({ message: "Updated sucessfully" });
        });

    }
    //view all appo
export const getallapp = (req, res) => {
        db.query("SELECT * FROM appointments", (err, result) => {
            if (err) return res.json({ message: "Faled no data found" })
            return res.json(result)
        })
    } //view appobyId
export const getappbyId = (req, res) => {
        const { id } = req.params;
        db.query("SELECT * FROM appointments WHERE id=?", [id], (err, result) => {
            if (err) return res.json({ message: "Faled no data found" })
            return res.json(result)
        })
    }
    //delete appobyId
export const deleteappbyId = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM appointments WHERE id=?", [id], (err, result) => {
        if (err) return res.json({ message: "Failed to delete data" })
        return res.json({ message: "data deleted" })
    })
}