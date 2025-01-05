const z = require("zod");

const supplierSchema = z.object({
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
  name: z
    .string()
    .min(1, { message: "O campo nome do fornecedor é obrigatório!" })
    .refine((data) => data.trim(), {
      message: "O campo nome do fornecedor é obrigatório!",
    })
    .optional(),
});

module.exports = supplierSchema;
