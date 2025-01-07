const z = require("zod");

const productSchema = z.object({
  id: z
    .string()
    .refine(
      (data) => {
        if (!data.trim) {
          return false;
        }

        if (!/^[a-f0-9]{24}$/.test(data)) {
          return false; // Aceita apenas o ID no formato mongoDB
        }

        return true;
      },
      {
        message: "Id do produto está com um formato inválido!",
      }
    )
    .optional(),
  name: z
    .string()
    .min(1, { message: "O campo nome do produto é obrigatório!" })
    .refine((data) => data.trim(), {
      message: "O campo nome do produto é obrigatório!",
    })
    .optional(),
  quantity: z
    .string()
    .min(1, { message: "O campo quantidade é obrigatório!" })
    .refine(
      (data) => {
        if (!data.trim()) {
          return false;
        }

        if (!/^[0-9]+$/.test(data)) {
          return false; // Aceita apenas números inteiros
        }

        return true;
      },
      {
        message: "O valor do campo quantidade é inválido!",
      }
    )
    .optional(),
});

module.exports = productSchema;
