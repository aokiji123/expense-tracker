import User from "../models/user.model.js";
import bcrypt from 'bcryptjs'

const userResolver = {
    Query: {
        authUser: async (_, __, context) => {
            try {
                const user = await context.getUser()
                return user
            } catch (e) {
                console.error("Error in authUser query: ", e)
                throw new Error(e.message)
            }
        },
        user: async (_, {userId}) => {
            try {
                const user = User.findOne({ userId })
                return user
            } catch (e) {
                console.error("Error in user query: ", e)
                throw new Error(e.message)
            }
        }
    },
    Mutation: {
        signUp: async (_, {input}, context) => {
            try {
                const { name, username, password, gender } = input

                if (!name || !username || !password || !gender) {
                    throw new Error('Please fill all fields')
                }

                const existingUser = await User.findOne({ username })

                if (existingUser) {
                    throw new Error('User already exists')
                }

                const salt = bcrypt.genSaltSync(10)
                const hashedPassword = await bcrypt.hash(password, salt)

                const bowProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`
                const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`

                const newUser = new User({
                    name,
                    username,
                    password: hashedPassword,
                    gender,
                    profilePicture: gender === "male" ? bowProfilePic : girlProfilePic
                })

                await newUser.save()
                await context.login(newUser)
                return newUser
            } catch (e) {
                console.error("Error in signup: ", e)
                throw new Error(e.message)
            }
        },
        login: async (_, {input}, context) => {
            try {
                const { username, password } = input
                if (!username || !password) {
                    throw new Error('Please fill all fields')
                }
                const { user } = await context.authenticate("graphql-local", { username, password })

                if (!user) {
                    throw new Error('Invalid credentials')
                }

                await context.login(user)
                return user
            } catch (e) {
                console.error("Error in login: ", e)
                throw new Error(e.message)
            }
        },
        logout: async (_, __, { req, res }) => {
            try {
                await new Promise((resolve, reject) => {
                    req.logout((err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });

                req.session.destroy((err) => {
                    if (err) {
                        console.error("Error in destroying session: ", err)
                        throw new Error(err.message)
                    }
                })
                res.clearCookie('connect.sid')
                return { message: 'Logged out successfully' }
            } catch (e) {
                console.error("Error in logout: ", e)
                throw new Error(e.message)
            }
        }
    }
}

export default userResolver
