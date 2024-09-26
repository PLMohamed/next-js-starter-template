import { StringSchema as _StringSchema } from "yup";

declare module "yup" {
    interface StringSchema {
        minTrim(min: number, message: string): this;
    }
}