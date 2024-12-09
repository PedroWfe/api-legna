require('dotenv').config()

const express  = require('express')
const mongoose = require('mongoose')
const bcrypt   = require('bcrypt')
const jwt      = require('jsonwebtoken')

const app      = express()

// Config JSON response
app.use(express.json())

// Import - Models
const User       = require('./models/User')
const Supplier   = require('./models/Supplier')
const Product    = require('./models/Product')
const Entry      = require('./models/Entry')
''
// --- Open Route - Public Route --- //

app.get('/', (req, res) => {
    res.status(200).json({msg: "Bem vindo a nossa API!"})
})

// Register User
app.post('/auth/register', async(req, res) => {

    const {name, email, password, confirmpassword} = req.body

    // Validations
    if(!name){
        return res.status(422).json({msg: "O nome é obrigatório!"})
    }
    if(!email){
        return res.status(422).json({msg: "O email é obrigatório!"})
    }
    if(!password){
        return res.status(422).json({msg: "A senha é obrigatória!"})
    }
    if(password !== confirmpassword){
        return res.status(422).json({msg: "As senhas não conferem!"})
    }
    // Check if user exists
    const userExists = await User.findOne({email:email})
    if(userExists){
        return res.status(422).json({msg: "O email utilizado já está em uso"})
    }

    // Create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user
    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try{
        await user.save()
        res.status(201).json({msg: "Usuário criado com sucesso!"})
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!"})
    }
})

// Login User
app.post("/auth/login", async (req, res) => {
    const {email, password} = req.body
    if(!email){
        return res.status(422).json({msg: "O email é obrigatório!"})
    }
    if(!password){
        return res.status(422).json({msg: "A senha é obrigatória!"})
    }

    // Check if user exists
    const user = await User.findOne({email:email})

    if(!user){
        return res.status(404).json({msg: "Usuario não encontrado"})
    }

    // Check if password match
    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword){
        return res.status(422).json({msg: "Senha inválida!"})
    }

    try{
        const secret = process.env.SECRET
        const token = jwt.sign(
        {
            id: user._id,
        },
        secret,
        )
        res.status(200).json({msg: "Autenticação realizada com sucesso!", token})
    } catch{
        console.log(error)
        res.status(500).json({
            msg: "Aconteceu um erro no sesrvidor, tente novamente mais tarde!"
        })
    }
})

// --- Private Route --- //

// -- User -- //

app.get("/user/:id", checkToken, async (req, res) =>{

    const id = req.params.id

    // Check if user exists
    const user = await User.findById(id, '-password')
    if(!user){
        return res.status(404).json({msg:"Usuario não encontrado!"})
    }
    res.status(200).json({user})
})

// -- Supplier -- //

app.get("/supplier", checkToken, async (req, res) =>{
    
    // Check if supplier exists
    const supplier = await Supplier.find()
    if(supplier.length == 0){
        return res.status(404).json({msg:"Fornecedor não encontrado!"})
    }
    res.status(200).json({supplier})

})

app.get("/supplier/:id", checkToken, async (req, res) =>{
    const id = req.params.id
    // Check if supplier exists
    const supplier = await Supplier.findById(id)
    if(!supplier){
        return res.status(404).json({msg:"Fornecedor não encontrado!"})
    }
    res.status(200).json({supplier})

})

app.post("/supplier/create", checkToken, async (req, res) =>{
    const {name} = req.body
    // Validations
    if(!name){
        return res.status(422).json({msg: "O nome do fornecedor é obrigatório!"})
    }
    // Check if supplier exists
    const supplierExists = await Supplier.findOne({name:name})
    if(supplierExists){
        return res.status(422).json({msg: "Este fornecedor já existe!"})
    }

    // Create supplier
    const supplier = new Supplier({
        name,
    })

    try{
        await supplier.save()
        res.status(201).json({msg: "Fornecedor criado com sucesso!"})
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!"})
    }

})

app.put("/supplier/:id", checkToken, async (req, res) =>{
    const id = req.params.id
    const {name} = req.body
    const supplier = await Supplier.findById(id)
    
    // Check supplier exists
    if(!supplier){
        return res.status(404).json({msg:"Fornecedor não encontrado!"})
    }

    // Check if name exists
    if(!name){
        return res.status(400).json({msg:"Nenhum campo para atualizar foi fornecido!"})
    }
    // Check if the name is already in use
    const nameExists = await Supplier.findOne({name:name})
    if(nameExists){
        return res.status(422).json({msg: "Este nome já está em uso!"})
    }
    try{
        await Supplier.findByIdAndUpdate(id, {name})
        res.status(201).json({msg: "Fornecedor alterado com sucesso!"})
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!"})
    }
    
})

app.delete("/supplier/:id", checkToken, async (req, res) =>{
    const id = req.params.id
    const supplier = await Supplier.findById(id)
    
    // Check supplier exists
    if(!supplier){
        return res.status(404).json({msg:"Fornecedor não encontrado!"})
    }

    try{
        await Supplier.findByIdAndDelete(id)
        res.status(201).json({msg: "Fornecedor deletado com sucesso!"})
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!"})
    }
})

