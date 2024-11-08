import { MongoClient, ObjectId } from 'mongodb'
import { ModelAutor, ModelBook } from "./types.ts";
import { ModelToAutor, ModelToBook } from "./utils.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL){
  console.error("No se a podido extraer MONGO_URL");
  Deno.exit(1);
}
const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Conectado");
const db = client.db("nebrijadb");
const autorescollection = db.collection<ModelAutor>("autores");
const bookscollection = db.collection<ModelBook>("books");

const handler = async(req:Request):Promise<Response> => {
  const method = req.method;
  const url = new URL (req.url);
  const PATH = url.pathname;

  if(method === "POST"){
    if(PATH === "/libro"){
      const book = await req.json();
      if(!book.titulo ||!book.autores || !book.copiasDisponibles){
        return new Response("El título y los autores son campos requeridos",{status:400});
      }
      const bookdb =await bookscollection.find({_id:{$in:book.id}});
      if(!bookdb) return new Response("Autores no exiten",{status:400}); 
      //comprobar que los autores existen
      const {insertedId} = await bookscollection.insertOne(
        {
          titulo: book.titulo,
          copiasDisponibles:book.copiasDisponibles,
          //autores: bookdb.map((b)=>ModelToAutor(b)),
          autores:[],
        }
      );
      return new Response(JSON.stringify({
        id:insertedId,
        titulo: book.titulo,
        autores: book.autores,
        copiasDisponibles:book.copiasDisponibles,
      }),{status:201});
    }
    else if(PATH === "/autor"){
      const autor = await req.json();
      if(!autor.nombrecompleto ||!autor.bibliografia){
        return new Response("El nombre del autor y la biografía son campos requeridos.",{status:400});
      }
      const {insertedId} = await autorescollection.insertOne(
        {
          nombrecompleto: autor.nombrecompleto,
          bibliografia:autor.bibliografia
        }
      );
      return new Response(JSON.stringify(JSON.stringify({
        id:insertedId,
        nombrecompleto:autor.nombrecompleto,
        bibliografia:autor.bibliografia

      })),{status:201});  //modificar si tengo tiempo

    }
  }
  if(method === "GET"){
    if(PATH === "/libros"){
      const id = url.searchParams.get("id");
      if (id){
      const bookdb = await bookscollection.findOne({_id:new ObjectId(id)});
      if(!bookdb) return new Response("Libro no encontrado",{status:404});
      const book = await ModelToBook(bookdb,autorescollection);
      return new Response(JSON.stringify(book),{status:200});
      }

      const bookdb = await bookscollection.find().toArray();
      const books = await Promise.all(bookdb.map((b) => ModelToBook(b,autorescollection)));
      return new Response(JSON.stringify(books),{status:200});

    }
  }
  if(method === "PUT"){
    if(PATH === "/libro"){
      const book = await req.json();
      if(!book.titulo ||!book.autores || !book.copiasDisponibles){
        return new Response("El título y los autores son campos requeridos",{status:400});
      }
      const {modifiedCount} = await bookscollection.updateOne(
        {_id:book.id},
        {$set: {titulo:book.id,autores:book.autores,copiasDisponibles:book.copiasDisponibles}}
      );
      if (modifiedCount === 0){
        return new Response("No modificado",{status:400});
      }
      return new Response("Modificado",{status:200});

    }
  }
  if(method === "DELETE"){
    if(PATH === "/libro"){
      const id = url.searchParams.get("id");
      if(!id) return new Response("Libro no encontrado.",{status:404});
      const {deletedCount} = await bookscollection.deleteOne(
        {_id:new Object(id)}
      );
      if(deletedCount === 0){
        return new Response("Libro no encontrado.",{status:404}); 
      }
      return new Response("Libro eliminado exitosamente.",{status:200});
    }
  }
return new Response("No endpoint",{status:404});

}



Deno.serve({ port: 3000 }, handler);
