import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import axios from "axios";

const main = async () => {
  const server = new ApolloServer({
    typeDefs: `#graphql
        type Todos {
            userId: String!
            id: ID!
            title: String!
            completed: Boolean!
        }
        type Query {
            getTodos(id: ID!): Todos!
        }
    `,
    resolvers: {
      Query: {
        getTodos: async (_parent: any, arg: { id: string }) => {
          const { data } = await axios.get(
            `https://jsonplaceholder.typicode.com/todos/${arg.id}`
          );
          return data;
        },
      },
    },
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`Server ready at ${url}`);
};

main();
