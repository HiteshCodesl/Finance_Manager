
type Role = VIEWER | ANALYST | ADMIN;

declare namespace Express{
    export interface Request{
       user?: {
        id: string;
        role: Role;
      };
    }
}