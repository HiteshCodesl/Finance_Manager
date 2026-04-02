
type Role = VIEWER | ANALYST | ADMIN;

declare namespace Express{
    export interface Request{
        id: string,
        role: string,
        user: Role
    }
}