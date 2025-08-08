import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import axios from "axios";
import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "graphql_practice",
  password: "36987",
  port: 5432,
});

const main = async () => {
  const server = new ApolloServer({
    typeDefs: `#graphql
        type Todo {
            userId: String!
            id: ID!
            title: String!
            user: User!
            completed: Boolean!
        }
        type User {
            id: String!
            email: String!
            name: String!
            todos: [Todo!]!
        }
        type Query {
            getTodo(id: ID!): Todo!
            getUser(id: ID!): User!
        }
        type Mutation {
            createUser (email: String!, name: String!): User!
        }
    `,
    resolvers: {
      Query: {
        getTodo: async (_parent: any, arg: { id: string }) => {
          try {
            const { data } = await axios.get(
              `https://jsonplaceholder.typicode.com/todos/${arg.id}`
            );
            return data;
          } catch (error) {
            return error;
          }
        },
        getUser: async (_parent: any, arg: { id: string }) => {
          try {
            const { data } = await axios.get(
              `https://jsonplaceholder.typicode.com/users/${arg.id}`
            );
            return data;
          } catch (error) {
            return error;
          }
        },
      },
      Mutation: {
        createUser: async (
          _parent: any,
          args: { email: string; name: string }
        ) => {
          try {
            const result = await pool.query(
              `
                INSERT INTO users (
                email, name
                ) VALUES ($1, $2) RETURNING *
                `,
              [args.email, args.name]
            );
            return result.rows[0];
          } catch (error) {
            return error;
          }
        },
      },
      Todo: {
        user: async (parent: { userId: string }) => {
          try {
            const { data } = await axios.get(
              `https://jsonplaceholder.typicode.com/users/${parent.userId}`
            );
            return data;
          } catch (error) {
            return error;
          }
        },
      },
      User: {
        todos: async (parent: { id: string }) => {
          try {
            const { data } = await axios.get(
              `https://jsonplaceholder.typicode.com/todos?userId=${parent.id}`
            );
            return data;
          } catch (error) {
            return error;
          }
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
