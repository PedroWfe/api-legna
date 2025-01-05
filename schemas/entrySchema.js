const z = require("zod");

const entrySchema = z.object({
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
        message: "Formato inválido!",
      }
    )
    .optional(),
  supplierId: z
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
        message: "O id do fornecedor está em um formato inválido!",
      }
    )
    .optional(),
  buy: z
    .array(
      z.object({
        materialName: z
          .string()
          .min(1, { message: "O nome do material é obrigatório!" })
          .refine((data) => data.trim(), {
            message: "O nome do material é obrigatório!",
          }),
        quantity: z
          .number()
          .positive({ message: "A quantidade deve ser maior que zero!" }),
        totalValue: z
          .number()
          .positive({ message: "O valor total deve ser maior que zero!" }),
      })
    )
    .optional(),
  author: z
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
        message: "O id do autor está em formato inválido!",
      }
    )
    .optional(),
});

module.exports = entrySchema;
