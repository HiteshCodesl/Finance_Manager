import z from "zod";

const RoleEnum = z.enum(["INCOME", "EXPENSE"]);

export const insertRecordSchema = z.object({
    amount : z.number(),
    type : RoleEnum,
    category : z.string(),
    notes : z.string()
})

