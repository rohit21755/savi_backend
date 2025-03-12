import express from 'express';
import  prisma  from '../prisma-client';
import { z } from 'zod';
import  jwt  from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const router = express.Router();
const userSchemaSignUp = z.object({
    name: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string()
});
router.post('/signup', async (req, res) => {
    const { name, email, password, phoneNumber } = userSchemaSignUp.parse(req.body);
    console.log(name, email, password, phoneNumber);
    const newPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
        data: {
            name,
            email,
            password : newPassword,
            phoneNumber
        }

    })
    res.status(200).json({
        message: 'User created successfully',

        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber
        }
    });}
    catch (error) {
        res.status(400).json({
            message: 'User creation failed',
            error
        })
    }
})
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(!user){
            res.status(400).json({
                message: 'User not found',
            })
        }
        else {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(isPasswordValid){
                const token = jwt.sign({id: user.id, email:user.email}, "secret");
                res.status(200).json({
                    message: 'User login successful',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber
                    }
                })
            }
            else {
                res.status(400).json({
                    message: 'Invalid password',
                })
            }
        }
    }
    catch (error) {
        res.status(400).json({
            message: 'User login failed',
            error
        })
    }
})
export default router;