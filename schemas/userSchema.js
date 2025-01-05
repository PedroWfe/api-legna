const z = require("zod");

const userSchema = z.object({
  id: z.string().refine(
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
  ),
});

module.exports = userSchema;
