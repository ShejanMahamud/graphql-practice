import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
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
        type Post {
            userid: ID!
            id: ID!
            title: String!
            description: String!
            user: User!
            iscompleted: Boolean!
        }
        type User {
            id: String!
            email: String!
            name: String!
            posts: [Post!]!
        }
        type Query {
            getPost(id: ID!): Post!
            getPosts: [Post!]!
            getUser(id: ID!): User!
        }
        input UpdateUserInput {
          email: String
          name: String
        }
        type Mutation {
            createUser (email: String!, name: String!): User!
            createPost (title: String!, description: String!, isCompleted: Boolean!, userid: ID!): Post!
            updateUser (id: ID!, input: UpdateUserInput!): User!
            deleteUser (id: ID!): String!
        }
    `,
    resolvers: {
      Query: {
        getPost: async (_parent: any, args: { id: number }) => {
          try {
            const result = await pool.query(
              `
                    SELECT * FROM posts WHERE id = $1
                `,
              [args.id]
            );
            return result.rows[0];
          } catch (error) {
            return error;
          }
        },
        getPosts: async () => {
          try {
            const result = await pool.query(`
                        SELECT * FROM posts
                    `);
            return result.rows;
          } catch (error) {
            return error;
          }
        },
        getUser: async (_parent: any, args: { id: string }) => {
          try {
            const result = await pool.query(
              `
                SELECT * FROM users WHERE id = $1
                `,
              [args.id]
            );
            return result.rows[0];
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
        createPost: async (
          _,
          args: {
            title: string;
            description: string;
            iscompleted: boolean;
            userid: number;
          }
        ) => {
          try {
            const result = await pool.query(
              `
                    INSERT INTO posts (title,description,iscompleted,userid) VALUES ($1, $2, $3, $4) RETURNING *
                    `,
              [args.title, args.description, args.iscompleted, args.userid]
            );
            return result.rows[0];
          } catch (error) {
            return error;
          }
        },
        updateUser: async (
          _,
          args: { id: string; input: Record<string, any> }
        ) => {
          const fields = Object.keys(args.input);
          const values = Object.values(args.input);
          const setClause = fields
            .map((field, idx) => `${field} = $${idx + 1}`)
            .join(", ");
          try {
            const result = await pool.query(
              `
                UPDATE users SET ${setClause} WHERE id = $${
                fields.length + 1
              } RETURNING *
              `,
              [...values, args.id]
            );
            return result.rows[0];
          } catch (error) {
            return error;
          }
        },
        deleteUser: async (__dirname, args: { id: string }) => {
          try {
            await pool.query(
              `
              DELETE FROM users WHERE id = $1  
              `,
              [args.id]
            );
            return "User deleted Successfully";
          } catch (error) {
            return error;
          }
        },
      },
      Post: {
        user: async (parent: { userid: number }) => {
          console.log(parent);
          try {
            const result = await pool.query(
              `
                SELECT * FROM users WHERE ID = $1
                `,
              [parent.userid]
            );
            return result.rows[0];
          } catch (error) {
            return error;
          }
        },
      },
      User: {
        posts: async (parent: { id: string }) => {
          try {
            const result = await pool.query(
              `
                SELECT * FROM posts WHERE userid = $1
                `,
              [parent.id]
            );
            return result.rows;
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
