import { LoginRequest, SignupRequest } from "@/types/request/auth";
import Yup, { tn } from "./yup";

export function createLoginValidator(translator: (key: string) => string = key => key): Yup.Schema<LoginRequest> {
    const t = tn.bind(null, translator);

    return Yup.object({
        email: Yup.string().email(t("invalidEmail", "Invalid Email")).required(t("required", "Email is Required")),
        password: Yup.string().required(t("required", "Password is Required"))
    });
}

export function createSignupValidator(translator: (key: string) => string = key => key): Yup.Schema<SignupRequest> {
    const t = tn.bind(null, translator);

    return Yup.object({
        email: Yup.string().email(t("invalidEmail", "Invalid Email")).required(t("required", "Email is Required")),
        password: Yup.string().required(t("required", "Password is Required")),
        confirmPassword: Yup.string().required(t("required", "Confirm Password is Required")).oneOf([Yup.ref("password")], t("passwordMismatch", "Passwords do not match")),
        name: Yup.string().required(t("required", "Name is Required"))
    });
}