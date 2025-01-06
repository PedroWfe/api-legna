require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const app = express();

// Config JSON response
app.use(express.json());

// Import - Models
const User = require("./models/User");
const Supplier = require("./models/Supplier");
const Product = require("./models/Product");
const Entry = require("./models/Entry");
const Exit = require("./models/Exit");

// Schemas
const registerUserSchema = require("./schemas/registerUserSchema");
const loginSchema = require("./schemas/loginSchema");
const supplierSchema = require("./schemas/supplierSchema");
const userSchema = require("./schemas/userSchema");
const productSchema = require("./schemas/productSchema");
const entrySchema = require("./schemas/entrySchema");
const exitSchema = require("./schemas/exitSchema");

// --- Open Route - Public Route --- //

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a nossa API!" });
});

// Register User
app.post("/auth/register", async (req, res) => {
  const { name, username, password } = req.body;

  // Validations
  const result = registerUserSchema.safeParse(req.body);
  if (!result.success)
    return res.status(422).json({ msg: result.error?.errors[0].message });

  // Check if user exists
  const userExists = await User.findOne({ username: username });
  if (userExists) {
    return res
      .status(422)
      .json({ msg: "O username utilizado já está em uso!" });
  }

  // Create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = new User({
    name,
    username,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

// Login User
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  // Validations
  const result = loginSchema.safeParse(req.body);
  if (!result.success)
    return res.status(422).json({ msg: result.error?.errors[0].message });

  // Check if user exists
  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(404).json({ msg: "Usuario não encontrado!" });
  }

  // Check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res
      .status(200)
      .json({
        msg: "Autenticação realizada com sucesso!",
        token,
        id: user._id,
      });
  } catch {
    console.log(error);
    res.status(500).json({
      msg: "Aconteceu um erro no servidor, tente novamente mais tarde!",
    });
  }
});

// --- Private Route --- //

// -- User -- //

app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // Check id params
  const result = userSchema.safeParse({ id: id });
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check if user exists
  const user = await User.findById(id, "-password");
  if (!user) {
    return res.status(404).json({ msg: "Usuario não encontrado!" });
  }
  res.status(200).json(user);
});

// -- Supplier -- //

app.get("/supplier", checkToken, async (req, res) => {
  // Check if supplier exists
  const supplier = await Supplier.find();
  if (supplier.length === 0) {
    return res.status(404).json({ msg: "Fornecedor não encontrado!" });
  }
  res.status(200).json({ supplier });
});

app.get("/supplier/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // Check id params
  const result = supplierSchema.safeParse({ id: id });
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check if supplier exists
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    return res.status(404).json({ msg: "Fornecedor não encontrado!" });
  }

  res.status(200).json({ supplier });
});

