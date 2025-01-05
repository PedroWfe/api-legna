const z = require("zod");

const exitSchema = z.object({
  author: z.string().refine((data) => {
    if (!data.trim()) { return false; }

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
  materialName: z.string().min(1, { message: "O campo nome do material é obrigatorio" }).refine((data) => data.trim(), { message: "O campo nome do material é obrigatorio" }).optional(),
  quantity: z.number().positive({ message: "A quantidade deve ser maior que zero!" })
});


module.exports = exitSchema;
