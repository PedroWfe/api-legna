const z = require("zod");

const registerUserSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "O campo nome é obrigatório!" })
      .refine((data) => data.trim(), {
        message: "O campo nome é obrigatório!",
      }),
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
          message: "O campo nome de usuário deve ter um formato válido!",
        }
      ),
    password: z
      .string()
      .min(1, { message: "O campo senha é obrigatório!" })
      .refine((data) => data.trim(), {
        message: "O campo senha é obrigatório!",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "O campo confirmar senha é obrigatório!" })
      .refine((data) => data.trim(), {
        message: "O campo confirmar senha é obrigatório!",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem!",
  });

module.exports = registerUserSchema;
