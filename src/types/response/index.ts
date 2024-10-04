export interface ListResponse<T> {
    data: T[];
    page: number;
}

export type APIResponse<T = Record<string, any>> = {
    message: string;
    messageTranslationCode: string;
    [key: string]: any;
} & T;