import { Collection } from "mongodb";
import { Autor, Book, ModelAutor, ModelBook } from "./types.ts";

export const ModelToBook = async(
    bookDB:ModelBook,
    autoresCollection:Collection<ModelAutor>,

):Promise<Book> => {
    const autores = await autoresCollection.find({_id:{$in:bookDB.autores}}).toArray();
    return{
        id:bookDB._id!.toString(),
        titulo:bookDB.titulo,
        copiasDisponibles: bookDB.copiasDisponibles,
        autores:autores.map((a) => ModelToAutor(a))
    };

}

export const ModelToAutor = (model:ModelAutor):Autor =>({
    id:model._id!.toString(),
    nombrecompleto:model.nombrecompleto,
    bibliografia:model.bibliografia,
});