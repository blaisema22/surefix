import { db } from '../cofig/db.js'
import bcrypt from 'bcrypt'

export const register = (req, res) => {
    const { name, email, password, role } = req.body || {}

    if (!name || !email || !role || !password) {
        return res.status(400).json({ message: 'Enter Information' })
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message })
        if (results && results.length > 0) return res.status(409).json({ message: 'User exists' })

        bcrypt.hash(password, 10, (err, hashed) => {
            if (err) return res.status(500).json({ message: 'Failed to hash password' })

            db.query('INSERT INTO users(name,email,role,password) VALUES(?,?,?,?)', [name, email, role, hashed], (err) => {
                if (err) return res.status(500).json({ message: 'Failed to register' })
                return res.status(201).json({ message: 'User created successfully' })
            })
        })
    })
}
export const login = (req, res) => {
    const { email, password } = req.body || {}

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' })
    }

    db.query('SELECT id, name, email, role, password FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message })

        if (!results || results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const user = results[0]

        bcrypt.compare(password, user.password, (err, isPasswordValid) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords', error: err.message })

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' })
            }

            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            })
        })
    })
}