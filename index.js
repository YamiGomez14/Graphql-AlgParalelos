import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import cluster from "cluster"
import os from 'os'

const numCPUs=os.cpus().length;
if (cluster.isPrimary) {
  console.log(`Numeros de CPU ${numCPUs}`);
  console.log(`Principal ${process.pid} corre`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} muerto`);
    cluster.fork();
  });

} else {
  Inicio();
}
async function Inicio() {

const typeDefs = `#graphql
  #.

  # Este tipo "Book" define los Query para buscar los libros .
  type Libro {
    titulo: String
    autor: String
  }

  # Query muestra los querys que se definieron para usar
  type Query {
    libros: [Libro]
  }
`;
const libros = [
  {
    titulo: 'Libro1',
    autor: 'Autor1',
  },
  {
    titulo: 'Libro2',
    autor: 'Autor2',
  },
];

const resolvers = {
  Query: {
    libros: () => libros,
  },
};
// Añado el schema y el resolver al servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
});


const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
}