app.post("/supplier/create", checkToken, async (req, res) => {
  const { name } = req.body;

  // Validations
  const result = supplierSchema.safeParse({ name: name });
  if (!result.success)
    return res.status(422).json({ msg: result.error?.errors[0].message });

  // Check if supplier exists
  const supplierExists = await Supplier.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (supplierExists) {
    return res.status(422).json({ msg: "Este fornecedor já existe!" });
  }

  // Create supplier
  const supplier = new Supplier({
    name,
  });

  try {
    await supplier.save();
    res.status(201).json({ msg: "Fornecedor criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

app.put("/supplier/:id", checkToken, async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  // Check id params
  const result = supplierSchema.safeParse({ id: id, name: name });
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check supplier exists
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    return res.status(404).json({ msg: "Fornecedor não encontrado!" });
  }

  // Check if the name is already in use
  const nameExists = await Supplier.findOne({ name: name });
  if (nameExists) {
    return res.status(422).json({ msg: "Este nome já está em uso!" });
  }
  try {
    await Supplier.findByIdAndUpdate(id, { name });
    res.status(201).json({ msg: "Fornecedor alterado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

app.delete("/supplier/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // Check id params
  const result = supplierSchema.safeParse({ id: id });
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check supplier exists
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    return res.status(404).json({ msg: "Fornecedor não encontrado!" });
  }

  try {
    await Supplier.findByIdAndDelete(id);
    res.status(201).json({ msg: "Fornecedor deletado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

// -- Product -- //

app.get("/product", checkToken, async (req, res) => {
  // Check if product exists
  const product = await Product.find();
  if (product.length === 0) {
    return res.status(404).json({ msg: "Produto não encontrado!" });
  }
  res.status(200).json({ product });
});

app.get("/product/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // Check id params
  const result = productSchema.safeParse({ id: id });
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check if product exists
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ msg: "Produto não encontrado!" });
  }
  res.status(200).json({ product });
});

app.post("/product/create", checkToken, async (req, res) => {
  const { name } = req.body;

  // Validations
  const result = productSchema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check if product exists | Com a alteração, a comparação é feita com todas as letras minusculas, tanto o resultado que vem do banco quanto o que fornecemos na api
  const productExists = await Product.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (productExists) {
    return res.status(422).json({ msg: "Este produto já existe!" });
  }

  // Create product
  const product = new Product({
    name,
    quantity: 0,
  });

  try {
    await product.save();
    res.status(201).json({ msg: "Produto criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

app.put("/product/:id", checkToken, async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  // Validations
  const result = productSchema.safeParse({
    id: id,
    name: name,
  });
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check product exists
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ msg: "Produto não encontrado!" });
  }

  // Check if the name is already in use
  const nameExists = await Product.findOne({ name: name });
  if (nameExists) {
    return res.status(422).json({ msg: "Este nome já está em uso!" });
  }
  try {
    await Product.findByIdAndUpdate(id, { name });
    res.status(201).json({ msg: "Produto alterado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

app.delete("/product/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // Validations
  const result = productSchema.safeParse({ id: id });
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check supplier exists
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ msg: "Produto não encontrado!" });
  }

  // Check if product is over
  if (product.quantity !== 0) {
    return res.status(404).json({ msg: "O produto não está zerado!" });
  }

  try {
    await Product.findByIdAndDelete(id);
    res.status(201).json({ msg: "Produto deletado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

// -- Entry -- //

app.get("/entry", checkToken, async (req, res) => {
  // Check if entry exists
  const entry = await Entry.find();

  if (entry.length === 0) {
    return res.status(404).json({ msg: "Entrada não encontrada!" });
  }
  res.status(200).json({ entry });
});

app.get("/entry/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // Check if entry exists
  const entry = await Entry.findById(id);
  if (!entry) {
    return res.status(404).json({ msg: "Entrada não encontrado!" });
  }

  res.status(200).json({ entry });
});

app.post("/entry/create", checkToken, async (req, res) => {
  const { supplierId, buy, author } = req.body;
  const currentDate = new Date();
  const entryObject = [];

  // Validations
  const result = entrySchema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check if supplier exists
  const supplierExists = await Supplier.findById(supplierId);
  if (!supplierExists) {
    return res.status(404).json({ msg: "Fornecedor não encontrado!" });
  }

  // Check if user exists
  const userExists = await User.findOne({ _id: new ObjectId(author) });
  if (!userExists) {
    return res.status(404).json({ msg: "Usuario não encontrado!" });
  }

  buy.forEach(function (buy) {
    entryObject.push({
      date: currentDate,
      supplierId,
      materialName: buy.materialName,
      quantity: buy.quantity,
      totalValue: buy.totalValue,
      author,
    });
  });

  try {
    // Tive que trocar o "foreach" por "for of" porque o "foreach" não aceita return.
    // Esse "for of" checará se todos os materiais da compra existem no banco.
    for (const object of entryObject) {
      const product = await Product.findOne({ name: object.materialName });

      if (!product) {
        return res.status(404).json({
          msg: "Alguns produtos não estão cadastrados. A compra não foi realizada!",
        });
      }
    }

    // Esse "for of" acrescentará a quantidade comprada em cada material.
    for (const object of entryObject) {
      const product = await Product.findOne({ name: object.materialName });
      await Product.updateMany(
        { name: object.materialName },
        { quantity: product.quantity + Number(object.quantity) }
      );
    }

    // Insere o array de compras no banco
    await Entry.insertMany(entryObject);

    res.status(201).json({ msg: "Entrada registrada com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

// Fazer rota PUT

app.delete("/entry/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // Validations
  const result = entrySchema.safeParse({ id: id });
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check supplier exists
  const entry = await Entry.findById(id);
  if (!entry) {
    return res.status(404).json({ msg: "Entrada não encontrada!" });
  }

  try {
    await Entry.findByIdAndDelete(id);
    res.status(201).json({ msg: "Entrada deletada com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

// -- Exit -- //

app.post("/exit/create", checkToken, async (req, res) => {
  const { materialName, quantity, author } = req.body;
  const currentDate = new Date();

  // Validations
  const result = exitSchema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ msg: result.error?.errors[0].message });

  // Check if materialName exists
  const materialNameExists = await Product.findOne({
    name: { $regex: `^${materialName}$`, $options: "i" },
  });
  if (!materialNameExists) {
    return res.status(422).json({ msg: "Material não existe!" });
  }
  if (materialNameExists.quantity < quantity) {
    return res
      .status(422)
      .json({
        msg: "A quantidade que está sendo retirada é maior que o total",
      });
  }

  // Create Exit
  const exit = new Exit({
    date: currentDate,
    materialName,
    quantity,
    author,
  });

  try {
    await Product.updateOne(
      { name: materialName },
      { quantity: materialNameExists.quantity - Number(quantity) }
    );
    await exit.save();
    res.status(201).json({ msg: "Saída registrada com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Erro ao tentar se conectar com o servidor, tente novamente mais tarde!",
    });
  }
});

app.get("/exit", checkToken, async (req, res) => {
  // Check if entry exists
  const exit = await Exit.find();

  if (exit.length === 0) {
    return res.status(404).json({ msg: "Entrada não encontrada!" });
  }
  res.status(200).json({ exit });
});

// -- Missing Product -- //

app.get("/missing", checkToken, async (req, res) => {
  const missingProduct = await Product.find({ quantity: 0 });

  if (missingProduct.length === 0) {
    return res
      .status(404)
      .json({ msg: "Não foi encontrado produtos em falta!" });
  }
  res.status(200).json({ missingProduct });
});

// Function - Check Token

function checkToken(req, res, next) {
  const authHeader = req.header("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: "Token inválido!" });
  }
}

// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.e8yw0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectou ao banco!");
  })
  .catch((err) => console.log(err));

// Sua URL Pedro
// @cluster0.btgpk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

/* Alterações */

/**
 * Todas as rotas estão com validação nos campos.
 *
 * Todas as rotas que passam o ID passaram a ter uma checagem se o formato desse ID é válido.
 *
 * O model User passou a ter o campo username ao invés de email.
 *
 * O model Product passou a ter o campo quantity ao invés de amount.
 *
 * Agora, ao criar o produto não é passado a quantidade do produto. (Quando eles forem incluir o estoque atual, nós avisamos para incluir como uma compra e com valor 0)
 *
 * Agora, ao atualizar o produto não é passado a quantidade.
 *
 * Finalizei a entrada de produtos POST.
 */
