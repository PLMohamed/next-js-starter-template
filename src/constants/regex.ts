interface RegexType {
    [key: string]: RegExp;
}

export default {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    PASSWORD_LETTERS: /[A-Za-z]/,
    PASSWORD_NUMBERS: /\d/,
    PASSWORD_SPECIAL_CHARACTERS: /[!@#$%^&*]/,
    USERNAME: /^[a-zA-Z0-9]{3,}$/,
} satisfies RegexType;