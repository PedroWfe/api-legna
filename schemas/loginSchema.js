const z = require("zod");

const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "O campo nome de usuário é obrigatório!" })
    .refine(
      (data) => {
        if (!data.trim()) {
          return false; // Campo não pode ser vazio
        }
        if (!/^[a-zA-Z0-9_]+$/.test(data)) {
          return false; // Deve conter apenas caracteres válidos
        }
        return true;
      },
      {
        message: "O campo nome de usuário é obrigatório!",
      }
    ),
  password: z
    .string()
    .min(1, { message: "O campo senha é obrigatório!" })
    .refine((data) => data.trim(), {
      message: "O campo senha é obrigatório!",
    }),
});

module.exports = loginSchema;