// -- Product -- //


app.get("/product", checkToken, async (req, res) =>{
    
    // Check if product exists
    const product = await Product.find()
    if(product.length == 0){
        return res.status(404).json({msg:"Produto não encontrado!"})
    }
    res.status(200).json({product})

})

app.get("/product/:id", checkToken, async (req, res) =>{
    const id = req.params.id
    // Check if product exists
    const product = await Product.findById(id)
    if(!product){
        return res.status(404).json({msg:"Produto não encontrado!"})
    }
    res.status(200).json({product})

})

app.post("/product/create", checkToken, async (req, res) =>{
    const {name, amount} = req.body
    // Validations
    if(!name){
        return res.status(422).json({msg: "O nome do produto é obrigatório!"})
    }
    if(!amount){
        return res.status(422).json({msg: "A quantidade do produto é obrigatória!"})
    }
    // Check if product exists
    const productExists = await Product.findOne({name:name})
    if(productExists){
        return res.status(422).json({msg: "Este produto já existe!"})
    }

    // Create product
    const product = new Product({
        name,
        amount,
    })

    try{
        await product.save()
        res.status(201).json({msg: "Produto criado com sucesso!"})
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!"})
    }

})

app.put("/product/:id", checkToken, async (req, res) =>{
    const id = req.params.id
    const {name, amount} = req.body
    const product = await Product.findById(id)
    
    // Check product exists
    if(!product){
        return res.status(404).json({msg:"Produto não encontrado!"})
    }

    // Check if name exists
    if(!name && !amount){
        return res.status(400).json({msg:"Nenhum campo para atualizar foi fornecido!"})
    }
    // Check if the name is already in use
    const nameExists = await Product.findOne({name:name})
    if(nameExists){
        return res.status(422).json({msg: "Este nome já está em uso!"})
    }
    try{
        await Product.findByIdAndUpdate(id, {name, amount})
        res.status(201).json({msg: "Produto alterado com sucesso!"})
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!"})
    }
    
})

app.delete("/product/:id", checkToken, async (req, res) =>{
    const id = req.params.id
    const product = await Product.findById(id)
    
    // Check supplier exists
    if(!product){
        return res.status(404).json({msg:"Produto não encontrado!"})
    }

    try{
        await Product.findByIdAndDelete(id)
        res.status(201).json({msg: "Produto deletado com sucesso!"})
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!"})
    }
})

// -- Entry -- //

app.get("/entry", checkToken, async (req, res) =>{
    
    // Check if entry exists
    const entry = await Entry.find()
    if(entry.length == 0){
        return res.status(404).json({msg:"Entrada não encontrada!"})
    }
    res.status(200).json({entry})

})

app.get("/entry/:id", checkToken, async (req, res) =>{
    const id = req.params.id
    // Check if entry exists
    const entry = await Entry.findById(id)
    if(!entry){
        return res.status(404).json({msg:"Entrada não encontrado!"})
    }
    res.status(200).json({entry})
})

app.post("/entry/create", checkToken, async (req, res) => {
    const {supplierId, buy, author} = req.body
    const currentDate = new Date()
    const entryObject = []

    // Check if supplier exists
    const supplierExists = await Supplier.findById(supplierId)
    if(!supplierExists){
        return res.status(404).json({msg:"Fornecedor não encontrado!"})
    }
    // Check if user exists
    const userExists = await User.findOne({name:author})
    if(!userExists){
        return res.status(404).json({msg:"Usuario não encontrado!"})
    }

    buy.forEach(function(buy){
        entryObject.push(
            {
             date: currentDate,
             supplierId, 
             productName: buy.productName, 
             productAmount: buy.productAmount, 
             productValue: buy.productValue, 
             author
            }
        )
    })
    try{
        await Entry.insertMany(entryObject)
        entryObject.forEach(async function(object){
            const product = await Product.findOne({name:object.productName})
            await Product.updateMany({name:object.productName}, {amount: (product.amount + Number(object.productAmount))})
        })
        res.status(201).json({msg: "Entrada registrada com sucesso!"})
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!"})
    }
})

// Fazer rota PUT

app.delete("/entry/:id", checkToken, async (req, res) =>{
    const id = req.params.id
    const entry = await Entry.findById(id)
    
    // Check supplier exists
    if(!entry){
        return res.status(404).json({msg:"Entrada não encontrada!"})
    }

    try{
        await Entry.findByIdAndDelete(id)
        res.status(201).json({msg: "Entrada deletada com sucesso!"})
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!"})
    }
})




// Function - Check Token

function checkToken(req, res, next){

    const authHeader = req.header('authorization')
    const token = authHeader && authHeader.split(" ")[1]

    if(!token) {
        return res.status(401).json({msg: "Acesso negado!"})
    }

    try{
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
    } catch(error){
        res.status(400).json({msg: "Token inválido!"})
    }
}


// Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose
    .connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.btgpk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        app.listen(3000)
        console.log("Conectou ao banco!")
    })
    .catch((err) => console.log(err))