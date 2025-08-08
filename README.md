**“GraphQL in a Nutshell”**

## **1️⃣ GraphQL Basics**

- **Single endpoint** (`/graphql`)
- **Ask only what you need**, get exactly that back
- Three operation types:

  - **Query** → Read data
  - **Mutation** → Write/modify data
  - **Subscription** → Real-time updates

---

## **2️⃣ Schema (SDL – Schema Definition Language)**

```graphql
type User {
  id: ID!
  name: String!
}

type Query {
  getUser(id: ID!): User
}

type Mutation {
  createUser(name: String!): User
}
```

- `!` = non-nullable
- `ID` can be string or int
- `[Type]` = list of items

---

## **3️⃣ Resolvers**

Functions that actually fetch the data.

```js
const resolvers = {
  Query: {
    getUser: (_, { id }) => users.find((u) => u.id === id),
  },
  Mutation: {
    createUser: (_, { name }) => {
      const newUser = { id: Date.now().toString(), name };
      users.push(newUser);
      return newUser;
    },
  },
};
```

- **Parent** = result of the previous resolver in the chain
- **Args** = parameters passed from query/mutation
- **Context** = shared data (auth, DB connection, etc.)

---

## **4️⃣ Example Query & Response**

```graphql
query {
  getUser(id: "1") {
    name
  }
}
```

**Response:**

```json
{
  "data": {
    "getUser": { "name": "John" }
  }
}
```
