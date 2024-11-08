import { ObjectId, OptionalId } from 'mongodb'

export type ModelBook = OptionalId<{
    titulo:string;
    copiasDisponibles:number;
    autores:ObjectId[];
  }>;
  export type Book ={
    id:string;
    titulo:string;
    autores:Autor[];
    copiasDisponibles:number;
  };
  export type ModelAutor = OptionalId<{
    nombrecompleto:string;
    bibliografia:string;
  }>;
  export type Autor ={
    id:string;
    nombrecompleto:string;
    bibliografia:string;
  };
  