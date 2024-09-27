import { REGEX } from "@/constants/regex";
import * as Yup from "yup";

export function tn(t: (key: string) => string, clientMsg: string, serverMsg: string): string {
    const isServer: boolean = typeof window === "undefined";

    return isServer ? serverMsg : t(clientMsg);
}

Yup.addMethod(Yup.string, "minTrim", function (min: number, message: string) {
    return this.test("min-trim", message, value => {
        const trimmedValue = value?.replace(/\s/g, "") ?? "";
        return trimmedValue.length >= min;
    });
});

// override email method
Yup.addMethod(Yup.string, "email", function (message: string) {
    return this.test("email", message, value => {
        return !value || REGEX.EMAIL.test(value);
    });
});

export default Yup;
