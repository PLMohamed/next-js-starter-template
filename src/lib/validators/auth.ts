import Yup, { tn } from "./yup";

export function createLoginValidator(translator: (key: string) => string = key => key) {
    const t = tn.bind(null, translator);

    return Yup.object({
        email: Yup.string().email(t("invalidEmail", "Invalid Email")).required(t("required", "Email is Required")),
        password: Yup.string().required(t("required", "Password is Required"))
    });
}